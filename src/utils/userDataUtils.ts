
import { encryptData, decryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { Rank } from './rankingUtils';
import { saveToStorage, getFromStorage } from './localStorage';

// Verbesserte Funktion zur Initialisierung der Benutzerdaten mit Fehlerbehandlung
export const initializeUserData = async (publicKey: string) => {
  if (!publicKey) {
    console.error('Cannot initialize user data: Missing public key');
    return false;
  }
  
  // Initialisiere leere verschlüsselte Benutzerdaten
  const emptyUserData = {
    profile: {
      birthdate: null,
      height: null,
      weight: null,
      experienceLevel: 'Beginner' as Rank,
      limitations: [],
      rank: 'Beginner' as Rank,
      friends: [],
      friendRequests: []
    },
    workouts: [],
    history: [],
    settings: {
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    }
  };
  
  try {
    // Verschlüssele mit öffentlichem Schlüssel und speichere
    const encrypted = await encryptData(JSON.stringify(emptyUserData), publicKey);
    localStorage.setItem(USER_DATA_KEY, encrypted);
    
    // Speichere auch eine Backup-Kopie im unverschlüsselten Format
    saveToStorage('userData_backup', emptyUserData);
    
    console.log('User data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing user data:', error);
    return false;
  }
};

// Verbesserte Entschlüsselungsfunktion mit Retry-Mechanismus und Backup
export const decryptUserData = async (privateKey: string): Promise<any> => {
  if (!privateKey) {
    console.error('Cannot decrypt user data: Missing private key');
    return null;
  }
  
  try {
    const encryptedData = localStorage.getItem(USER_DATA_KEY);
    if (!encryptedData) {
      console.warn('No encrypted data found in storage, checking backup');
      // Wenn keine verschlüsselten Daten vorhanden sind, versuche das Backup zu laden
      const backupData = getFromStorage('userData_backup', null);
      if (backupData) {
        console.log('Loaded data from backup');
        return backupData;
      }
      return null;
    }
    
    // Entschlüssele Benutzerdaten mit privatem Schlüssel und Retry-Mechanismus
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        // Entschlüssele Benutzerdaten mit privatem Schlüssel
        const decrypted = await decryptData(encryptedData, privateKey);
        
        // Validiere JSON-Struktur
        const userData = JSON.parse(decrypted);
        console.log('User data successfully loaded and validated');
        
        // Stelle sicher, dass das Profil korrekte experienceLevel- und rank-Werte vom Typ Rank hat
        if (userData.profile) {
          if (userData.profile.experienceLevel && typeof userData.profile.experienceLevel === 'string') {
            // Großschreibe den ersten Buchstaben, um den Typ Rank zu entsprechen
            userData.profile.experienceLevel = userData.profile.experienceLevel.charAt(0).toUpperCase() + 
                                             userData.profile.experienceLevel.slice(1).toLowerCase();
            // Stelle sicher, dass es ein gültiger Rank ist
            if (!['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].includes(userData.profile.experienceLevel)) {
              userData.profile.experienceLevel = 'Beginner';
            }
          } else {
            userData.profile.experienceLevel = 'Beginner';
          }
          
          // Stelle sicher, dass Rank richtig gesetzt ist
          if (!userData.profile.rank || typeof userData.profile.rank !== 'string') {
            userData.profile.rank = userData.profile.experienceLevel || 'Beginner';
          }
          
          // Stelle sicher, dass friends und friendRequests existieren
          if (!Array.isArray(userData.profile.friends)) {
            userData.profile.friends = [];
          }
          
          if (!Array.isArray(userData.profile.friendRequests)) {
            userData.profile.friendRequests = [];
          }
        }
        
        // Speichere auch eine Backup-Kopie im unverschlüsselten Format
        saveToStorage('userData_backup', userData);
        
        return userData;
      } catch (error) {
        console.error(`Decryption attempt ${attempts + 1} failed:`, error);
        lastError = error;
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 300)); // Warte vor dem nächsten Versuch
      }
    }
    
    console.error('All decryption attempts failed:', lastError);
    
    // Wenn alle Entschlüsselungsversuche fehlschlagen, versuche das Backup zu laden
    const backupData = getFromStorage('userData_backup', null);
    if (backupData) {
      console.log('Loaded data from backup after decryption failure');
      return backupData;
    }
    
    return null;
  } catch (error) {
    console.error('Error decrypting user data:', error);
    
    // Bei Fehlern versuche das Backup zu laden
    const backupData = getFromStorage('userData_backup', null);
    if (backupData) {
      console.log('Loaded data from backup after error');
      return backupData;
    }
    
    return null;
  }
};

// Funktion zum sicheren Speichern der Benutzerdaten mit Verschlüsselung und Backup
export const storeUserData = async (userData: any, publicKey: string): Promise<boolean> => {
  if (!userData || !publicKey) {
    console.error('Cannot store user data: Missing data or public key');
    return false;
  }
  
  try {
    // Validiere und stelle sicher, dass die Typen korrekt sind
    if (userData.profile) {
      // Stelle sicher, dass experienceLevel ein gültiger Rank ist
      if (userData.profile.experienceLevel) {
        if (typeof userData.profile.experienceLevel === 'string') {
          const level = userData.profile.experienceLevel.charAt(0).toUpperCase() + 
                       userData.profile.experienceLevel.slice(1).toLowerCase();
          
          if (['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].includes(level)) {
            userData.profile.experienceLevel = level;
          } else {
            userData.profile.experienceLevel = 'Beginner';
          }
        } else {
          userData.profile.experienceLevel = 'Beginner';
        }
      }
      
      // Stelle sicher, dass Rank gesetzt ist
      if (!userData.profile.rank) {
        userData.profile.rank = userData.profile.experienceLevel || 'Beginner';
      }
      
      // Stelle sicher, dass friends und friendRequests existieren
      if (!Array.isArray(userData.profile.friends)) {
        userData.profile.friends = [];
      }
      
      if (!Array.isArray(userData.profile.friendRequests)) {
        userData.profile.friendRequests = [];
      }
    }
    
    // Füge einen letzten Aktualisierungs-Zeitstempel hinzu
    userData.settings = {
      ...userData.settings || {},
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    // Speichere auch eine Backup-Kopie im unverschlüsselten Format
    saveToStorage('userData_backup', userData);
    
    // Verschlüssele und speichere
    const encrypted = await encryptData(JSON.stringify(userData), publicKey);
    localStorage.setItem(USER_DATA_KEY, encrypted);
    console.log('User data stored successfully (encrypted and backup)');
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};
