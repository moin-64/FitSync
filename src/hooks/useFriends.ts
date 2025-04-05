
import { useState, useCallback } from 'react';
import { Friend, FriendRequest, UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { findFriendByUsername, hasPendingRequest } from '@/utils/userContext.utils';
import { Rank } from '@/utils/rankingUtils';

export function useFriends(
  profile: UserProfile,
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get friends list with proper error handling
  const getFriends = useCallback((): Friend[] => {
    return Array.isArray(profile.friends) ? profile.friends : [];
  }, [profile.friends]);

  // Get friend requests with proper error handling
  const getFriendRequests = useCallback((): FriendRequest[] => {
    return Array.isArray(profile.friendRequests) ? profile.friendRequests : [];
  }, [profile.friendRequests]);

  // Add a friend (send friend request)
  const addFriend = useCallback(async (username: string): Promise<boolean> => {
    if (!username.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen gültigen Benutzernamen ein',
        variant: 'destructive',
      });
      return false;
    }
    
    const normalizedUsername = username.trim();
    
    // Check if trying to add self
    if (profile.username && normalizedUsername === profile.username) {
      toast({
        title: 'Fehler',
        description: 'Du kannst dich nicht selbst als Freund hinzufügen',
        variant: 'destructive',
      });
      return false;
    }
    
    // Check if already friends
    if (findFriendByUsername(getFriends(), normalizedUsername)) {
      toast({
        title: 'Information',
        description: 'Ihr seid bereits Freunde',
      });
      return false;
    }
    
    // Check if request already sent
    if (hasPendingRequest(getFriendRequests(), normalizedUsername)) {
      toast({
        title: 'Information',
        description: 'Freundschaftsanfrage wurde bereits gesendet',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, we would send this to a server
      // For demo, we'll just update the local state
      
      // Create a mock friend request for the recipient
      const newRequest: FriendRequest = {
        id: `req-${Date.now()}`,
        fromUsername: profile.username || 'anonymous',
        fromUserId: profile.id,
        sentAt: new Date().toISOString(),
        status: 'pending'
      };
      
      const existingRequests = getFriendRequests();
      const updatedRequests = [...existingRequests, newRequest];
      
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
  }, [profile, getFriends, getFriendRequests, toast, updateProfileFn]);

  // Accept a friend request
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
      const friendRank: Rank = ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)] as Rank;
      const lastActive = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
      
      // Add to friends list
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
      
      // In a real app, we would update this on the server
      const updatedFriends = [...getFriends(), newFriend];
      const updatedRequests = requests.filter(r => r.id !== requestId);
      
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
  }, [getFriends, getFriendRequests, updateProfileFn, toast]);

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
      
      // In a real app, we would update this on the server
      const updatedRequests = requests.filter(r => r.id !== requestId);
      
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
  }, [getFriendRequests, updateProfileFn, toast]);

  return {
    isLoading,
    getFriends,
    getFriendRequests,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest
  };
}
