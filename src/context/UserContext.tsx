
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { UserContextType, UserProfile } from '../types/user';
import { useUserData } from '../hooks/useUserData';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutManagement } from '@/hooks/useWorkoutManagement';
import { useFriends } from '@/hooks/useFriends';
import { useProfileManagement } from '@/hooks/useProfileManagement';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { userData, setUserData, loading } = useUserData(user, isAuthenticated);
  const { toast } = useToast();
  
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
        // Functions from useFriends now match the updated type
        addFriend,
        acceptFriendRequest, 
        declineFriendRequest,
        getFriends,
        getFriendRequests
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
