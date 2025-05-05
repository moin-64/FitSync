
import { Workout, WorkoutHistory, Exercise } from './workout';
import { FriendRequest, Friend } from './friends';
import { Notification } from './notifications';
import { Rank } from '@/utils/rankingUtils';

export { Workout, WorkoutHistory, Exercise } from './workout';
export { Friend, FriendRequest } from './friends';
export { Notification } from './notifications';

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
  username?: string;
  id?: string;
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
  csrfToken: string;
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
