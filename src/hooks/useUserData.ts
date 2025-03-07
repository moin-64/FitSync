
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/auth';
import { UserData } from '../types/user';
import { defaultUserData } from '../utils/userContext.utils';
import { decryptUserData, storeUserData } from '@/utils/userDataUtils';
import { KEY_PREFIX } from '@/constants/authConstants';

export const useUserData = (user: User | null, isAuthenticated: boolean) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Improved data loading with retries
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
        throw new Error('User encryption key not found');
      }
      
      // Decrypt the user data with retry mechanism
      const decryptedData = await decryptUserData(privateKey);
      
      if (decryptedData) {
        // Validate and ensure the data has all required fields
        const validatedData = {
          ...defaultUserData,
          ...decryptedData,
          profile: {
            ...defaultUserData.profile,
            ...decryptedData.profile,
          }
        };
        
        setUserData(validatedData);
      } else {
        console.warn('Failed to load user data, using default data');
        setUserData(defaultUserData);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading user data'));
      setUserData(defaultUserData);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load data on auth state change
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Enhanced setUserData with automatic persistence
  const updateUserDataState = useCallback(async (newData: UserData) => {
    try {
      // Set state immediately for UI responsiveness
      setUserData(newData);
      
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

  // Reload data function for recovery from errors
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
