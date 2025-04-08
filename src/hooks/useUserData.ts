
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
      
      // Decrypt user data with retry mechanism
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
        
        // Also store a backup copy in unencrypted format
        saveToStorage('userData_backup', validatedData);
      } else {
        console.warn('Failed to load encrypted user data, checking for backup');
        // Try to load backup data
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

  // Improved setUserData with automatic persistence
  const updateUserDataState = useCallback(async (newData: UserData) => {
    try {
      // Set state immediately for UI responsiveness
      setUserData(newData);
      
      // Store backup data immediately
      saveToStorage('userData_backup', newData);
      
      // Only persist if authenticated
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
