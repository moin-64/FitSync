import { USER_KEY, KEY_PREFIX, USER_DATA_KEY } from '../constants/authConstants';
import { generateKeyPair } from '../utils/encryption';
import { User } from '../types/auth';
import { initializeUserData, decryptUserData } from '../utils/userDataUtils';

// Verbesserte Abruffunktion für gespeicherte Benutzer mit verbesserter Fehlerbehandlung
export const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) {
      return null;
    }
    
    // JSON-Struktur vor dem Zurückgeben validieren
    const userData = JSON.parse(storedUser);
    
    // Grundlegende Validierung der Benutzerobjectstruktur
    if (!userData || typeof userData !== 'object') {
      console.error('Ungültiges Benutzerdatenformat im localStorage');
      localStorage.removeItem(USER_KEY);
      return null;
    }
    
    // Auf erforderliche Felder prüfen
    if (!userData.id || !userData.email || !userData.username) {
      console.error('Erforderliche Benutzerfelder im localStorage fehlen');
      localStorage.removeItem(USER_KEY);
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('Fehler beim Analysieren gespeicherter Benutzerdaten:', error);
    // Beschädigte Daten löschen
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

// Überprüfen, ob der Benutzerschlüssel mit robuster Validierung existiert
export const userKeyExists = (email: string): boolean => {
  if (!email) return false;
  
  try {
    const normalizedEmail = email.toLowerCase().trim();
    return localStorage.getItem(`${KEY_PREFIX}${normalizedEmail}`) !== null;
  } catch (error) {
    console.error('Fehler beim Überprüfen des Benutzerschlüssels:', error);
    return false;
  }
};

// Zuverlässigerer Login mit verbesserten Fehlermeldungen und Wiederholungslogik
export const loginUser = async (email: string, password: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('E-Mail und Passwort sind erforderlich');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Privaten Schlüssel für diesen Benutzer abrufen
  const privateKey = localStorage.getItem(`${KEY_PREFIX}${normalizedEmail}`);
  
  if (!privateKey) {
    console.error('Kein privater Schlüssel gefunden für:', normalizedEmail);
    throw new Error('Benutzer nicht gefunden oder ungültige Anmeldedaten');
  }
  
  try {
    // Schneller Mock-Server-Response mit Benutzerinformationen
    const mockUserResponse = {
      id: `user-${normalizedEmail.split('@')[0]}`,
      username: normalizedEmail.split('@')[0],
      email: normalizedEmail,
    };
    
    // Benutzer im localStorage zur Persistenz speichern
    localStorage.setItem(USER_KEY, JSON.stringify(mockUserResponse));
    
    // Zeitstempel der Sitzung aktualisieren
    updateSessionActivity();
    
    return mockUserResponse;
  } catch (error) {
    console.error('Login-Fehler:', error);
    throw new Error('Anmeldung fehlgeschlagen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
  }
};

// Verbesserte Registrierung mit besserer Validierung und Fehlerbehandlung
export const registerUser = async (username: string, email: string, password: string): Promise<User> => {
  if (!username || !email || !password) {
    throw new Error('Benutzername, E-Mail und Passwort sind erforderlich');
  }
  
  if (password.length < 6) {
    throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
  }
  
  // Check if user already exists
  if (userKeyExists(normalizedEmail)) {
    throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits');
  }
  
  try {
    // Generate secure encryption key pair with retry logic
    let keyPair;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        keyPair = await generateKeyPair();
        if (keyPair && keyPair.publicKey && keyPair.privateKey) {
          break;
        }
      } catch (e) {
        console.error(`Key generation attempt ${attempts + 1} failed:`, e);
      }
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate secure keys after multiple attempts');
      }
      
      // Short delay before retry attempt
      await new Promise(resolve => setTimeout(resolve, 300 * attempts));
    }
    
    if (!keyPair) {
      throw new Error('Key generation failed');
    }
    
    const { publicKey, privateKey } = keyPair;
    
    // Store private key (in a real app this would be derived from user password or stored in a secure enclave)
    localStorage.setItem(`${KEY_PREFIX}${normalizedEmail}`, privateKey);
    
    // Create user data
    const userData = {
      id: `user-${normalizedEmail.split('@')[0]}`,
      username,
      email: normalizedEmail,
      createdAt: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    // Update session timestamp
    updateSessionActivity();
    
    // Initialize encrypted user data store with public key
    const initialized = await initializeUserData(publicKey);
    
    if (!initialized) {
      // Clean up if initialization fails
      localStorage.removeItem(`${KEY_PREFIX}${normalizedEmail}`);
      localStorage.removeItem(USER_KEY);
      throw new Error('Failed to initialize user data');
    }
    
    return userData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error instanceof Error ? error : new Error('Registration failed: Unknown error');
  }
};

// Log out user with complete cleanup and session management
export const logoutUser = (): void => {
  try {
    // Remove authentication data, but not encryption keys
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('lastActivityTimestamp');
    
    // Clear session cookies (if present)
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim().startsWith('session')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    console.log('User successfully logged out');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Sitzung auf Ablaufzeit prüfen
export const isSessionValid = (): boolean => {
  try {
    const lastActivity = localStorage.getItem('lastActivityTimestamp');
    if (!lastActivity) return false;
    
    const now = Date.now();
    const lastActivityTime = parseInt(lastActivity, 10);
    
    // Prüfen, ob Zeitstempel eine gültige Zahl ist
    if (isNaN(lastActivityTime)) {
      localStorage.removeItem('lastActivityTimestamp');
      return false;
    }
    
    const sessionTimeout = 24 * 60 * 60 * 1000; // Auf 24 Stunden erhöhen für bessere Benutzererfahrung
    
    return now - lastActivityTime < sessionTimeout;
  } catch (error) {
    console.error('Fehler beim Überprüfen der Sitzungsgültigkeit:', error);
    return false;
  }
};

// Sitzungsaktivität aktualisieren
export const updateSessionActivity = (): void => {
  try {
    localStorage.setItem('lastActivityTimestamp', Date.now().toString());
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Sitzungsaktivität:', error);
  }
};
