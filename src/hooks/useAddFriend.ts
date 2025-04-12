
import { useState, useCallback } from 'react';
import { UserProfile, FriendRequest } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { createFriendRequestNotification } from '@/utils/userContext.utils';

export function useAddFriend(
  profile: UserProfile,
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>,
  getFriends: () => any[],
  getFriendRequests: () => FriendRequest[],
  addFriendRequest: (request: FriendRequest) => FriendRequest[]
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    const existingFriend = getFriends().find(friend => 
      friend && friend.username && friend.username.toLowerCase() === normalizedUsername.toLowerCase()
    );
    
    if (existingFriend) {
      toast({
        title: 'Information',
        description: 'Ihr seid bereits Freunde',
      });
      return false;
    }
    
    // Check if request already sent - case insensitive comparison
    const existingRequest = getFriendRequests().some(request => 
      request && request.fromUsername && 
      request.fromUsername.toLowerCase() === normalizedUsername.toLowerCase()
    );
    
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
        fromUserId: profile.id || '',
        sentAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Create a notification for the recipient
      const notification = createFriendRequestNotification(newRequest);
      
      // Store in localStorage to simulate a pending request - only for the recipient
      // Fixed: Don't store the request for the current user, only for the recipient
      const existingNotifications = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
      existingNotifications.push({
        username: normalizedUsername, // This is the recipient username
        notification,
        request: newRequest
      });
      localStorage.setItem('pendingNotifications', JSON.stringify(existingNotifications));
      
      // We don't need to add this to the current user's requests anymore
      // This was causing the "anonymous" friend request issue
      
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

  return {
    addFriend,
    isAddingFriend: isLoading
  };
}
