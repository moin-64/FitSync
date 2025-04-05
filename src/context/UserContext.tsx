import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { UserContextType, UserProfile, Workout, WorkoutHistory, Friend, FriendRequest } from '../types/user';
import { useUserData } from '../hooks/useUserData';
import { saveUserData, updateProfileRank } from '../utils/userContext.utils';
import { useToast } from '@/hooks/use-toast';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { userData, setUserData, loading } = useUserData(user, isAuthenticated);
  const { toast } = useToast();

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updatedProfile = { ...userData.profile, ...data };
    const updatedData = { ...userData, profile: updatedProfile };
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const addWorkout = async (workout: Omit<Workout, 'id' | 'createdAt'>): Promise<Workout> => {
    const newWorkout: Workout = {
      ...workout,
      id: `workout-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completed: false
    };
    
    const updatedWorkouts = [...userData.workouts, newWorkout];
    const updatedData = { ...userData, workouts: updatedWorkouts };
    await saveUserData(updatedData);
    setUserData(updatedData);
    
    return newWorkout;
  };

  const updateWorkout = async (id: string, data: Partial<Workout>) => {
    const workoutIndex = userData.workouts.findIndex(w => w.id === id);
    if (workoutIndex === -1) throw new Error('Workout not found');
    
    const updatedWorkouts = [...userData.workouts];
    updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], ...data };
    
    const updatedData = { ...userData, workouts: updatedWorkouts };
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const deleteWorkout = async (id: string) => {
    const updatedWorkouts = userData.workouts.filter(w => w.id !== id);
    const updatedData = { ...userData, workouts: updatedWorkouts };
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const completeWorkout = async (id: string, stats: Omit<WorkoutHistory, 'id' | 'workoutId' | 'date'>) => {
    const workoutIndex = userData.workouts.findIndex(w => w.id === id);
    if (workoutIndex === -1) throw new Error('Workout not found');
    
    const updatedWorkouts = [...userData.workouts];
    updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], completed: true };
    
    const workoutHistory: WorkoutHistory = {
      id: `history-${Date.now()}`,
      workoutId: id,
      date: new Date().toISOString(),
      ...stats
    };
    
    const updatedHistory = [...userData.history, workoutHistory];
    
    const updatedData = {
      ...userData,
      workouts: updatedWorkouts,
      history: updatedHistory
    };
    
    const updatedProfile = updateProfileRank(updatedData);
    updatedData.profile = updatedProfile;
    
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const addLimitation = async (limitation: string) => {
    if (userData.profile.limitations.includes(limitation)) return;
    
    const updatedLimitations = [...userData.profile.limitations, limitation];
    await updateProfile({ limitations: updatedLimitations });
  };

  const removeLimitation = async (limitation: string) => {
    const updatedLimitations = userData.profile.limitations.filter(l => l !== limitation);
    await updateProfile({ limitations: updatedLimitations });
  };

  const addFriend = async (username: string) => {
    try {
      if (userData.profile.friends.some(friend => friend.username === username)) {
        toast({
          title: "Bereits Freunde",
          description: `Du bist bereits mit ${username} befreundet.`,
          variant: "destructive",
        });
        return;
      }

      if (userData.profile.friendRequests.some(req => req.fromUsername === username)) {
        toast({
          title: "Anfrage existiert bereits",
          description: `Du hast bereits eine Anfrage von ${username} erhalten.`,
          variant: "destructive",
        });
        return;
      }

      const mockFriendRequest: FriendRequest = {
        id: `request-${Date.now()}`,
        fromUserId: user?.id,
        fromUsername: username,
        sentAt: new Date().toISOString(),
        status: 'pending'
      };

      toast({
        title: "Anfrage gesendet",
        description: `Deine Freundschaftsanfrage wurde an ${username} gesendet.`,
      });
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast({
        title: "Fehler",
        description: "Die Anfrage konnte nicht gesendet werden.",
        variant: "destructive",
      });
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const request = userData.profile.friendRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Freundschaftsanfrage nicht gefunden');
      }

      const workoutsCompleted = Math.floor(Math.random() * 20);
      const maxWeight = Math.floor(Math.random() * 100) + 20;
      const avgWorkoutDuration = Math.floor(Math.random() * 3600) + 600;
      const rank = userData.profile.rank;
      const lastActive = new Date().toISOString();

      const newFriend: Friend = {
        id: request.fromUserId || request.id,
        username: request.fromUsername,
        since: new Date().toISOString(),
        workoutsCompleted,
        maxWeight,
        avgWorkoutDuration,
        rank,
        lastActive,
        stats: {
          rank,
          workoutsCompleted,
          maxWeight,
          avgWorkoutDuration,
          lastActive
        }
      };
      
      const updatedFriends = [...userData.profile.friends, newFriend];
      
      const updatedRequests = userData.profile.friendRequests.filter(
        req => req.id !== requestId
      );
      
      await updateProfile({
        friends: updatedFriends,
        friendRequests: updatedRequests,
      });
      
      toast({
        title: "Anfrage angenommen",
        description: `Du bist jetzt mit ${request.fromUsername} befreundet.`,
      });
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      toast({
        title: "Fehler",
        description: "Die Anfrage konnte nicht angenommen werden.",
        variant: "destructive",
      });
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      const updatedRequests = userData.profile.friendRequests.filter(
        req => req.id !== requestId
      );
      
      await updateProfile({
        friendRequests: updatedRequests,
      });
      
      toast({
        title: "Anfrage abgelehnt",
        description: "Die Freundschaftsanfrage wurde abgelehnt.",
      });
    } catch (error) {
      console.error('Failed to decline friend request:', error);
      toast({
        title: "Fehler",
        description: "Die Anfrage konnte nicht abgelehnt werden.",
        variant: "destructive",
      });
    }
  };

  const getFriends = (): Friend[] => {
    return userData.profile.friends || [];
  };

  const getFriendRequests = (): FriendRequest[] => {
    return userData.profile.friendRequests || [];
  };

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
