
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
    // Mark workout as completed
    const workoutIndex = userData.workouts.findIndex(w => w.id === id);
    if (workoutIndex === -1) throw new Error('Workout not found');
    
    const updatedWorkouts = [...userData.workouts];
    updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], completed: true };
    
    // Add to workout history
    const workoutHistory: WorkoutHistory = {
      id: `history-${Date.now()}`,
      workoutId: id,
      date: new Date().toISOString(),
      ...stats
    };
    
    const updatedHistory = [...userData.history, workoutHistory];
    
    // Calculate new rank based on workout achievements
    const updatedData = {
      ...userData,
      workouts: updatedWorkouts,
      history: updatedHistory
    };
    
    // Update rank if eligible for promotion
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

  // Friend-related functions
  const addFriend = async (username: string) => {
    try {
      // In a real app, this would involve making API calls to find the user and send a request
      // For now, we're simulating it

      // Check if friend request already exists
      if (userData.profile.friendRequests?.some(req => req.fromUsername === username)) {
        toast({
          title: "Anfrage existiert bereits",
          description: `Du hast bereits eine Anfrage an ${username} gesendet.`,
          variant: "destructive",
        });
        return;
      }

      // Create a mock request (in a real app, this would be stored at the recipient's end)
      const mockFriendRequest: FriendRequest = {
        id: `request-${Date.now()}`,
        fromUserId: user?.id || "current-user",
        fromUsername: user?.username || "current-user",
        sentAt: new Date().toISOString(),
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
      const request = userData.profile.friendRequests?.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Freundschaftsanfrage nicht gefunden');
      }

      // Add to friends list
      const updatedFriends = [...(userData.profile.friends || []), request.fromUserId];
      
      // Remove from requests
      const updatedRequests = userData.profile.friendRequests?.filter(
        req => req.id !== requestId
      ) || [];
      
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
      const updatedRequests = userData.profile.friendRequests?.filter(
        req => req.id !== requestId
      ) || [];
      
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
    // In a real app, this would fetch actual user data from a database
    // For now, we'll create mock data based on friend IDs
    
    if (!userData.profile.friends || userData.profile.friends.length === 0) {
      return [];
    }
    
    return userData.profile.friends.map(friendId => ({
      id: friendId,
      username: `User_${friendId.split('-')[1]}`,
      rank: Math.random() > 0.5 ? 'Beginner' : 'Intermediate',
      workoutsCompleted: Math.floor(Math.random() * 20),
      maxWeight: Math.floor(Math.random() * 100) + 20,
      avgWorkoutDuration: (Math.floor(Math.random() * 30) + 15) * 60, // 15-45 minutes in seconds
      lastActive: Math.random() > 0.3 ? new Date().toISOString() : undefined,
    }));
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
