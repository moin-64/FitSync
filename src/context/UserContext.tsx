
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { UserContextType } from '../types/user';
import { useUserData } from '../hooks/useUserData';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutManagement } from '@/hooks/useWorkoutManagement';
import { useFriends } from '@/hooks/useFriends';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { userData, setUserData, loading, reloadData, error } = useUserData(user, isAuthenticated);
  const { toast } = useToast();
  
  // Set up auth state listener to reload data when user logs in/out
  useEffect(() => {
    if (isAuthenticated && user) {
      // Reload user data when authenticated
      console.log("User authenticated, loading data", user.id);
      reloadData();
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Reload user data when signed in
        console.log("Auth state change: SIGNED_IN");
        reloadData();
        toast({
          title: 'Angemeldet',
          description: 'Deine Trainingsdaten werden geladen',
        });
      } else if (event === 'SIGNED_OUT') {
        console.log("Auth state change: SIGNED_OUT");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated, user, reloadData, toast]);
  
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
        updateProfile,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        completeWorkout,
        addLimitation,
        removeLimitation,
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
