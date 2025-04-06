
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/auth';
import { UserData } from '../types/user';
import { defaultUserData } from '../utils/userContext.utils';
import { decryptUserData, storeUserData } from '@/utils/userDataUtils';
import { KEY_PREFIX } from '@/constants/authConstants';
import { saveToStorage, getFromStorage } from '@/utils/localStorage';

export const useUserData = (user: User | null, isAuthenticated: boolean) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Verbesserte Datenladung mit Retries und Backup-Strategie
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Hole den privaten Schlüssel des Benutzers aus dem Speicher
      const privateKey = localStorage.getItem(`${KEY_PREFIX}${user.email}`);
      if (!privateKey) {
        console.warn('User encryption key not found, trying backup data');
        // Versuche, Backup-Daten zu laden
        const backupData = getFromStorage('userData_backup', null);
        if (backupData) {
          console.log('Loaded user data from backup');
          setUserData(backupData);
          setLoading(false);
          return;
        }
        throw new Error('User encryption key not found');
      }
      
      // Entschlüssele die Benutzerdaten mit Retry-Mechanismus
      const decryptedData = await decryptUserData(privateKey);
      
      if (decryptedData) {
        // Validiere und stelle sicher, dass die Daten alle erforderlichen Felder haben
        const validatedData = {
          ...defaultUserData,
          ...decryptedData,
          profile: {
            ...defaultUserData.profile,
            ...decryptedData.profile,
          }
        };
        
        setUserData(validatedData);
        
        // Speichere auch eine Backup-Kopie im unverschlüsselten Format
        saveToStorage('userData_backup', validatedData);
      } else {
        console.warn('Failed to load encrypted user data, checking for backup');
        // Versuche, Backup-Daten zu laden
        const backupData = getFromStorage('userData_backup', null);
        if (backupData) {
          console.log('Loaded user data from backup after decryption failure');
          setUserData(backupData);
        } else {
          console.warn('No backup data found, using default data');
          setUserData(defaultUserData);
        }
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading user data'));
      
      // Versuche, Backup-Daten zu laden
      const backupData = getFromStorage('userData_backup', null);
      if (backupData) {
        console.log('Loaded user data from backup after error');
        setUserData(backupData);
      } else {
        setUserData(defaultUserData);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Lade Daten bei Änderung des Auth-Status
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Verbesserte setUserData mit automatischer Persistenz
  const updateUserDataState = useCallback(async (newData: UserData) => {
    try {
      // Setze den Zustand sofort für UI-Responsiveness
      setUserData(newData);
      
      // Speichere Backup-Daten sofort
      saveToStorage('userData_backup', newData);
      
      // Persistiere nur, wenn authentifiziert
      if (isAuthenticated && user) {
        const publicKey = localStorage.getItem(`${KEY_PREFIX}${user.email}`);
        if (publicKey) {
          await storeUserData(newData, publicKey);
        }
      }
    } catch (err) {
      console.error('Error saving updated user data:', err);
    }
  }, [isAuthenticated, user]);

  // Lade Daten neu für die Wiederherstellung nach Fehlern
  const reloadData = useCallback(() => {
    loadUserData();
  }, [loadUserData]);

  return { 
    userData, 
    setUserData: updateUserDataState, 
    loading, 
    error,
    reloadData
  };
};
