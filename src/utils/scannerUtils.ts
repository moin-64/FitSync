
import { Exercise } from '@/types/exercise';

// Function to get real exercise video URL
export const getExerciseVideoUrl = (exerciseName: string): string => {
  // Map of exercise names to real video URLs
  const videoMap: Record<string, string> = {
    'Bench Press': 'https://storage.googleapis.com/workout-videos/bench-press.mp4',
    'Squat': 'https://storage.googleapis.com/workout-videos/squat.mp4',
    'Deadlift': 'https://storage.googleapis.com/workout-videos/deadlift.mp4',
    'Shoulder Press': 'https://storage.googleapis.com/workout-videos/shoulder-press.mp4',
    'Bicep Curl': 'https://storage.googleapis.com/workout-videos/bicep-curl.mp4',
    'Tricep Extension': 'https://storage.googleapis.com/workout-videos/tricep-extension.mp4',
    'Lat Pulldown': 'https://storage.googleapis.com/workout-videos/lat-pulldown.mp4',
    'Leg Press': 'https://storage.googleapis.com/workout-videos/leg-press.mp4',
    'Cable Row': 'https://storage.googleapis.com/workout-videos/cable-row.mp4',
  };
  
  return videoMap[exerciseName] || `https://storage.googleapis.com/workout-videos/generic-exercise.mp4`;
};

// Simulates analyzing a workout plan from an image
export const analyzeWorkoutPlanFromImage = async (imageData: string): Promise<Exercise[]> => {
  // In a real application, you would send the image to a server for OCR
  // For this demonstration, we'll implement a simulated analysis
  
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Parse workout from the image data
  // This would be done by an OCR/AI service in a real implementation
  const parsedExercises: Exercise[] = [
    { 
      id: `ex-${Date.now()}-1`, 
      name: 'Bench Press', 
      sets: 4, 
      reps: 8, 
      restBetweenSets: 90, 
      equipment: 'Barbell',
      weight: 60,
      videoUrl: getExerciseVideoUrl('Bench Press')
    },
    { 
      id: `ex-${Date.now()}-2`, 
      name: 'Lat Pulldown', 
      sets: 4, 
      reps: 10, 
      restBetweenSets: 60, 
      equipment: 'Cable Machine',
      weight: 50,
      videoUrl: getExerciseVideoUrl('Lat Pulldown')
    },
    { 
      id: `ex-${Date.now()}-3`, 
      name: 'Shoulder Press', 
      sets: 3, 
      reps: 12, 
      restBetweenSets: 60, 
      equipment: 'Dumbbells',
      weight: 15,
      videoUrl: getExerciseVideoUrl('Shoulder Press')
    },
    { 
      id: `ex-${Date.now()}-4`, 
      name: 'Bicep Curl', 
      sets: 3, 
      reps: 15, 
      restBetweenSets: 45, 
      equipment: 'Dumbbells',
      weight: 12,
      videoUrl: getExerciseVideoUrl('Bicep Curl')
    },
  ];
  
  return parsedExercises;
};

// Adds rest periods between equipment changes
export const addEquipmentChangeRests = (exercises: Exercise[]): Exercise[] => {
  let currentEquipment = "";
  const exercisesWithRest: Exercise[] = [];
  
  for (const exercise of exercises) {
    if (currentEquipment && currentEquipment !== exercise.equipment) {
      // Add equipment change rest
      exercisesWithRest.push({
        id: `ex-rest-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: 'Equipment Change Rest',
        sets: 1,
        reps: 1,
        duration: 120, // 2 minutes in seconds
        restBetweenSets: 0,
        equipment: 'None',
        weight: 0,
        videoUrl: 'https://storage.googleapis.com/workout-videos/rest-period.mp4'
      });
    }
    exercisesWithRest.push(exercise);
    currentEquipment = exercise.equipment;
  }
  
  return exercisesWithRest;
};

// Adds a warmup exercise at the beginning
export const addWarmupExercise = (exercises: Exercise[]): Exercise[] => {
  const warmup: Exercise = {
    id: `ex-warmup-${Date.now()}`,
    name: 'Cardio Warmup',
    sets: 1,
    reps: 1,
    duration: 600, // 10 minutes in seconds
    restBetweenSets: 60,
    equipment: 'Treadmill',
    weight: 0,
    videoUrl: 'https://storage.googleapis.com/workout-videos/cardio-warmup.mp4'
  };
  
  return [warmup, ...exercises];
};
