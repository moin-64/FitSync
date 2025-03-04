
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptData, decryptData, generateKeyPair } from '../utils/encryption';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  retryAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key storage constants
const USER_KEY = 'user';
const KEY_PREFIX = 'secure_key-';
const USER_DATA_KEY = 'userData';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth-Prüfung verbessern
  const checkAuth = async () => {
    try {
      setAuthError(null);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Prüfe, ob der Schlüssel für diesen Benutzer existiert
          const userKey = localStorage.getItem(`${KEY_PREFIX}${userData.email}`);
          if (!userKey) {
            throw new Error('Schlüssel nicht gefunden');
          }
        } catch (parseError) {
          console.error('Fehler beim Parsen der Benutzerdaten:', parseError);
          // Ungültige Benutzerdaten löschen
          localStorage.removeItem(USER_KEY);
          setUser(null);
          throw new Error('Fehler beim Laden der Benutzerdaten');
        }
      }
    } catch (error) {
      console.error('Authentifizierungsprüfung fehlgeschlagen:', error);
      setAuthError(error as Error);
      // Benutzer ausloggen bei kritischem Fehler
      setUser(null);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Bei Initialisierung auf Authentifizierung prüfen
    checkAuth();
  }, []);

  // Funktion zum erneuten Authentifizierungsversuch
  const retryAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In einer echten App würde hier ein API-Aufruf zur Validierung der Anmeldeinformationen erfolgen
      // Für Demo-Zwecke simulieren wir die Authentifizierung lokal
      
      // Den privaten Schlüssel für diesen Benutzer abrufen
      const privateKey = localStorage.getItem(`${KEY_PREFIX}${email}`);
      
      if (!privateKey) {
        toast({
          title: 'Anmeldung fehlgeschlagen',
          description: 'Benutzer nicht gefunden oder ungültige Anmeldedaten',
          variant: 'destructive',
        });
        throw new Error('Benutzer nicht gefunden oder ungültige Anmeldedaten');
      }
      
      // Simulieren einer Serverantwort mit Benutzerdaten
      const mockUserResponse = {
        id: `user-${Date.now()}`,
        username: email.split('@')[0],
        email,
      };
      
      // Benutzer im State speichern
      setUser({
        id: mockUserResponse.id,
        username: mockUserResponse.username,
        email: mockUserResponse.email
      });
      
      // In localStorage für Persistenz speichern
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: mockUserResponse.id,
        username: mockUserResponse.username,
        email: mockUserResponse.email
      }));
      
      // Benutzerdaten entschlüsseln und laden
      await decryptUserData(privateKey);
      
      toast({
        title: 'Erfolgreich angemeldet',
        description: `Willkommen zurück, ${mockUserResponse.username}!`,
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Anmeldung fehlgeschlagen:', error);
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: 'Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Prüfen, ob der Benutzer bereits existiert
      const existingKey = localStorage.getItem(`${KEY_PREFIX}${email}`);
      if (existingKey) {
        toast({
          title: 'Registrierung fehlgeschlagen',
          description: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits',
          variant: 'destructive',
        });
        throw new Error('Benutzer existiert bereits');
      }
      
      // Sicheres Verschlüsselungsschlüsselpaar für den Benutzer generieren
      const { publicKey, privateKey } = await generateKeyPair();
      
      // In einer echten App würde der öffentliche Schlüssel an den Server gesendet,
      // während der private Schlüssel aus dem Passwort des Benutzers abgeleitet
      // oder in einem sicheren Enclave/Keychain gespeichert würde
      
      // Für die Demo speichern wir den privaten Schlüssel lokal (nicht für die Produktion empfohlen)
      localStorage.setItem(`${KEY_PREFIX}${email}`, privateKey);
      
      // Benutzerdaten erstellen
      const userData = {
        id: `user-${Date.now()}`,
        username,
        email
      };
      
      // Benutzer im State speichern
      setUser(userData);
      
      // In localStorage für Persistenz speichern
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Verschlüsselten Benutzerdatenspeicher mit dem öffentlichen Schlüssel initialisieren
      await initializeUserData(publicKey);
      
      toast({
        title: 'Registrierung erfolgreich',
        description: 'Ihr Konto wurde erfolgreich erstellt',
      });
      
      navigate('/onboarding');
    } catch (error) {
      console.error('Registrierung fehlgeschlagen:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    // Hinweis: Wir entfernen bei der Abmeldung nicht die verschlüsselten Daten oder Schlüssel
    // Dadurch kann sich der Benutzer wieder anmelden und auf seine Daten zugreifen
    toast({
      title: 'Abgemeldet',
      description: 'Sie wurden erfolgreich abgemeldet',
    });
    navigate('/login');
  };

  const initializeUserData = async (publicKey: string) => {
    // Leere verschlüsselte Benutzerdaten initialisieren
    const emptyUserData = {
      profile: {
        birthdate: null,
        height: null,
        weight: null,
        experienceLevel: null,
        limitations: [],
      },
      workouts: [],
      history: [],
      settings: {}
    };
    
    // Mit dem öffentlichen Schlüssel verschlüsseln und speichern
    const encrypted = await encryptData(JSON.stringify(emptyUserData), publicKey);
    localStorage.setItem(USER_DATA_KEY, encrypted);
  };

  const decryptUserData = async (privateKey: string) => {
    // In einer echten App würden verschlüsselte Daten von einem Server abgerufen
    // Für die Demo rufen wir sie aus localStorage ab
    try {
      const encryptedData = localStorage.getItem(USER_DATA_KEY);
      if (encryptedData) {
        // Benutzerdaten mit dem privaten Schlüssel entschlüsseln
        const decrypted = await decryptData(encryptedData, privateKey);
        // Hier würden wir entschlüsselte Benutzerdaten in den App-Status laden
        console.log('Benutzerdaten erfolgreich geladen');
      }
    } catch (error) {
      console.error('Fehler beim Entschlüsseln der Benutzerdaten:', error);
      // Entschlüsselungsfehler behandeln - möglicherweise falscher Schlüssel/Benutzer
      toast({
        title: 'Fehler beim Laden der Daten',
        description: 'Ihre Daten konnten nicht geladen werden',
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
    throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
  }
  return context;
};
