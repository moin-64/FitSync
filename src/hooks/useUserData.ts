
import { useState, useEffect } from 'react';
import { User } from '../types/auth';
import { UserData } from '../types/user';
import { defaultUserData } from '../utils/userContext.utils';

export const useUserData = (user: User | null, isAuthenticated: boolean) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // In a real app, we would fetch the encrypted data from a server
        // and decrypt it with the user's key
        
        // For demo, we're loading from localStorage
        const encryptedData = localStorage.getItem('userData');
        if (encryptedData) {
          // Placeholder - in real app would use actual decryption with user's key
          const userDataString = encryptedData; // This would be decrypted
          try {
            const parsedData = JSON.parse(userDataString);
            setUserData(parsedData);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUserData(defaultUserData);
          }
        } else {
          setUserData(defaultUserData);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, user]);

  return { userData, setUserData, loading };
};
