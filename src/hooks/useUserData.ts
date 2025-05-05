
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

  // Optimierte Funktion zum Laden von Benutzerdaten mit Timeout
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    // Setzen eines Timeouts für die Datenabfrage
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout beim Laden der Benutzerdaten')), 5000);
    });

    try {
      console.log("Lade Benutzerdaten für Benutzer:", user?.id);
      setLoading(true);
      setError(null);
      
      // Race zwischen Datenabfrage und Timeout
      const workoutResponse = await Promise.race([
        fetchUserWorkouts(),
        timeoutPromise
      ]) as ReturnType<typeof fetchUserWorkouts> extends Promise<infer T> ? T : never;
      
      const updatedData = {
        ...userData,
        workouts: workoutResponse.workouts || [],
        history: workoutResponse.history || []
      };
      
      setUserData(updatedData);
      console.log('Benutzerdaten erfolgreich geladen:', { 
        workoutsCount: workoutResponse.workouts?.length || 0, 
        historyCount: workoutResponse.history?.length || 0 
      });
    } catch (err) {
      console.error('Fehler beim Laden der Benutzerdaten:', err);
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler beim Laden der Benutzerdaten'));
      
      // Fallback auf zwischengespeicherte Daten, wenn vorhanden
      if (userData.workouts.length > 0 || userData.history.length > 0) {
        console.log('Verwende zwischengespeicherte Daten als Fallback');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchUserWorkouts, userData]);

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
    setUserData(newData);
  }, []);

  // Daten neu laden zur Wiederherstellung nach Fehlern
  const reloadData = useCallback(() => {
    console.log("Lade Benutzerdaten neu");
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
