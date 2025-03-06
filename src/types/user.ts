
import { Rank } from '../utils/rankingUtils';

export interface UserProfile {
  birthdate: string | null;
  height: number | null;
  weight: number | null;
  experienceLevel: string | null;
  limitations: string[];
  rank: Rank;
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
}
