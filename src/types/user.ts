
import { Rank } from '../utils/rankingUtils';

export interface UserProfile {
  id?: string;
  username?: string;
  birthdate: string | null;
  height: number | null;
  weight: number | null;
  experienceLevel: Rank | null;
  limitations: string[];
  rank: Rank;
  friends: Friend[];
  friendRequests: FriendRequest[];
  notifications: Notification[]; // Added notifications array
}

export interface Workout {
  id: string;
  name: string;
  type: 'manual' | 'ai' | 'scanned';
  exercises: Exercise[];
  createdAt: string;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  restBetweenSets: number;
  equipment: string;
  videoUrl?: string;
  weight?: number;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  date: string;
  duration: number;
  heartRate?: number;
  caloriesBurned?: number;
  oxygenSaturation?: number;
  performance: number; // 0-100 rating
}

export interface UserData {
  profile: UserProfile;
  workouts: Workout[];
  history: WorkoutHistory[];
  settings: Record<string, any>;
}

export interface UserContextType {
  profile: UserProfile;
  workouts: Workout[];
  history: WorkoutHistory[];
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => Promise<Workout>;
  updateWorkout: (id: string, data: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  completeWorkout: (id: string, stats: Omit<WorkoutHistory, 'id' | 'workoutId' | 'date'>) => Promise<void>;
  addLimitation: (limitation: string) => Promise<void>;
  removeLimitation: (limitation: string) => Promise<void>;
  // Updated these return types to match the implementation in useFriends
  addFriend: (username: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  declineFriendRequest: (requestId: string) => Promise<boolean>;
  getFriends: () => Friend[];
  getFriendRequests: () => FriendRequest[];
  getNotifications: () => Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearNotification: (notificationId: string) => Promise<void>;
}

export interface Friend {
  id: string;
  username: string;
  since?: string;
  stats?: {
    rank: Rank;
    workoutsCompleted: number;
    maxWeight: number;
    avgWorkoutDuration: number;
    lastActive?: string;
  };
  // Add direct properties to support existing component access
  rank?: Rank;
  workoutsCompleted?: number;
  maxWeight?: number;
  avgWorkoutDuration?: number;
  lastActive?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId?: string;
  fromUsername: string;
  sentAt: string;
  status?: 'pending' | 'accepted' | 'declined';
}

export interface FriendNotification {
  id: string;
  type: 'request' | 'accepted';
  fromUsername: string;
  timestamp: string;
  read: boolean;
}

// New notification type for various system notifications
export interface Notification {
  id: string;
  type: 'friendRequest' | 'friendAccepted' | 'workout' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  requestId?: string; // Optional ID for related friend request
  workoutId?: string; // Optional ID for related workout
  fromUsername?: string; // Optional username who triggered the notification
}
