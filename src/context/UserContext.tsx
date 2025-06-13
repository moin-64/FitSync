
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { UserContextType } from '../types/user';
import { useUserData } from '../hooks/useUserData';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutManagement } from '@/hooks/useWorkoutManagement';
import { useFriends } from '@/hooks/useFriends';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useNotifications } from '@/hooks/useNotifications';
import { generateCSRFToken } from '../services/authService';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { userData, setUserData, loading, reloadData, error } = useUserData(user, isAuthenticated);
  const { toast } = useToast();
  const [csrfToken, setCsrfToken] = useState<string>('');
  
  // CSRF-Token beim Mounten generieren
  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);
  
  // Show error toast if there's an error loading user data
  useEffect(() => {
    if (error) {
      console.error("Error loading user data:", error);
      toast({
        title: 'Fehler beim Laden der Daten',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [error, toast]);
  
  // Use our extracted hooks for specific functionality domains
  const {
    updateProfile,
    addLimitation,
    removeLimitation
  } = useProfileManagement(userData, setUserData);
  
  const {
    addWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout
  } = useWorkoutManagement(userData, setUserData);
  
  const {
    addFriend,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends,
    getFriendRequests
  } = useFriends(userData.profile, updateProfile);

  const {
    getNotifications,
    markNotificationAsRead,
    clearNotification
  } = useNotifications(userData.profile, updateProfile);

  return (
    <UserContext.Provider
      value={{
        profile: userData.profile,
        workouts: userData.workouts,
        history: userData.history,
        loading,
        csrfToken,
        updateProfile,
        addWorkout,
        updateWorkout: async (id: string, workout: Partial<any>) => {
          try {
            await updateWorkout(id, workout);
            return true;
          } catch (error) {
            console.error('Error updating workout:', error);
            return false;
          }
        },
        deleteWorkout: async (id: string) => {
          try {
            await deleteWorkout(id);
            return true;
          } catch (error) {
            console.error('Error deleting workout:', error);
            return false;
          }
        },
        completeWorkout: async (workoutId: string, performance: any) => {
          try {
            await completeWorkout(workoutId, performance);
            return true;
          } catch (error) {
            console.error('Error completing workout:', error);
            return false;
          }
        },
        addLimitation: async (limitation: string) => {
          try {
            await addLimitation(limitation);
            return true;
          } catch (error) {
            console.error('Error adding limitation:', error);
            return false;
          }
        },
        removeLimitation: async (limitation: string) => {
          try {
            await removeLimitation(limitation);
            return true;
          }
        },
        // Functions from useFriends
        addFriend,
        acceptFriendRequest, 
        declineFriendRequest,
        getFriends,
        getFriendRequests,
        // Functions from useNotifications
        getNotifications,
        markNotificationAsRead,
        clearNotification
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
