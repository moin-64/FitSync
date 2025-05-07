
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types/auth';
import { UserData } from '../types/user';
import { defaultUserData } from '../utils/userContext.utils';
import { useSupabaseWorkouts } from './useSupabaseWorkouts';
import { useToast } from './use-toast';

// Cache timeouts and request limits
const CACHE_VALIDITY = 60000; // 1 minute
const MIN_TIME_BETWEEN_FETCHES = 3000; // 3 seconds
const REQUEST_TIMEOUT = 8000; // 8 seconds

export const useUserData = (user: User | null, isAuthenticated: boolean) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  
  const { fetchUserWorkouts } = useSupabaseWorkouts();
  const { toast } = useToast();

  // Optimized loading function with improved caching and error handling
  const loadUserData = useCallback(async (forceRefresh = false) => {
    // Skip if not authenticated
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    
    // Prevent concurrent fetches
    if (isFetching) {
      console.log('Already fetching data, request skipped');
      return;
    }

    // Use cache unless force refresh requested
    const now = Date.now();
    if (!forceRefresh && now - cacheTimestamp < CACHE_VALIDITY) {
      console.log(`Using cached data (valid for ${((CACHE_VALIDITY - (now - cacheTimestamp)) / 1000).toFixed(1)}s)`);
      setLoading(false);
      return;
    }

    // Rate limiting
    if (now - lastFetchTime < MIN_TIME_BETWEEN_FETCHES) {
      console.log('Rate limiting applied, delaying request...');
      await new Promise(resolve => setTimeout(resolve, MIN_TIME_BETWEEN_FETCHES - (now - lastFetchTime)));
    }
    
    setIsFetching(true);
    setLoading(true);
    setError(null);
    setLastFetchTime(Date.now());
    
    // Set request timeout
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Data loading timeout')), REQUEST_TIMEOUT);
    });

    try {
      // Race between data fetch and timeout
      const workoutResponse = await Promise.race([
        fetchUserWorkouts(),
        timeoutPromise
      ]);
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (!workoutResponse) {
        throw new Error('No data received from server');
      }
      
      // Data sanitization and validation
      const sanitizedWorkouts = workoutResponse.workouts?.map(workout => ({
        ...workout,
        name: sanitizeInput(workout.name),
        exercises: workout.exercises?.map(exercise => ({
          ...exercise,
          name: sanitizeInput(exercise.name),
          equipment: sanitizeInput(exercise.equipment)
        }))
      })) || [];
      
      const sanitizedHistory = workoutResponse.history?.map(hist => ({
        ...hist
      })) || [];
      
      // Data integrity validation
      const hasValidData = validateWorkoutData(sanitizedWorkouts);
      if (!hasValidData) {
        console.warn('Invalid data received, using previous data');
        toast({
          title: 'Data validation failed',
          description: 'Invalid data received. Using previous data.',
          variant: 'destructive'
        });
        setLoading(false);
        setIsFetching(false);
        return;
      }
      
      const updatedData = {
        ...userData,
        workouts: sanitizedWorkouts,
        history: sanitizedHistory
      };
      
      setUserData(updatedData);
      setCacheTimestamp(now);
      
      // Save to localStorage for offline access
      try {
        localStorage.setItem('userData_cache', JSON.stringify({
          data: updatedData,
          timestamp: now
        }));
      } catch (e) {
        console.warn('Failed to cache user data:', e);
      }
      
      console.log('User data loaded successfully', { 
        workoutsCount: sanitizedWorkouts.length, 
        historyCount: sanitizedHistory.length 
      });
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading user data'));
      
      // Try to load from localStorage cache
      try {
        const cachedDataJson = localStorage.getItem('userData_cache');
        if (cachedDataJson) {
          const cachedData = JSON.parse(cachedDataJson);
          if (cachedData && cachedData.data) {
            console.log('Using cached data as fallback');
            setUserData(cachedData.data);
            toast({
              title: 'Using offline data',
              description: 'Could not connect to server. Using cached data.',
              variant: 'destructive'
            });
          }
        }
      } catch (e) {
        console.error('Failed to retrieve cached data:', e);
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [isAuthenticated, user, fetchUserWorkouts, userData, lastFetchTime, cacheTimestamp, toast, isFetching]);

  // Use memo for derived values
  const hasData = useMemo(() => 
    userData.workouts.length > 0 || userData.history.length > 0, 
    [userData.workouts.length, userData.history.length]
  );

  // Helper functions for data validation
  const validateWorkoutData = (workouts: any[]): boolean => {
    if (!Array.isArray(workouts)) return false;
    
    return !workouts.some(workout => {
      if (typeof workout !== 'object' || workout === null) return true;
      
      if (workout.name && containsSuspiciousPatterns(workout.name)) return true;
      
      if (Array.isArray(workout.exercises)) {
        return workout.exercises.some(exercise => {
          if (typeof exercise !== 'object' || exercise === null) return true;
          if (exercise.name && containsSuspiciousPatterns(exercise.name)) return true;
          if (exercise.equipment && containsSuspiciousPatterns(exercise.equipment)) return true;
          if (exercise.video_url && !isValidURL(exercise.video_url)) return true;
          return false;
        });
      }
      
      return false;
    });
  };
  
  const containsSuspiciousPatterns = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+=/gi,
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
      /(\%3C)|<[^>]+>|(\%3E)/gi
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };
  
  const isValidURL = (url: string): boolean => {
    if (!url) return true;
    
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch (e) {
      return false;
    }
  };
  
  const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .trim();
  };

  // Load data on authentication state change with debouncing
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;
    
    if (isAuthenticated && user) {
      // Use debounce to prevent multiple quick loads
      debounceTimeout = setTimeout(() => {
        console.log("Loading user data after auth change");
        loadUserData();
      }, 300);
    } else {
      console.log("User not authenticated, skipping data load");
      setLoading(false);
    }
    
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [isAuthenticated, user, loadUserData]);

  // Try to load cached data on startup for instant UI feedback
  useEffect(() => {
    try {
      const cachedDataJson = localStorage.getItem('userData_cache');
      if (cachedDataJson && isAuthenticated) {
        const cachedData = JSON.parse(cachedDataJson);
        if (cachedData && cachedData.data) {
          console.log('Using initially cached data while fetching fresh data');
          setUserData(cachedData.data);
        }
      }
    } catch (e) {
      console.error('Failed to load initial cached data:', e);
    }
  }, [isAuthenticated]);

  // Optimized update function with validation
  const updateUserDataState = useCallback((newData: UserData) => {
    // Sanitize and validate before update
    const sanitizedData = {
      ...newData,
      profile: {
        ...newData.profile,
        limitations: Array.isArray(newData.profile.limitations) 
          ? newData.profile.limitations.map(sanitizeInput) 
          : []
      },
      workouts: Array.isArray(newData.workouts)
        ? newData.workouts.map(w => ({
            ...w,
            name: sanitizeInput(w.name),
            exercises: Array.isArray(w.exercises)
              ? w.exercises.map(e => ({
                  ...e,
                  name: sanitizeInput(e.name),
                  equipment: sanitizeInput(e.equipment),
                  video_url: e.video_url ? sanitizeInput(e.video_url) : undefined
                }))
              : []
          }))
        : []
    };
    
    setUserData(sanitizedData);
    setCacheTimestamp(Date.now());
    
    // Update local cache
    try {
      localStorage.setItem('userData_cache', JSON.stringify({
        data: sanitizedData,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to update cached user data:', e);
    }
  }, []);

  // Force reload function with optimistic UI updates
  const reloadData = useCallback((force = false) => {
    console.log("Reloading user data", force ? "(forced)" : "");
    
    if (force) {
      // Show toast for better UX during reload
      toast({
        title: 'Refreshing data',
        description: 'Loading the latest data from the server...'
      });
    }
    
    loadUserData(force);
  }, [loadUserData, toast]);

  return { 
    userData, 
    setUserData: updateUserDataState, 
    loading, 
    error,
    reloadData,
    hasData
  };
};
