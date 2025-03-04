
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  restBetweenSets: number;
  equipment: string;
  videoUrl?: string;
  weight?: number; // Neues Feld für Gewicht
}

export interface Workout {
  id: string;
  name: string;
  type: 'manual' | 'ai' | 'scanned';
  exercises: Exercise[];
  createdAt: string;
  completed: boolean;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  date: string;
  duration: number;
  heartRate?: number;
  caloriesBurned?: number;
  oxygenSaturation?: number;
  performance: number; // 0-100 Bewertung
}
