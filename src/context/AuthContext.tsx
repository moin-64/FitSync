
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, AuthContextType } from '../types/auth';
import { 
  getStoredUser, 
  loginUser, 
  registerUser, 
  logoutUser,
  userKeyExists,
  updateSessionActivity,
  isSessionValid
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Optimierte checkAuth-Funktion mit verbessertem Timeout-Handling
  const checkAuth = async () => {
    // Timeout für Auth-Check setzen
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Auth-Check Timeout')), 3000);
    });
    
    try {
      setAuthError(null);
      
      // Race zwischen Auth-Check und Timeout
      await Promise.race([
        (async () => {
          // Prüfen, ob Session gültig ist
          if (!isSessionValid()) {
            console.log('Session abgelaufen oder ungültig');
            setUser(null);
            localStorage.removeItem('user');
            return;
          }
          
          const storedUser = getStoredUser();
          
          if (storedUser) {
            if (!storedUser.id || !storedUser.email || !storedUser.username) {
              throw new Error('Ungültiges Benutzerdatenformat');
            }
            
            setUser(storedUser);
            
            if (!userKeyExists(storedUser.email)) {
              throw new Error('Authentifizierungsschlüssel nicht gefunden');
            }
            
            updateSessionActivity();
          }
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Authentifizierungsprüfung fehlgeschlagen:', error);
      setAuthError(error as Error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Authentifizierung beim Start prüfen
    const initAuth = async () => {
      await checkAuth();
    };
    
    initAuth();
    
    // Interval für regelmäßige Aktivitätsprüfung (alle 10 Minuten statt 5)
    const authCheckInterval = setInterval(() => {
      if (user) {
        // Nur Sessionaktivität aktualisieren, wenn Benutzer angemeldet ist
        updateSessionActivity();
      }
    }, 10 * 60 * 1000);
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, [user]);

  const retryAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  const login = async (email: string, password: string): Promise<void> => {
    if (!email || !password) {
      toast({
        title: 'Fehlende Anmeldedaten',
        description: 'Bitte geben Sie E-Mail und Passwort ein',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Email and password are required'));
    }
    
    setLoading(true);
    try {
      // Schnellere Login-Timeout-Zeit
      const loginPromise = loginUser(email, password);
      const timeoutPromise = new Promise<User>((_, reject) => {
        setTimeout(() => reject(new Error('Anmeldung hat zu lange gedauert')), 5000);
      });
      
      const userData = await Promise.race([loginPromise, timeoutPromise]);
      setUser(userData);
      
      updateSessionActivity();
      
      toast({
        title: 'Erfolgreich angemeldet',
        description: `Willkommen zurück, ${userData.username}!`,
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Login fehlgeschlagen:', error);
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: 'Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut',
        variant: 'destructive',
      });
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    // Input validation
    if (!username || !email || !password) {
      toast({
        title: 'Fehlende Informationen',
        description: 'Bitte füllen Sie alle erforderlichen Felder aus',
        variant: 'destructive',
      });
      return Promise.reject(new Error('All fields are required'));
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Ungültige E-Mail',
        description: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Invalid email format'));
    }
    
    // Password validation
    if (password.length < 6) {
      toast({
        title: 'Passwort zu kurz',
        description: 'Das Passwort muss mindestens 6 Zeichen lang sein',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Password too short'));
    }
    
    setLoading(true);
    try {
      const userData = await registerUser(username, email, password);
      setUser(userData);
      
      // Update session activity
      updateSessionActivity();
      
      toast({
        title: 'Registrierung erfolgreich',
        description: 'Ihr Konto wurde erfolgreich erstellt',
      });
      
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Bei der Erstellung Ihres Kontos ist ein Problem aufgetreten';
      if (error instanceof Error) {
        if (error.message.includes('E-Mail existiert bereits')) {
          errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Registrierung fehlgeschlagen',
        description: errorMessage,
        variant: 'destructive',
      });
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      logoutUser();
      
      toast({
        title: 'Abgemeldet',
        description: 'Sie wurden erfolgreich abgemeldet',
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Fehler bei der Abmeldung',
        description: 'Es gab ein Problem bei der Abmeldung',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        retryAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
