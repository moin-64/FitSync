
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/auth';
import { UserData } from '../types/user';
import { defaultUserData } from '../utils/userContext.utils';
import { useSupabaseWorkouts } from './useSupabaseWorkouts';
import { useToast } from './use-toast';

export const useUserData = (user: User | null, isAuthenticated: boolean) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const { fetchUserWorkouts } = useSupabaseWorkouts();
  const { toast } = useToast();
  
  // Caching mechanism to reduce redundant fetches
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const CACHE_VALIDITY = 60000; // Cache valid for 1 minute

  // Optimierte Funktion zum Laden von Benutzerdaten mit Timeout und Ratenbegrenzung
  const loadUserData = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    
    // Skip fetching if already in progress
    if (isFetching) {
      console.log('Bereits beim Laden der Daten, Anfrage übersprungen');
      return;
    }

    // Check cache validity unless force refresh
    const now = Date.now();
    if (!forceRefresh && now - cacheTimestamp < CACHE_VALIDITY) {
      console.log('Verwende zwischengespeicherte Daten', { 
        cacheAge: (now - cacheTimestamp) / 1000 + 's',
        validFor: (CACHE_VALIDITY - (now - cacheTimestamp)) / 1000 + 's'
      });
      setLoading(false);
      return;
    }

    // Prüfen auf zu häufige Anfragen (Rate-Limiting)
    const minTimeBetweenFetches = 3000; // 3 Sekunden zwischen Anfragen
    
    if (now - lastFetchTime < minTimeBetweenFetches) {
      console.log('Zu viele Anfragen in kurzer Zeit, Anfrage verzögert...');
      await new Promise(resolve => setTimeout(resolve, minTimeBetweenFetches - (now - lastFetchTime)));
    }
    
    setIsFetching(true);
    setLoading(true);
    setError(null);
    setLastFetchTime(now);
    
    // Setzen eines Timeouts für die Datenabfrage
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Timeout beim Laden der Benutzerdaten')), 8000);
    });

    try {
      console.log("Lade Benutzerdaten für Benutzer:", user?.id);
      
      // Race zwischen Datenabfrage und Timeout
      const workoutResponse = await Promise.race([
        fetchUserWorkouts(),
        timeoutPromise
      ]) as ReturnType<typeof fetchUserWorkouts> extends Promise<infer T> ? T : never;
      
      // Clear timeout if request succeeded
      if (timeoutId) clearTimeout(timeoutId);
      
      // Sanitierung und Validierung der empfangenen Daten
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
      
      // Validierung der Datenintegrität
      const hasValidData = validateWorkoutData(sanitizedWorkouts);
      if (!hasValidData) {
        console.warn('Ungültige oder verdächtige Daten empfangen, verwende vorherige Daten');
        toast({
          title: 'Datenvalidierung fehlgeschlagen',
          description: 'Es wurden ungültige Daten empfangen. Ihre vorherigen Daten werden verwendet.',
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
      
      console.log('Benutzerdaten erfolgreich geladen:', { 
        workoutsCount: sanitizedWorkouts.length, 
        historyCount: sanitizedHistory.length 
      });
    } catch (err) {
      console.error('Fehler beim Laden der Benutzerdaten:', err);
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler beim Laden der Benutzerdaten'));
      
      // Fallback auf zwischengespeicherte Daten, wenn vorhanden
      if (userData.workouts.length > 0 || userData.history.length > 0) {
        console.log('Verwende zwischengespeicherte Daten als Fallback');
        toast({
          title: 'Fehler beim Laden',
          description: 'Die neuesten Daten konnten nicht abgerufen werden. Offline-Daten werden verwendet.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [isAuthenticated, user, fetchUserWorkouts, userData, lastFetchTime, cacheTimestamp, toast, isFetching]);

  // Hilfsfunktion zur Validierung der Datenintegrität
  const validateWorkoutData = (workouts: any[]): boolean => {
    if (!Array.isArray(workouts)) return false;
    
    // Überprüfen auf verdächtige Daten oder Injektionsversuche
    return !workouts.some(workout => {
      if (typeof workout !== 'object' || workout === null) return true;
      
      // Überprüfen auf verdächtige Eigenschaftswerte
      if (workout.name && containsSuspiciousPatterns(workout.name)) return true;
      
      // Überprüfen der Übungen
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
  
  // Überprüfung auf verdächtige Muster (XSS, SQL-Injection, etc.)
  const containsSuspiciousPatterns = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script-Tags
      /javascript:/gi, // JavaScript-URLs
      /on\w+=/gi, // Event-Handler
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi, // SQL-Injection
      /(\%3C)|<[^>]+>|(\%3E)/gi // HTML-Tags
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };
  
  // Überprüfung auf gültige URLs
  const isValidURL = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch (e) {
      return false;
    }
  };
  
  // Sanitieren von Benutzereingaben
  const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<[^>]*>/g, '') // Entfernen von HTML-Tags
      .replace(/javascript:/gi, '') // Entfernen von JavaScript-URLs
      .trim();
  };

  // Daten laden, wenn sich der Authentifizierungsstatus ändert
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Authentifizierungsstatus geändert, lade Benutzerdaten");
      loadUserData();
    } else {
      console.log("Benutzer nicht authentifiziert, keine Daten laden");
    }
  }, [isAuthenticated, user, loadUserData]);

  // Vereinfachte setUserData-Funktion, da wir die Persistenz in bestimmten Hooks behandeln
  const updateUserDataState = useCallback(async (newData: UserData) => {
    // Validierung und Sanitierung der Daten vor dem Update
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
    // Update cache timestamp to avoid unnecessary refetches
    setCacheTimestamp(Date.now());
  }, []);

  // Daten neu laden zur Wiederherstellung nach Fehlern
  const reloadData = useCallback((force = false) => {
    console.log("Lade Benutzerdaten neu", force ? "(erzwungen)" : "");
    loadUserData(force);
  }, [loadUserData]);

  return { 
    userData, 
    setUserData: updateUserDataState, 
    loading, 
    error,
    reloadData
  };
};
