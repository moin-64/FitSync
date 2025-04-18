import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/auth';
import { UserData } from '../types/user';
import { defaultUserData } from '../utils/userContext.utils';
import { useSupabaseWorkouts } from './useSupabaseWorkouts';

export const useUserData = (user: User | null, isAuthenticated: boolean) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { fetchUserWorkouts } = useSupabaseWorkouts();

  // Load user data from Supabase
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load profile data - for now we keep using the existing profile structure
      // Eventually we could move this to Supabase as well
      
      // Load workouts and history from Supabase
      const { workouts, history } = await fetchUserWorkouts();
      
      const updatedData = {
        ...userData,
        workouts,
        history
      };
      
      setUserData(updatedData);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading user data'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchUserWorkouts, userData]);

  // Load data when auth status changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Simplified setUserData function as we'll handle persistence in specific hooks
  const updateUserDataState = useCallback(async (newData: UserData) => {
    setUserData(newData);
  }, []);

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
