
import { useState, useCallback } from 'react';
import { Friend, FriendRequest, UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { findFriendByUsername, hasPendingRequest } from '@/utils/userContext.utils';

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
    
    const normalizedUsername = username.trim().toLowerCase();
    
    // Check if trying to add self
    if (profile.username && normalizedUsername === profile.username.toLowerCase()) {
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
        fromId: profile.id || 'unknown',
        sentAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Update the profile (in a real app this would happen on the server)
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
  }, [profile, getFriends, getFriendRequests, toast]);

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
      
      // Add to friends list
      const newFriend: Friend = {
        id: request.fromId,
        username: request.fromUsername,
        since: new Date().toISOString(),
        stats: {
          workoutsCompleted: Math.floor(Math.random() * 20),
          maxWeight: Math.floor(Math.random() * 100) + 20,
          avgWorkoutDuration: Math.floor(Math.random() * 3600) + 600,
          rank: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)]
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

  // Remove an existing friend
  const removeFriend = useCallback(async (friendId: string): Promise<boolean> => {
    const friends = getFriends();
    const friendToRemove = friends.find(f => f.id === friendId);
    
    if (!friendToRemove) {
      toast({
        title: 'Fehler',
        description: 'Freund nicht gefunden',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, we would update this on the server
      const updatedFriends = friends.filter(f => f.id !== friendId);
      
      await updateProfileFn({
        friends: updatedFriends
      });
      
      toast({
        title: 'Information',
        description: `${friendToRemove.username} wurde aus deiner Freundesliste entfernt`,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast({
        title: 'Fehler',
        description: 'Freund konnte nicht entfernt werden',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getFriends, updateProfileFn, toast]);

  return {
    isLoading,
    getFriends,
    getFriendRequests,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend
  };
}
