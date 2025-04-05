
import { USER_KEY, KEY_PREFIX, USER_DATA_KEY } from '../constants/authConstants';
import { generateKeyPair } from '../utils/encryption';
import { User } from '../types/auth';
import { initializeUserData, decryptUserData } from '../utils/userDataUtils';

// Gespeicherten Benutzer mit verbesserter Fehlerbehandlung und Fallback abrufen
export const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  } catch (error) {
    console.error('Fehler beim Parsen der gespeicherten Benutzerdaten:', error);
    // Clear corrupt data
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

// Prüfen, ob Benutzerschlüssel existiert mit robuster Prüfung und Normalisierung
export const userKeyExists = (email: string): boolean => {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  return localStorage.getItem(`${KEY_PREFIX}${normalizedEmail}`) !== null;
};

// Zuverlässigere Anmeldung mit verbesserten Fehlermeldungen und Wiederholungslogik
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
    // Mock-Serverantwort mit Benutzerdaten
    const mockUserResponse = {
      id: `user-${normalizedEmail.split('@')[0]}`,
      username: normalizedEmail.split('@')[0],
      email: normalizedEmail,
    };
    
    // Benutzer in localStorage für Persistenz speichern
    localStorage.setItem(USER_KEY, JSON.stringify(mockUserResponse));
    
    // Überprüfen, ob wir Benutzerdaten entschlüsseln können
    const userData = await decryptUserData(privateKey);
    
    if (!userData) {
      console.log('Entschlüsselung der Benutzerdaten fehlgeschlagen - Neuinitialisierung');
      
      // Wenn die Entschlüsselung fehlschlägt, versuchen, Benutzerdaten neu zu initialisieren
      await initializeUserData(privateKey);
    }
    
    return mockUserResponse;
  } catch (error) {
    console.error('Anmeldefehler:', error);
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
  
  // E-Mail-Format validieren
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('Bitte gib eine gültige E-Mail-Adresse ein');
  }
  
  // Überprüfen, ob Benutzer bereits existiert
  if (userKeyExists(normalizedEmail)) {
    throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits');
  }
  
  try {
    // Sicheres Verschlüsselungs-Schlüsselpaar mit Wiederholungslogik generieren
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
        console.error(`Schlüsselgenerierungsversuch ${attempts + 1} fehlgeschlagen:`, e);
      }
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Generierung sicherer Schlüssel nach mehreren Versuchen fehlgeschlagen');
      }
      
      // Kurze Verzögerung vor dem Wiederholungsversuch
      await new Promise(resolve => setTimeout(resolve, 100 * attempts));
    }
    
    if (!keyPair) {
      throw new Error('Schlüsselgenerierung fehlgeschlagen');
    }
    
    const { publicKey, privateKey } = keyPair;
    
    // Privaten Schlüssel speichern (in einer realen App würde dieser vom Benutzerpasswort abgeleitet oder in einer sicheren Enklave gespeichert)
    localStorage.setItem(`${KEY_PREFIX}${normalizedEmail}`, privateKey);
    
    // Benutzerdaten erstellen
    const userData = {
      id: `user-${normalizedEmail.split('@')[0]}`,
      username,
      email: normalizedEmail
    };
    
    // In localStorage speichern
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    // Verschlüsselten Benutzerdatenspeicher mit öffentlichem Schlüssel initialisieren
    const initialized = await initializeUserData(publicKey);
    
    if (!initialized) {
      // Aufräumen, wenn die Initialisierung fehlschlägt
      localStorage.removeItem(`${KEY_PREFIX}${normalizedEmail}`);
      localStorage.removeItem(USER_KEY);
      throw new Error('Initialisierung der Benutzerdaten fehlgeschlagen');
    }
    
    return userData;
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    throw error instanceof Error ? error : new Error('Registrierung fehlgeschlagen: Unbekannter Fehler');
  }
};

// Benutzer abmelden mit vollständiger Bereinigung und Session-Management
export const logoutUser = (): void => {
  try {
    // Nur Authentifizierungsdaten entfernen, nicht die Verschlüsselungsschlüssel
    localStorage.removeItem(USER_KEY);
    
    // Session-Cookies löschen (falls vorhanden)
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim().startsWith('session')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    console.log('Benutzer erfolgreich abgemeldet');
  } catch (error) {
    console.error('Fehler bei der Abmeldung:', error);
  }
};

// Session-Ablaufzeit überprüfen
export const isSessionValid = (): boolean => {
  const lastActivity = localStorage.getItem('lastActivityTimestamp');
  if (!lastActivity) return false;
  
  const now = Date.now();
  const lastActivityTime = parseInt(lastActivity, 10);
  const sessionTimeout = 4 * 60 * 60 * 1000; // 4 Stunden
  
  return now - lastActivityTime < sessionTimeout;
};

// Sitzungsaktivität aktualisieren
export const updateSessionActivity = (): void => {
  localStorage.setItem('lastActivityTimestamp', Date.now().toString());
};
