
export enum Rank {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  EXPERT = "Expert",
  ELITE = "Elite"
}

export interface ProfileData {
  id: string;
  username: string;
  avatar_url?: string;
  rank: Rank;
  experience: number;
  fitness_score: number;
  limitations: string[];
  height?: number;
  weight?: number;
  bodyFat?: number;
  created_at?: string;
  birthdate?: string;
  experienceLevel?: string;
  friends?: Friend[];
  friendRequests?: FriendRequest[];
  notifications?: Notification[];
}

// Alias for ProfileData to maintain compatibility with both naming conventions
export type UserProfile = ProfileData;

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restBetweenSets: number;
  equipment: string;
  video_url?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  type: 'strength' | 'cardio' | 'hybrid' | 'custom' | 'manual' | 'ai' | 'scanned';
  completed?: boolean;
  created_at?: string;
}

export interface MuscleGroupData {
  size: number;
  strength: number;
  development: number;
}

export interface BodyScanData {
  age?: number;
  height?: number;
  weight?: number;
  bodyFat?: number;
  muscleGroups: {
    chest: MuscleGroupData;
    back: MuscleGroupData;
    shoulders: MuscleGroupData;
    arms: MuscleGroupData;
    abs: MuscleGroupData;
    legs: MuscleGroupData;
  }
}

// Friend interface
export interface Friend {
  id: string;
  username: string;
  since?: string;
  workoutsCompleted?: number;
  maxWeight?: number;
  avgWorkoutDuration?: number;
  rank?: string;
  lastActive?: string;
  stats?: {
    workoutsCompleted: number;
    maxWeight: number;
    avgWorkoutDuration: number;
    rank: string;
    lastActive: string;
  };
}

// Friend request interface
export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

// Notification interface
export interface Notification {
  id: string;
  type: 'friendRequest' | 'friendAccepted' | 'workout' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  requestId?: string;
  fromUsername?: string;
  actionable?: boolean;
}

// User data interface
export interface UserData {
  profile: UserProfile;
  workouts: Workout[];
  history: WorkoutHistory[];
}

// Workout history interface
export interface WorkoutHistory {
  id: string;
  workoutId: string;
  date: string;
  duration: number;
  heart_rate?: number;
  calories_burned?: number;
  oxygen_saturation?: number;
  performance: number;
}

// User context type
export interface UserContextType {
  profile: UserProfile;
  workouts: Workout[];
  history: WorkoutHistory[];
  loading: boolean;
  csrfToken: string;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addWorkout: (workout: Omit<Workout, 'id' | 'created_at'>) => Promise<Workout>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<boolean>;
  deleteWorkout: (id: string) => Promise<boolean>;
  completeWorkout: (workoutId: string, performance: any) => Promise<boolean>;
  addLimitation: (limitation: string) => Promise<boolean>;
  removeLimitation: (limitation: string) => Promise<boolean>;
  addFriend: (username: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  declineFriendRequest: (requestId: string) => Promise<boolean>;
  getFriends: () => Friend[];
  getFriendRequests: () => FriendRequest[];
  getNotifications: () => Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  clearNotification: (notificationId: string) => Promise<boolean>;
}
