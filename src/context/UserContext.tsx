
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { UserContextType, UserProfile } from '../types/user';
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
  const { userData, setUserData, loading, reloadData } = useUserData(user, isAuthenticated);
  const { toast } = useToast();
  
  // Set up auth state listener to reload data when user logs in/out
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Reload user data when signed in
        reloadData();
        toast({
          title: 'Angemeldet',
          description: 'Deine Trainingsdaten werden geladen',
        });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [reloadData, toast]);
  
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
