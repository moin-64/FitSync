
import { useCallback } from 'react';
import { UserProfile } from '@/types/user';
import { useFriendActions } from './useFriendActions';

// This main hook combines the functionality from specialized hooks
export function useFriends(
  profile: UserProfile,
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>
) {
  const {
    isLoading,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends,
    getFriendRequests
  } = useFriendActions(profile, updateProfileFn);

  return {
    isLoading,
    getFriends,
    getFriendRequests,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest
  };
}
