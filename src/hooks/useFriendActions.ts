
import { useState } from 'react';
import { UserProfile } from '@/types/user';
import { useAddFriend } from './useAddFriend';
import { useAcceptFriendRequest } from './useAcceptFriendRequest';
import { useDeclineFriendRequest } from './useDeclineFriendRequest';
import { useFriendsList } from './useFriendsList';
import { useFriendRequests } from './useFriendRequests';
import { useNotifications } from './useNotifications';

export function useFriendActions(
  profile: UserProfile,
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>
) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the hooks for Friends, Requests and Notifications
  const { 
    getFriends, 
    addFriendToList
  } = useFriendsList(profile);
  
  const { 
    getFriendRequests, 
    addFriendRequest, 
    removeFriendRequest 
  } = useFriendRequests(profile);

  const {
    getNotifications,
    addNotification
  } = useNotifications(profile, updateProfileFn);
  
  // Hook for adding friends
  const { addFriend } = useAddFriend(
    profile, 
    updateProfileFn, 
    getFriends, 
    getFriendRequests, 
    addFriendRequest
  );
  
  // Hook for accepting friend requests
  const { acceptFriendRequest } = useAcceptFriendRequest(
    getFriendRequests,
    updateProfileFn,
    addFriendToList,
    removeFriendRequest,
    addNotification
  );
  
  // Hook for declining friend requests
  const { declineFriendRequest } = useDeclineFriendRequest(
    getFriendRequests,
    updateProfileFn,
    removeFriendRequest
  );

  return {
    isLoading,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends,
    getFriendRequests,
    getNotifications
  };
}
