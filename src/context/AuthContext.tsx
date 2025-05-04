
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

  // Enhanced checkAuth function with better error handling
  const checkAuth = async () => {
    try {
      setAuthError(null);
      
      // Check if session is valid first
      if (!isSessionValid()) {
        console.log('Session expired or invalid');
        setUser(null);
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      
      const storedUser = getStoredUser();
      
      if (storedUser) {
        // Validate user data format to prevent corrupt data issues
        if (!storedUser.id || !storedUser.email || !storedUser.username) {
          throw new Error('Invalid user data format');
        }
        
        setUser(storedUser);
        
        // Check if key exists for this user
        if (!userKeyExists(storedUser.email)) {
          throw new Error('Authentication key not found');
        }
        
        // Update session activity timestamp
        updateSessionActivity();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthError(error as Error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check auth on initialization
    checkAuth();
    
    // Set up interval to periodically check auth status (every 5 minutes)
    const authCheckInterval = setInterval(() => {
      if (user) {
        // Only update session activity if user is logged in
        updateSessionActivity();
      }
    }, 5 * 60 * 1000);
    
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
      const userData = await loginUser(email, password);
      setUser(userData);
      
      // Update session activity
      updateSessionActivity();
      
      toast({
        title: 'Erfolgreich angemeldet',
        description: `Willkommen zurück, ${userData.username}!`,
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
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
