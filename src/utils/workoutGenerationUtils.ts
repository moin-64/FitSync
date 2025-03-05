
import { availableExercises } from '../constants/exerciseData';
import { Rank } from './rankingUtils';

// Helper function to determine weight based on rank and exercise
const determineWeight = (
  exerciseName: string, 
  rank: Rank,
  maxWeights: Record<string, number> = {}
): number => {
  // Base weights by rank (in kg)
  const baseWeightsByRank: Record<Rank, number> = {
    'Beginner': 10,
    'Intermediate': 25,
    'Advanced': 45,
    'Expert': 70,
    'Master': 100
  };

  // Exercise-specific modifiers
  const exerciseModifiers: Record<string, number> = {
    'Bench Press': 1.0,
    'Squat': 1.4,
    'Deadlift': 1.6,
    'Shoulder Press': 0.6,
    'Bicep Curl': 0.4,
    'Tricep Extension': 0.3,
    'Lat Pulldown': 0.8,
    'Leg Press': 1.5,
    'Cable Row': 0.7,
  };

  // Default modifier if exercise not found
  const modifier = exerciseModifiers[exerciseName] || 0.5;
  
  // Calculate base weight from rank
  const baseWeight = baseWeightsByRank[rank] * modifier;
  
  // If user has a previous max for this exercise, recommend slightly higher
  if (maxWeights[exerciseName]) {
    return Math.round(maxWeights[exerciseName] * 1.05); // 5% increase from last max
  }
  
  // Otherwise use the rank-based calculation
  return Math.round(baseWeight);
};

// Define reps by rank for use in multiple places
const repsByRank: Record<Rank, number> = {
  'Beginner': 8,
  'Intermediate': 10,
  'Advanced': 12,
  'Expert': 15,
  'Master': 20
};

// Generates an AI workout based on user limitations, rank, and workout history
export const generateAIWorkout = (
  limitations: string[] = [], 
  rank: Rank = 'Beginner',
  maxWeights: Record<string, number> = {}
) => {
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
  ].map(exercise => {
    // Base reps with small random variation
    const baseReps = repsByRank[rank];
    const reps = baseReps + Math.floor(Math.random() * 3) - 1; // -1 to +1 variation
    
    // Determine weight based on rank and exercise name
    const weight = determineWeight(exercise.name, rank, maxWeights);
    
    return {
      id: `ex-${Date.now()}-${exercise.id}`,
      name: exercise.name,
      sets: rank === 'Beginner' ? 3 : (rank === 'Intermediate' ? 4 : 5), // Sets increase with rank
      reps: reps,
      restBetweenSets: rank === 'Beginner' ? 90 : (rank === 'Intermediate' ? 75 : 60), // Rest decreases with rank
      equipment: exercise.equipment,
      weight: weight,
      videoUrl: exercise.videoUrl || `https://example.com/videos/${exercise.name.toLowerCase().replace(/\s+/g, '-')}.mp4` // Placeholder for demo videos
    };
  });
  
  // Consider limitations
  if (limitations.length > 0) {
    if (limitations.some(l => l.toLowerCase().includes('arm') || l.toLowerCase().includes('wrist'))) {
      exercises = exercises.filter(ex => !['Bench Press', 'Bicep Curl', 'Tricep Extension', 'Shoulder Press'].includes(ex.name));
      // Replace with leg exercises
      const legExercises = pickRandomExercises('Legs', 2);
      exercises.push(...legExercises.map(exercise => {
        const weight = determineWeight(exercise.name, rank, maxWeights);
        return {
          id: `ex-${Date.now()}-${exercise.id}`,
          name: exercise.name,
          sets: rank === 'Beginner' ? 3 : (rank === 'Intermediate' ? 4 : 5),
          reps: repsByRank[rank] || 10,
          restBetweenSets: rank === 'Beginner' ? 90 : (rank === 'Intermediate' ? 75 : 60),
          equipment: exercise.equipment,
          weight: weight,
          videoUrl: exercise.videoUrl || `https://example.com/videos/${exercise.name.toLowerCase().replace(/\s+/g, '-')}.mp4`
        };
      }));
    }
    
    if (limitations.some(l => l.toLowerCase().includes('leg') || l.toLowerCase().includes('knee'))) {
      exercises = exercises.filter(ex => !['Squat', 'Leg Press', 'Leg Extension', 'Leg Curl'].includes(ex.name));
      // Replace with upper body exercises
      const upperBodyExercises = [...pickRandomExercises('Chest', 1), ...pickRandomExercises('Back', 1)];
      exercises.push(...upperBodyExercises.map(exercise => {
        const weight = determineWeight(exercise.name, rank, maxWeights);
        return {
          id: `ex-${Date.now()}-${exercise.id}`,
          name: exercise.name,
          sets: rank === 'Beginner' ? 3 : (rank === 'Intermediate' ? 4 : 5),
          reps: repsByRank[rank] || 10,
          restBetweenSets: rank === 'Beginner' ? 90 : (rank === 'Intermediate' ? 75 : 60),
          equipment: exercise.equipment,
          weight: weight,
          videoUrl: exercise.videoUrl || `https://example.com/videos/${exercise.name.toLowerCase().replace(/\s+/g, '-')}.mp4`
        };
      }));
    }
  }
  
  // Add equipment change rest period (2 minutes)
  let currentEquipment = "";
  const exercisesWithRest = [];
  
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
      });
    }
    exercisesWithRest.push(exercise);
    currentEquipment = exercise.equipment;
  }
  
  return [warmup, ...exercisesWithRest];
};

// Format duration from seconds to MM:SS
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
