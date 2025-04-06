
import { useState, useCallback } from 'react';
import { Friend, UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { findFriendByUsername } from '@/utils/userContext.utils';
import { saveToStorage, getFromStorage } from '@/utils/localStorage';

export function useFriendsList(
  profile: UserProfile
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Freundesliste mit korrekter Fehlerbehandlung abrufen
  const getFriends = useCallback((): Friend[] => {
    return Array.isArray(profile.friends) ? profile.friends : [];
  }, [profile.friends]);

  // Einen Freund zur Liste hinzufügen (nach Akzeptieren einer Anfrage)
  const addFriendToList = useCallback((newFriend: Friend): Friend[] => {
    try {
      const currentFriends = getFriends();
      const updatedFriends = [...currentFriends, newFriend];
      
      // Speichere im localStorage für bessere Persistenz
      saveToStorage('userFriends', updatedFriends);
      
      return updatedFriends;
    } catch (error) {
      console.error('Failed to add friend to list:', error);
      toast({
        title: 'Fehler',
        description: 'Freund konnte nicht zur Liste hinzugefügt werden',
        variant: 'destructive',
      });
      return getFriends();
    }
  }, [getFriends, toast]);

  return {
    isLoading,
    setIsLoading,
    getFriends,
    addFriendToList
  };
}
