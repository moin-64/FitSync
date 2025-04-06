
import { useState, useCallback } from 'react';
import { Friend, FriendRequest, UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { findFriendByUsername, hasPendingRequest } from '@/utils/userContext.utils';
import { Rank } from '@/utils/rankingUtils';
import { useFriendsList } from './useFriendsList';
import { useFriendRequests } from './useFriendRequests';

export function useFriendActions(
  profile: UserProfile,
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Verwende die neuen Hooks für Friends und Requests
  const { 
    getFriends, 
    addFriendToList
  } = useFriendsList(profile);
  
  const { 
    getFriendRequests, 
    addFriendRequest, 
    removeFriendRequest 
  } = useFriendRequests(profile);

  // Einen Freund hinzufügen (Freundschaftsanfrage senden)
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
    
    // Prüfe, ob versucht wird, sich selbst hinzuzufügen
    if (profile.username && normalizedUsername === profile.username) {
      toast({
        title: 'Fehler',
        description: 'Du kannst dich nicht selbst als Freund hinzufügen',
        variant: 'destructive',
      });
      return false;
    }
    
    // Prüfe, ob bereits befreundet
    if (findFriendByUsername(getFriends(), normalizedUsername)) {
      toast({
        title: 'Information',
        description: 'Ihr seid bereits Freunde',
      });
      return false;
    }
    
    // Prüfe, ob Anfrage bereits gesendet
    if (hasPendingRequest(getFriendRequests(), normalizedUsername)) {
      toast({
        title: 'Information',
        description: 'Freundschaftsanfrage wurde bereits gesendet',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // API-Aufruf simulieren
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Eine simulierte Freundschaftsanfrage für den Empfänger erstellen
      const newRequest: FriendRequest = {
        id: `req-${Date.now()}`,
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

  // Eine Freundschaftsanfrage annehmen
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
      // API-Aufruf simulieren
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Zufällige Statistiken für den neuen Freund generieren
      const workoutsCompleted = Math.floor(Math.random() * 20);
      const maxWeight = Math.floor(Math.random() * 100) + 20;
      const avgWorkoutDuration = Math.floor(Math.random() * 3600) + 600;
      const friendRank: Rank = ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)] as Rank;
      const lastActive = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
      
      // Zur Freundesliste hinzufügen
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
      
      // In einer echten App würden wir dies auf dem Server aktualisieren
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

  // Eine Freundschaftsanfrage ablehnen
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
      // API-Aufruf simulieren
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In einer echten App würden wir dies auf dem Server aktualisieren
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
