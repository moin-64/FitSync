
import { USER_KEY, KEY_PREFIX, USER_DATA_KEY } from '../constants/authConstants';
import { generateKeyPair, hashPassword, constantTimeEqual, generateSecureToken } from '../utils/encryption';
import { User } from '../types/auth';
import { initializeUserData } from '../utils/userDataUtils';
import { saveToStorage, getFromStorage } from '../utils/localStorage';

// Verbessertes Passwort-Hashing mit Salz
const saltAndHashPassword = async (password: string, salt?: string): Promise<{hash: string, salt: string}> => {
  const usedSalt = salt || generateSecureToken(16);
  const combinedPassword = password + usedSalt;
  const hash = await hashPassword(combinedPassword);
  return { hash, salt: usedSalt };
};

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
    
    // XSS-Prävention durch Bereinigung von Benutzereingaben
    Object.entries(userData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        userData[key] = value.replace(/<[^>]*>/g, '');
      }
    });
    
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
    const keyName = `${KEY_PREFIX}${normalizedEmail}`;
    return localStorage.getItem(keyName) !== null;
  } catch (error) {
    console.error('Fehler beim Überprüfen des Benutzerschlüssels:', error);
    return false;
  }
};

// Speichern von Benutzeranmeldeinformationen
const storeUserCredentials = async (email: string, password: string): Promise<void> => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const { hash, salt } = await saltAndHashPassword(password);
    
    // Hash und Salt für spätere Überprüfung speichern
    localStorage.setItem(`${KEY_PREFIX}${normalizedEmail}_hash`, hash);
    localStorage.setItem(`${KEY_PREFIX}${normalizedEmail}_salt`, salt);
    
    // Letzte Anmeldung speichern für die Erkennung ungewöhnlicher Aktivitäten
    localStorage.setItem(`${KEY_PREFIX}${normalizedEmail}_lastLogin`, Date.now().toString());
    
    // Fehlgeschlagene Anmeldeversuche zurücksetzen
    localStorage.removeItem(`${KEY_PREFIX}${normalizedEmail}_failedAttempts`);
  } catch (error) {
    console.error('Fehler beim Speichern der Benutzeranmeldeinformationen:', error);
    throw new Error('Fehler beim Speichern der Benutzerinformationen');
  }
};

// Überprüfen von Benutzeranmeldeinformationen mit Schutz vor Brute-Force
const verifyUserCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const keyPrefix = `${KEY_PREFIX}${normalizedEmail}`;
    const storedHash = localStorage.getItem(`${keyPrefix}_hash`);
    const storedSalt = localStorage.getItem(`${keyPrefix}_salt`);
    
    if (!storedHash || !storedSalt) {
      return false;
    }
    
    // Prüfen auf zu viele fehlgeschlagene Anmeldeversuche
    const failedAttemptsStr = localStorage.getItem(`${keyPrefix}_failedAttempts`) || '0';
    const failedAttempts = parseInt(failedAttemptsStr, 10);
    const lastFailedTimeStr = localStorage.getItem(`${keyPrefix}_lastFailedTime`);
    
    // Wenn zu viele fehlerhafte Versuche vorliegen, Zeitsperre prüfen
    if (failedAttempts >= 5) {
      if (lastFailedTimeStr) {
        const lastFailedTime = parseInt(lastFailedTimeStr, 10);
        const lockoutPeriod = 15 * 60 * 1000; // 15 Minuten Sperre
        
        if (Date.now() - lastFailedTime < lockoutPeriod) {
          throw new Error('Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.');
        } else {
          // Sperre aufgehoben, Zähler zurücksetzen
          localStorage.setItem(`${keyPrefix}_failedAttempts`, '0');
        }
      }
    }
    
    // Hash des eingegebenen Passworts mit dem gespeicherten Salz generieren
    const { hash: inputHash } = await saltAndHashPassword(password, storedSalt);
    
    // Zeitlich konstanter Vergleich zur Vermeidung von Timing-Angriffen
    const isValid = constantTimeEqual(inputHash, storedHash);
    
    if (isValid) {
      // Bei erfolgreicher Anmeldung alle Fehlerversuche zurücksetzen
      localStorage.removeItem(`${keyPrefix}_failedAttempts`);
      localStorage.removeItem(`${keyPrefix}_lastFailedTime`);
      localStorage.setItem(`${keyPrefix}_lastLogin`, Date.now().toString());
    } else {
      // Fehlgeschlagenen Anmeldeversuch registrieren
      const newFailedAttempts = failedAttempts + 1;
      localStorage.setItem(`${keyPrefix}_failedAttempts`, newFailedAttempts.toString());
      localStorage.setItem(`${keyPrefix}_lastFailedTime`, Date.now().toString());
    }
    
    return isValid;
  } catch (error) {
    if (error instanceof Error && error.message.includes('fehlgeschlagene Anmeldeversuche')) {
      throw error; // Spezifischen Fehler weiterleiten
    }
    console.error('Fehler bei der Überprüfung der Anmeldeinformationen:', error);
    return false;
  }
};

// Zuverlässigerer Login mit verbesserten Fehlermeldungen und Wiederholungslogik
export const loginUser = async (email: string, password: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('E-Mail und Passwort sind erforderlich');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validierungen
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error('Ungültiges E-Mail-Format');
  }
  
  if (password.length < 6) {
    throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
  }
  
  // Privaten Schlüssel für diesen Benutzer abrufen
  const privateKey = localStorage.getItem(`${KEY_PREFIX}${normalizedEmail}`);
  
  if (!privateKey) {
    console.error('Kein privater Schlüssel gefunden für:', normalizedEmail);
    throw new Error('Benutzer nicht gefunden oder ungültige Anmeldedaten');
  }
  
  try {
    // Anmeldeinformationen überprüfen
    const isValidCredentials = await verifyUserCredentials(normalizedEmail, password);
    
    if (!isValidCredentials) {
      throw new Error('Ungültige Anmeldeinformationen');
    }
    
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
    throw error instanceof Error ? error : new Error('Anmeldung fehlgeschlagen: Unbekannter Fehler');
  }
};

// Verbesserte Registrierung mit besserer Validierung und Fehlerbehandlung
export const registerUser = async (username: string, email: string, password: string): Promise<User> => {
  if (!username || !email || !password) {
    throw new Error('Benutzername, E-Mail und Passwort sind erforderlich');
  }
  
  // Erweiterte Passwortüberprüfung
  if (password.length < 8) {
    throw new Error('Das Passwort muss mindestens 8 Zeichen lang sein');
  }
  
  // Passwort-Komplexitätsprüfung
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!(hasUpperCase && hasLowerCase && hasNumbers) || !hasSpecialChar) {
    throw new Error('Das Passwort muss Groß- und Kleinbuchstaben, Zahlen und mindestens ein Sonderzeichen enthalten');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
  }
  
  // Username-Validierung
  if (username.length < 3 || username.length > 20) {
    throw new Error('Der Benutzername muss zwischen 3 und 20 Zeichen lang sein');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Der Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten');
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
    
    // Save hashed password and salt
    await storeUserCredentials(normalizedEmail, password);
    
    // Create user data with sanitized inputs to prevent XSS
    const sanitizedUsername = username.replace(/<[^>]*>/g, '');
    
    const userData = {
      id: `user-${normalizedEmail.split('@')[0]}`,
      username: sanitizedUsername,
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
    // Aktueller Benutzer für den Logout
    const currentUser = getStoredUser();
    
    // Remove authentication data, but not encryption keys
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('lastActivityTimestamp');
    
    // Logout-Zeit für Sicherheit protokollieren
    if (currentUser && currentUser.email) {
      localStorage.setItem(`${KEY_PREFIX}${currentUser.email}_lastLogout`, Date.now().toString());
    }
    
    // Clear session cookies (if present)
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim().startsWith('session')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    // In-Memory Cache löschen
    saveToStorage('userData_backup', null);
    
    console.log('User successfully logged out');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Sitzung auf Ablaufzeit prüfen mit zusätzlichen Sicherheitsmerkmalen
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
    
    // Browser-Fingerprint prüfen, um Session-Hijacking zu verhindern
    const storedFingerprint = localStorage.getItem('browser_fingerprint');
    const currentFingerprint = generateBrowserFingerprint();
    
    if (!storedFingerprint || storedFingerprint !== currentFingerprint) {
      console.warn('Möglicher Session-Hijacking-Versuch: Browser-Fingerprint hat sich geändert');
      return false;
    }
    
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 Stunden für bessere Benutzererfahrung
    
    return now - lastActivityTime < sessionTimeout;
  } catch (error) {
    console.error('Fehler beim Überprüfen der Sitzungsgültigkeit:', error);
    return false;
  }
};

// Sitzungsaktivität aktualisieren mit verbesserter Sicherheit
export const updateSessionActivity = (): void => {
  try {
    localStorage.setItem('lastActivityTimestamp', Date.now().toString());
    
    // Browser-Fingerprint speichern
    const fingerprint = generateBrowserFingerprint();
    localStorage.setItem('browser_fingerprint', fingerprint);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Sitzungsaktivität:', error);
  }
};

// Einfachen Browser-Fingerprint generieren
const generateBrowserFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    `${screen.width}x${screen.height}`,
    new Date().getTimezoneOffset()
  ];
  
  return components.join('|');
};

// CSRF-Token für Formulare generieren
export const generateCSRFToken = (): string => {
  const token = generateSecureToken();
  localStorage.setItem('csrf_token', token);
  return token;
};

// CSRF-Token validieren
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = localStorage.getItem('csrf_token');
  if (!storedToken) return false;
  
  const isValid = constantTimeEqual(token, storedToken);
  
  // Token nach Validierung rotieren
  if (isValid) {
    localStorage.removeItem('csrf_token');
    generateCSRFToken(); // Neuen Token generieren
  }
  
  return isValid;
};
