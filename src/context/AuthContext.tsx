
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
  isSessionValid,
  generateCSRFToken,
  validateCSRFToken
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate-Limiting für wiederholte Anmeldeversuche
const loginRateLimit = (() => {
  const attempts = new Map<string, { count: number; timestamp: number }>();
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000; // 15 Minuten
  
  return {
    check: (identifier: string): boolean => {
      const now = Date.now();
      const record = attempts.get(identifier);
      
      if (!record) {
        attempts.set(identifier, { count: 1, timestamp: now });
        return true;
      }
      
      // Zurücksetzen des Zählers nach Ablauf des Zeitfensters
      if (now - record.timestamp > WINDOW_MS) {
        attempts.set(identifier, { count: 1, timestamp: now });
        return true;
      }
      
      // Zu viele Versuche innerhalb des Zeitfensters
      if (record.count >= MAX_ATTEMPTS) {
        return false;
      }
      
      // Inkrementieren des Zählers
      attempts.set(identifier, { count: record.count + 1, timestamp: record.timestamp });
      return true;
    },
    reset: (identifier: string): void => {
      attempts.delete(identifier);
    }
  };
})();

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
    
    // Interval für regelmäßige Aktivitätsprüfung (alle 10 Minuten)
    const authCheckInterval = setInterval(() => {
      if (user) {
        // Nur Sessionaktivität aktualisieren, wenn Benutzer angemeldet ist
        updateSessionActivity();
      }
    }, 10 * 60 * 1000);
    
    // Content Security Policy-Header-Prüfung
    const metaCSP = document.createElement('meta');
    metaCSP.httpEquiv = 'Content-Security-Policy';
    metaCSP.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;";
    document.head.appendChild(metaCSP);
    
    // Event-Listener für Speicher-Änderungen, um Account-Hijacking zu erkennen
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue !== e.oldValue) {
        console.warn('User storage changed externally, verifying...');
        checkAuth(); // Session erneut überprüfen
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
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
    
    // Überprüfung der Rate-Limitierung
    const ipIdentifier = 'client-' + (navigator.userAgent || 'unknown');
    if (!loginRateLimit.check(ipIdentifier)) {
      toast({
        title: 'Zu viele Anmeldeversuche',
        description: 'Bitte versuchen Sie es später erneut',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Too many login attempts, please try again later'));
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
      
      // Rate-Limit zurücksetzen bei erfolgreicher Anmeldung
      loginRateLimit.reset(ipIdentifier);
      
      // Sicherheitslog für erfolgreiche Anmeldung
      console.log('Erfolgreiche Anmeldung:', { 
        timestamp: new Date().toISOString(),
        user: userData.email,
        userAgent: navigator.userAgent
      });
      
      toast({
        title: 'Erfolgreich angemeldet',
        description: `Willkommen zurück, ${userData.username}!`,
      });
      
      // Neuen CSRF-Token für die Session generieren
      generateCSRFToken();
      
      navigate('/home');
    } catch (error) {
      console.error('Login fehlgeschlagen:', error);
      
      // Detailliertere Fehlermeldungen
      let errorMessage = 'Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut';
      if (error instanceof Error) {
        if (error.message.includes('Ungültige Anmeldeinformationen')) {
          errorMessage = 'Ungültige E-Mail oder Passwort';
        } else if (error.message.includes('fehlgeschlagene Anmeldeversuche')) {
          errorMessage = error.message;
        } else if (error.message.includes('Timeout')) {
          errorMessage = 'Die Anmeldung dauert zu lange. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
        }
      }
      
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: errorMessage,
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
    
    // Username validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: 'Ungültiger Benutzername',
        description: 'Der Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Invalid username format'));
    }
    
    // Password validation - mehr Komplexität für bessere Sicherheit
    if (password.length < 8) {
      toast({
        title: 'Passwort zu kurz',
        description: 'Das Passwort muss mindestens 8 Zeichen lang sein',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Password too short'));
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      toast({
        title: 'Passwort zu schwach',
        description: 'Das Passwort muss Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen enthalten',
        variant: 'destructive',
      });
      return Promise.reject(new Error('Password not complex enough'));
    }
    
    setLoading(true);
    try {
      const userData = await registerUser(username, email, password);
      setUser(userData);
      
      // Update session activity
      updateSessionActivity();
      
      // Sicherheitslog für erfolgreiche Registrierung
      console.log('Erfolgreiche Registrierung:', { 
        timestamp: new Date().toISOString(),
        user: userData.email,
        userAgent: navigator.userAgent
      });
      
      toast({
        title: 'Registrierung erfolgreich',
        description: 'Ihr Konto wurde erfolgreich erstellt',
      });
      
      // Neuen CSRF-Token für die Session generieren
      generateCSRFToken();
      
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
      // Sicherheitslog vor dem Abmelden
      if (user) {
        console.log('Benutzer wird abgemeldet:', { 
          timestamp: new Date().toISOString(),
          user: user.email,
          userAgent: navigator.userAgent
        });
      }
      
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

  // CSRF-Token-Validierung für die Formularübermittlung zugänglich machen
  const validateCSRF = (token: string): boolean => {
    return validateCSRFToken(token);
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
        retryAuth,
        validateCSRF // Neue Funktion für die CSRF-Token-Validierung
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
