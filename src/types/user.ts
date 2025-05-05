
// Updating the UserContextType to include csrfToken

import { Workout, WorkoutHistory, Exercise } from './workout';
import { FriendRequest, Friend } from './friends';
import { Notification } from './notifications';
import { Rank } from '@/utils/rankingUtils';

export interface UserProfile {
  birthdate: string | null;
  height: number | null;
  weight: number | null;
  experienceLevel: Rank;
  limitations: string[];
  rank: Rank;
  friends: Friend[];
  friendRequests: FriendRequest[];
  notifications?: Notification[];
}

export interface UserData {
  profile: UserProfile;
  workouts: Workout[];
  history: WorkoutHistory[];
}

export interface UserContextType {
  profile: UserProfile;
  workouts: Workout[];
  history: WorkoutHistory[];
  loading: boolean;
  csrfToken: string; // CSRF-Token für sichere Formularübermittlungen
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => Promise<Workout | null>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<boolean>;
  deleteWorkout: (id: string) => Promise<boolean>;
  completeWorkout: (workoutId: string, performance: WorkoutHistory) => Promise<boolean>;
  addLimitation: (limitation: string) => Promise<boolean>;
  removeLimitation: (limitation: string) => Promise<boolean>;
  // Friend functions
  addFriend: (friendId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  declineFriendRequest: (requestId: string) => Promise<boolean>;
  getFriends: () => Friend[];
  getFriendRequests: () => FriendRequest[];
  // Notification functions
  getNotifications: () => Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  clearNotification: (notificationId: string) => Promise<boolean>;
}
