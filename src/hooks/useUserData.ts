
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types/auth';
import { UserData } from '../types/user';
import { defaultUserData } from '../utils/userContext.utils';
import { useSupabaseWorkouts } from './useSupabaseWorkouts';
import { useToast } from './use-toast';

export const useUserData = (user: User | null, isAuthenticated: boolean) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { fetchUserWorkouts } = useSupabaseWorkouts();
  const { toast } = useToast();

  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping data load');
      setLoading(false);
      return;
    }
    
    console.log('Loading user data for:', user.id);
    setLoading(true);
    setError(null);
    
    try {
      const workoutResponse = await fetchUserWorkouts();
      
      if (!workoutResponse) {
        throw new Error('No data received from server');
      }
      
      const updatedData = {
        ...userData,
        workouts: workoutResponse.workouts || [],
        history: workoutResponse.history || []
      };
      
      setUserData(updatedData);
      
      console.log('User data loaded successfully', { 
        workoutsCount: workoutResponse.workouts?.length || 0, 
        historyCount: workoutResponse.history?.length || 0 
      });
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading user data'));
      
      toast({
        title: 'Fehler beim Laden der Daten',
        description: 'Konnte Trainingsdaten nicht laden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, fetchUserWorkouts, toast]);

  // Load data only when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const updateUserDataState = useCallback((newData: UserData) => {
    setUserData(newData);
  }, []);

  const reloadData = useCallback(() => {
    console.log("Reloading user data");
    loadUserData();
  }, [loadUserData]);

  const hasData = useMemo(() => 
    userData.workouts.length > 0 || userData.history.length > 0, 
    [userData.workouts.length, userData.history.length]
  );

  return { 
    userData, 
    setUserData: updateUserDataState, 
    loading, 
    error,
    reloadData,
    hasData
  };
};
