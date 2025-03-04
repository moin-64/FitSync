
import { availableExercises } from '../constants/exerciseData';

// Generates an AI workout based on user limitations
export const generateAIWorkout = (limitations: string[] = []) => {
  const warmup = {
    id: `ex-warmup-${Date.now()}`,
    name: 'Cardio Warmup',
    sets: 1,
    reps: 1,
    duration: 600, // 10 minutes in seconds
    restBetweenSets: 60,
    equipment: 'Treadmill',
    weight: 0,
  };
  
  // Pick random exercises based on categories
  const pickRandomExercises = (category: string, count: number) => {
    const categoryExercises = availableExercises.filter(ex => ex.category === category);
    const selected = [];
    for (let i = 0; i < count && i < categoryExercises.length; i++) {
      const randomIndex = Math.floor(Math.random() * categoryExercises.length);
      selected.push(categoryExercises[randomIndex]);
      categoryExercises.splice(randomIndex, 1); // Remove selected exercise to avoid duplicates
    }
    return selected;
  };
  
  // Workout composition
  let exercises = [
    ...pickRandomExercises('Chest', 1),
    ...pickRandomExercises('Back', 1),
    ...pickRandomExercises('Legs', 1),
    ...pickRandomExercises('Arms', 1),
    ...pickRandomExercises('Shoulders', 1),
    ...pickRandomExercises('Core', 1),
  ].map(exercise => ({
    id: `ex-${Date.now()}-${exercise.id}`,
    name: exercise.name,
    sets: Math.floor(Math.random() * 2) + 3, // 3-4 sets
    reps: Math.floor(Math.random() * 6) + 8, // 8-12 reps
    restBetweenSets: (Math.floor(Math.random() * 4) + 6) * 15, // 90-150 seconds rest
    equipment: exercise.equipment,
    weight: 0, // Default weight that user can adjust
  }));
  
  // Consider limitations
  if (limitations.length > 0) {
    if (limitations.some(l => l.toLowerCase().includes('arm') || l.toLowerCase().includes('wrist'))) {
      exercises = exercises.filter(ex => !['Bench Press', 'Bicep Curl', 'Tricep Extension', 'Shoulder Press'].includes(ex.name));
      // Replace with leg exercises
      const legExercises = pickRandomExercises('Legs', 2);
      exercises.push(...legExercises.map(exercise => ({
        id: `ex-${Date.now()}-${exercise.id}`,
        name: exercise.name,
        sets: Math.floor(Math.random() * 2) + 3,
        reps: Math.floor(Math.random() * 6) + 8,
        restBetweenSets: (Math.floor(Math.random() * 4) + 6) * 15,
        equipment: exercise.equipment,
        weight: 0,
      })));
    }
    
    if (limitations.some(l => l.toLowerCase().includes('leg') || l.toLowerCase().includes('knee'))) {
      exercises = exercises.filter(ex => !['Squat', 'Leg Press', 'Leg Extension', 'Leg Curl'].includes(ex.name));
      // Replace with upper body exercises
      const upperBodyExercises = [...pickRandomExercises('Chest', 1), ...pickRandomExercises('Back', 1)];
      exercises.push(...upperBodyExercises.map(exercise => ({
        id: `ex-${Date.now()}-${exercise.id}`,
        name: exercise.name,
        sets: Math.floor(Math.random() * 2) + 3,
        reps: Math.floor(Math.random() * 6) + 8,
        restBetweenSets: (Math.floor(Math.random() * 4) + 6) * 15,
        equipment: exercise.equipment,
        weight: 0,
      })));
    }
  }
  
  return [warmup, ...exercises];
};

// Format duration from seconds to MM:SS
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
