
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
}

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
  type: 'strength' | 'cardio' | 'hybrid' | 'custom';
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
