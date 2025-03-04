
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

export interface LocationState {
  type: 'manual' | 'ai' | 'scanned';
}
