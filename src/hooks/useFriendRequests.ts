
import { useState, useCallback } from 'react';
import { FriendRequest, UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { hasPendingRequest } from '@/utils/userContext.utils';
import { saveToStorage } from '@/utils/localStorage';

export function useFriendRequests(
  profile: UserProfile
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Freundschaftsanfragen mit korrekter Fehlerbehandlung abrufen
  const getFriendRequests = useCallback((): FriendRequest[] => {
    return Array.isArray(profile.friendRequests) ? profile.friendRequests : [];
  }, [profile.friendRequests]);

  // Eine neue Freundschaftsanfrage hinzufügen
  const addFriendRequest = useCallback((request: FriendRequest): FriendRequest[] => {
    try {
      const existingRequests = getFriendRequests();
      const updatedRequests = [...existingRequests, request];
      
      // Speichere im localStorage für bessere Persistenz
      saveToStorage('pendingFriendRequests', updatedRequests);
      
      return updatedRequests;
    } catch (storageError) {
      console.error('Failed to save friend requests:', storageError);
      return getFriendRequests();
    }
  }, [getFriendRequests]);

  // Eine Freundschaftsanfrage entfernen
  const removeFriendRequest = useCallback((requestId: string): FriendRequest[] => {
    try {
      const requests = getFriendRequests();
      const updatedRequests = requests.filter(r => r.id !== requestId);
      
      // Speichere im localStorage für bessere Persistenz
      saveToStorage('pendingFriendRequests', updatedRequests);
      
      return updatedRequests;
    } catch (storageError) {
      console.error('Failed to update friend requests:', storageError);
      return getFriendRequests();
    }
  }, [getFriendRequests]);

  return {
    isLoading,
    setIsLoading,
    getFriendRequests,
    addFriendRequest,
    removeFriendRequest,
    hasPendingRequestFn: hasPendingRequest
  };
}
