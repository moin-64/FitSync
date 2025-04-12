
import { useState, useCallback } from 'react';
import { FriendRequest } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

export function useDeclineFriendRequest(
  getFriendRequests: () => FriendRequest[],
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>,
  removeFriendRequest: (requestId: string) => FriendRequest[]
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    declineFriendRequest,
    isDecliningRequest: isLoading
  };
}
