
import { useState, useCallback } from 'react';
import { Friend, FriendRequest, UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { useFriendsList } from './useFriendsList';
import { useFriendRequests } from './useFriendRequests';
import { findFriendByUsername, hasPendingRequest } from '@/utils/userContext.utils';

export function useFriendActions(
  profile: UserProfile,
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Use the new hooks for Friends and Requests
  const { 
    getFriends, 
    addFriendToList
  } = useFriendsList(profile);
  
  const { 
    getFriendRequests, 
    addFriendRequest, 
    removeFriendRequest 
  } = useFriendRequests(profile);

  // Add a friend (send friend request) with improved error handling
  const addFriend = useCallback(async (username: string): Promise<boolean> => {
    if (!username || !username.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen gültigen Benutzernamen ein',
        variant: 'destructive',
      });
      return false;
    }
    
    const normalizedUsername = username.trim();
    
    // Check if trying to add self
    if (profile.username && normalizedUsername.toLowerCase() === profile.username.toLowerCase()) {
      toast({
        title: 'Fehler',
        description: 'Du kannst dich nicht selbst als Freund hinzufügen',
        variant: 'destructive',
      });
      return false;
    }
    
    // Check if already friends - case insensitive comparison
    const existingFriend = findFriendByUsername(getFriends(), normalizedUsername);
    if (existingFriend) {
      toast({
        title: 'Information',
        description: 'Ihr seid bereits Freunde',
      });
      return false;
    }
    
    // Check if request already sent - case insensitive comparison
    const existingRequest = hasPendingRequest(getFriendRequests(), normalizedUsername);
    if (existingRequest) {
      toast({
        title: 'Information',
        description: 'Freundschaftsanfrage wurde bereits gesendet',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Delay to simulate API call and prevent accidental multiple submissions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a friend request for the recipient
      const newRequest: FriendRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        fromUsername: profile.username || 'anonymous',
        fromUserId: profile.id,
        sentAt: new Date().toISOString(),
        status: 'pending'
      };
      
      const updatedRequests = addFriendRequest(newRequest);
      
      await updateProfileFn({
        friendRequests: updatedRequests
      });
      
      toast({
        title: 'Erfolg',
        description: `Freundschaftsanfrage an ${username} gesendet`,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast({
        title: 'Fehler',
        description: 'Freundschaftsanfrage konnte nicht gesendet werden',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile, getFriends, getFriendRequests, updateProfileFn, toast, addFriendRequest]);

  // Accept a friend request with improved error handling
  const acceptFriendRequest = useCallback(async (requestId: string): Promise<boolean> => {
    const requests = getFriendRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      toast({
        title: 'Fehler',
        description: 'Freundschaftsanfrage nicht gefunden',
        variant: 'destructive',
      });
      return false;
    }
    
    const request = requests[requestIndex];
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate random stats for the new friend
      const workoutsCompleted = Math.floor(Math.random() * 20);
      const maxWeight = Math.floor(Math.random() * 100) + 20;
      const avgWorkoutDuration = Math.floor(Math.random() * 3600) + 600;
      const friendRank = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'][Math.floor(Math.random() * 5)] as any;
      const lastActive = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
      
      // Add to friend list
      const newFriend: Friend = {
        id: request.fromUserId || request.id,
        username: request.fromUsername,
        since: new Date().toISOString(),
        workoutsCompleted,
        maxWeight,
        avgWorkoutDuration,
        rank: friendRank,
        lastActive,
        stats: {
          workoutsCompleted,
          maxWeight,
          avgWorkoutDuration,
          rank: friendRank,
          lastActive
        }
      };
      
      // In a real app we would update this on the server
      const updatedFriends = addFriendToList(newFriend);
      const updatedRequests = removeFriendRequest(requestId);
      
      await updateProfileFn({
        friends: updatedFriends,
        friendRequests: updatedRequests
      });
      
      toast({
        title: 'Erfolg',
        description: `${request.fromUsername} ist jetzt dein Freund`,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      toast({
        title: 'Fehler',
        description: 'Freundschaftsanfrage konnte nicht akzeptiert werden',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getFriendRequests, updateProfileFn, toast, addFriendToList, removeFriendRequest]);

  // Decline a friend request
  const declineFriendRequest = useCallback(async (requestId: string): Promise<boolean> => {
    const requests = getFriendRequests();
    
    if (!requests.some(r => r.id === requestId)) {
      toast({
        title: 'Fehler',
        description: 'Freundschaftsanfrage nicht gefunden',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app we would update this on the server
      const updatedRequests = removeFriendRequest(requestId);
      
      await updateProfileFn({
        friendRequests: updatedRequests
      });
      
      toast({
        title: 'Information',
        description: 'Freundschaftsanfrage abgelehnt',
      });
      
      return true;
    } catch (error) {
      console.error('Failed to decline friend request:', error);
      toast({
        title: 'Fehler',
        description: 'Freundschaftsanfrage konnte nicht abgelehnt werden',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getFriendRequests, updateProfileFn, toast, removeFriendRequest]);

  return {
    isLoading,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends,
    getFriendRequests
  };
}
