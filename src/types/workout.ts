
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  restBetweenSets: number;
  equipment: string;
  video_url?: string;
  weight?: number;
}

export interface Workout {
  id: string;
  name: string;
  type: 'manual' | 'ai' | 'scanned' | 'strength' | 'cardio' | 'hybrid' | 'custom';
  exercises: Exercise[];
  createdAt: string;
  completed: boolean;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  date: string;
  duration: number;
  heart_rate?: number;
  calories_burned?: number;
  oxygen_saturation?: number;
  performance: number; // 0-100 Bewertung
}
