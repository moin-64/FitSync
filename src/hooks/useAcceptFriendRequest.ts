
import { useState, useCallback } from 'react';
import { FriendRequest, Notification, UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

export function useAcceptFriendRequest(
  getFriendRequests: () => FriendRequest[],
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>,
  addFriendToList: (friend: any) => any[],
  removeFriendRequest: (requestId: string) => FriendRequest[],
  addNotification: (notification: Notification) => Notification[]
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const newFriend = {
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
      
      // Add notification that friend was accepted
      const acceptNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: 'friendAccepted',
        title: 'Freundschaftsanfrage angenommen',
        message: `Du hast die Freundschaftsanfrage von ${request.fromUsername} angenommen`,
        createdAt: new Date().toISOString(),
        read: false,
        fromUsername: request.fromUsername
      };
      
      const updatedNotifications = addNotification(acceptNotification);
      
      // In a real app we would update this on the server
      const updatedFriends = addFriendToList(newFriend);
      const updatedRequests = removeFriendRequest(requestId);
      
      await updateProfileFn({
        friends: updatedFriends,
        friendRequests: updatedRequests,
        notifications: updatedNotifications
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
  }, [getFriendRequests, updateProfileFn, toast, addFriendToList, removeFriendRequest, addNotification]);

  return {
    acceptFriendRequest,
    isAcceptingRequest: isLoading
  };
}
