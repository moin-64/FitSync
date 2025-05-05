
import { hashPassword } from './encryption';

// Lokaler Speicherschlüssel für die Verschlüsselung
let storageEncryptionKey: string | null = null;

// Initialisierung des Speicherschlüssels
const initStorageKey = (): string => {
  if (!storageEncryptionKey) {
    // Generieren oder Abrufen des Speicherschlüssels
    let key = localStorage.getItem('storage_key');
    if (!key) {
      // Generieren eines neuen zufälligen Schlüssels
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      key = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('storage_key', key);
    }
    storageEncryptionKey = key;
  }
  return storageEncryptionKey;
};

// Einfache Verschlüsselung für sensible Daten im Speicher
const encryptStorageData = async (data: string): Promise<string> => {
  const key = initStorageKey();
  // XOR-Verschlüsselung mit dem Schlüssel
  const encrypted = Array.from(data).map((char, i) => {
    return String.fromCharCode(
      char.charCodeAt(0) ^ key.charCodeAt(i % key.length)
    );
  }).join('');
  
  // Base64-Codierung für sichere Speicherung
  return btoa(encrypted);
};

// Entschlüsselung von Daten
const decryptStorageData = async (encryptedData: string): Promise<string> => {
  const key = initStorageKey();
  try {
    // Base64-Decodierung
    const encrypted = atob(encryptedData);
    
    // XOR-Entschlüsselung mit dem Schlüssel
    return Array.from(encrypted).map((char, i) => {
      return String.fromCharCode(
        char.charCodeAt(0) ^ key.charCodeAt(i % key.length)
      );
    }).join('');
  } catch (e) {
    console.error('Fehler bei der Entschlüsselung:', e);
    return encryptedData; // Fallback bei Entschlüsselungsfehlern
  }
};

// Prüfen, ob ein Wert sensibel ist und verschlüsselt werden sollte
const isSensitiveKey = (key: string): boolean => {
  const sensitiveKeys = [
    'userData',
    'userData_backup',
    'profile',
    'user',
    'personal',
    'health',
    'password',
    'secure',
    'private',
    'token',
    'key',
    'secret'
  ];
  return sensitiveKeys.some(sensitiveKey => 
    key.toLowerCase().includes(sensitiveKey.toLowerCase())
  );
};

/**
 * Saves data to localStorage with optional encryption for sensitive data
 * @param key The storage key
 * @param data The data to save
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    if (data === null || data === undefined) {
      localStorage.removeItem(key);
      return;
    }
    
    const serializedData = JSON.stringify(data);
    
    // Verschlüsseln, wenn es sich um sensible Daten handelt
    if (isSensitiveKey(key)) {
      encryptStorageData(serializedData).then(encrypted => {
        localStorage.setItem(key, encrypted);
        localStorage.setItem(`${key}_encrypted`, '1'); // Markieren als verschlüsselt
      }).catch(error => {
        console.error(`Fehler beim Verschlüsseln von Daten (${key}):`, error);
        // Fallback: unverschlüsselt speichern
        localStorage.setItem(key, serializedData);
        localStorage.setItem(`${key}_encrypted`, '0');
      });
    } else {
      localStorage.setItem(key, serializedData);
      localStorage.removeItem(`${key}_encrypted`); // Sicherstellen, dass keine Verschlüsselungsmarkierung vorhanden ist
    }
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Retrieves data from localStorage with automatic decryption if needed
 * @param key The storage key
 * @param defaultValue The default value to return if the key doesn't exist
 * @returns The retrieved data or the default value
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    
    // Prüfen, ob die Daten verschlüsselt sind
    const isEncrypted = localStorage.getItem(`${key}_encrypted`) === '1';
    
    if (isEncrypted) {
      // Asynchrone Entschlüsselung mit Fallback auf Standardwert
      return new Promise<T>((resolve) => {
        decryptStorageData(serializedData)
          .then(decrypted => {
            try {
              resolve(JSON.parse(decrypted) as T);
            } catch (parseError) {
              console.error(`Fehler beim Parsen entschlüsselter Daten (${key}):`, parseError);
              resolve(defaultValue);
            }
          })
          .catch(error => {
            console.error(`Fehler beim Entschlüsseln von Daten (${key}):`, error);
            resolve(defaultValue);
          });
      }) as unknown as T;
    }
    
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error retrieving from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Removes data from localStorage and any associated metadata
 * @param key The storage key
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_encrypted`); // Auch Verschlüsselungsmarkierung entfernen
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clears all data from localStorage
 * Keeps only critical system keys that should be preserved
 */
export const clearStorage = (): void => {
  try {
    // Liste kritischer Schlüssel, die nicht gelöscht werden sollen
    const criticalKeys = ['storage_key', 'secure_key-'];
    
    // Alle Schlüssel abrufen
    const keys = Object.keys(localStorage);
    
    // Alle nicht-kritischen Schlüssel löschen
    keys.forEach(key => {
      if (!criticalKeys.some(criticalKey => key.startsWith(criticalKey))) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Returns all keys in localStorage
 * @param includeMetadata Whether to include metadata keys
 * @returns Array of keys
 */
export const getStorageKeys = (includeMetadata: boolean = false): string[] => {
  try {
    const allKeys = Object.keys(localStorage);
    if (includeMetadata) {
      return allKeys;
    } else {
      // Metadatenschlüssel ausfiltern
      return allKeys.filter(key => !key.endsWith('_encrypted'));
    }
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
};

/**
 * Securely hashes a value using the global storage key
 * Used for generating secure identifiers
 * @param value The value to hash
 * @returns A promise resolving to the hashed value
 */
export const secureHashValue = async (value: string): Promise<string> => {
  const key = initStorageKey();
  return hashPassword(value + key);
};
