
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

  // Improved data loading with retries and backup strategy
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get the user's private key from storage
      const privateKey = localStorage.getItem(`${KEY_PREFIX}${user.email}`);
      if (!privateKey) {
        console.warn('User encryption key not found, trying backup data');
        // Try to load backup data
        const backupData = getFromStorage('userData_backup', null);
        if (backupData) {
          console.log('Loaded user data from backup');
          setUserData(backupData);
          setLoading(false);
          return;
        }
        throw new Error('User encryption key not found');
      }
      
      // Improved retry mechanism with exponential backoff
      let attempt = 0;
      const maxAttempts = 3;
      const backoffTime = 300; // Start with 300ms delay
      
      while (attempt < maxAttempts) {
        try {
          // Decrypt user data
          const decryptedData = await decryptUserData(privateKey);
          
          if (decryptedData) {
            // Validate and ensure data has all required fields
            const validatedData = {
              ...defaultUserData,
              ...decryptedData,
              profile: {
                ...defaultUserData.profile,
                ...decryptedData.profile,
              }
            };
            
            setUserData(validatedData);
            
            // Also store a backup copy in unencrypted format with timestamp
            saveToStorage('userData_backup', {
              ...validatedData,
              _backupTimestamp: new Date().toISOString()
            });
            
            setLoading(false);
            return;
          }
          break; // If we got here without data but no error, break the loop
        } catch (err) {
          attempt++;
          if (attempt >= maxAttempts) throw err;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, backoffTime * Math.pow(2, attempt - 1)));
        }
      }
      
      // If we got here, we couldn't decrypt the data, check for backup
      console.warn('Failed to load encrypted user data after retries, checking for backup');
      const backupData = getFromStorage('userData_backup', null);
      if (backupData) {
        console.log('Loaded user data from backup after decryption failure');
        setUserData(backupData);
      } else {
        console.warn('No backup data found, using default data');
        setUserData(defaultUserData);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading user data'));
      
      // Try to load backup data
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

  // Load data when auth status changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Improved setUserData with automatic persistence and error recovery
  const updateUserDataState = useCallback(async (newData: UserData) => {
    try {
      // Set state immediately for UI responsiveness
      setUserData(newData);
      
      // Store backup data immediately with timestamp
      saveToStorage('userData_backup', {
        ...newData,
        _backupTimestamp: new Date().toISOString()
      });
      
      // Only persist if authenticated
      if (isAuthenticated && user) {
        const privateKey = localStorage.getItem(`${KEY_PREFIX}${user.email}`);
        if (privateKey) {
          await storeUserData(newData, privateKey);
        } else {
          console.warn('User encryption key not found for storing data');
          // Create secondary backup to prevent data loss
          saveToStorage(`userData_backup_${new Date().getTime()}`, newData);
        }
      }
    } catch (err) {
      console.error('Error saving updated user data:', err);
      // Create emergency backup
      saveToStorage(`userData_emergency_${new Date().getTime()}`, newData);
    }
  }, [isAuthenticated, user]);

  // Reload data for recovery after errors
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
