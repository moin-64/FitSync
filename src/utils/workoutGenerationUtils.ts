
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

// Define INCREASED sets by rank - higher than before
const setsByRank: Record<Rank, number> = {
  'Beginner': 5,      // Increased from 4
  'Intermediate': 6,  // Increased from 5 
  'Advanced': 8,      // Increased from 6
  'Expert': 10,       // Increased from 7
  'Master': 12        // Increased from 8
};

// Define INCREASED reps by rank - higher than before
const repsByRank: Record<Rank, number> = {
  'Beginner': 12,     // Increased from 10
  'Intermediate': 15, // Increased from 12
  'Advanced': 18,     // Increased from 15
  'Expert': 20,       // Increased from 18
  'Master': 25        // Same as before
};

// Get real exercise video URL
const getExerciseVideoUrl = (exerciseName: string): string => {
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
    'Cardio Warmup': 'https://storage.googleapis.com/workout-videos/cardio-warmup.mp4',
    'Equipment Change Rest': 'https://storage.googleapis.com/workout-videos/rest-period.mp4',
  };
  
  // Return actual video URL if available, otherwise a generic one
  return videoMap[exerciseName] || `https://storage.googleapis.com/workout-videos/generic-exercise.mp4`;
};

// Generates an AI workout based on user limitations, rank, and workout history
// MODIFIED: Fewer different exercises, more sets and reps
export const generateAIWorkout = (
  limitations: string[] = [], 
  rank: Rank = 'Beginner',
  maxWeights: Record<string, number> = {}
) => {
  // Ensure rank is a valid Rank type
  if (!['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].includes(rank)) {
    rank = 'Beginner';
  }

  const warmup = {
    id: `ex-warmup-${Date.now()}`,
    name: 'Cardio Warmup',
    sets: 1,
    reps: 1,
    duration: 600, // 10 minutes in seconds
    restBetweenSets: 60,
    equipment: 'Treadmill',
    weight: 0,
    videoUrl: getExerciseVideoUrl('Cardio Warmup'),
  };
  
  // Pick random exercises based on categories - EVEN FEWER DIFFERENT EXERCISES
  const pickRandomExercises = (category: string, count: number) => {
    const categoryExercises = availableExercises.filter(ex => ex.category === category);
    const selected = [];
    
    // Only pick 1-2 exercises maximum per category
    const actualCount = Math.min(count, 1);
    
    for (let i = 0; i < actualCount && i < categoryExercises.length; i++) {
      const randomIndex = Math.floor(Math.random() * categoryExercises.length);
      selected.push(categoryExercises[randomIndex]);
      categoryExercises.splice(randomIndex, 1); // Remove selected exercise to avoid duplicates
    }
    return selected;
  };
  
  // REDUCED number of exercise categories - focus on fewer exercises with more sets/reps
  // Only use 2 categories maximum
  let exerciseCategories = ['Chest', 'Legs'];
  
  // Consider limitations
  if (limitations.length > 0) {
    if (limitations.some(l => l.toLowerCase().includes('arm') || l.toLowerCase().includes('wrist'))) {
      // Remove upper body exercises
      exerciseCategories = exerciseCategories.filter(c => c !== 'Chest' && c !== 'Back');
      // Add more leg exercises
      exerciseCategories = ['Legs'];
    }
    
    if (limitations.some(l => l.toLowerCase().includes('leg') || l.toLowerCase().includes('knee'))) {
      // Remove leg exercises
      exerciseCategories = exerciseCategories.filter(c => c !== 'Legs');
      // Add more upper body exercises
      exerciseCategories = ['Chest'];
    }
  }
  
  // Make sure we have at least 1 category
  if (exerciseCategories.length === 0) {
    exerciseCategories.push('Core');
  }
  
  // Deduplicate categories
  exerciseCategories = [...new Set(exerciseCategories)];
  
  // Create exercises with EVEN MORE SETS AND REPS
  let exercises = exerciseCategories.flatMap(category => {
    return pickRandomExercises(category, 1).map(exercise => {
      // More reps with additional bonus
      const baseReps = repsByRank[rank];
      const reps = baseReps + Math.floor(Math.random() * 3); // Small variation
      
      // More sets based on rank with additional bonus
      const sets = setsByRank[rank] + (Math.random() > 0.5 ? 1 : 0); // Occasional extra set
      
      // Determine weight based on rank and exercise name
      const weight = determineWeight(exercise.name, rank, maxWeights);
      
      return {
        id: `ex-${Date.now()}-${exercise.id}`,
        name: exercise.name,
        sets: sets,
        reps: reps,
        restBetweenSets: rank === 'Beginner' ? 90 : (rank === 'Intermediate' ? 75 : 60), // Rest decreases with rank
        equipment: exercise.equipment,
        weight: weight,
        videoUrl: getExerciseVideoUrl(exercise.name)
      };
    });
  });
  
  // Ensure we have at least one exercise even if categories resulted in none
  if (exercises.length === 0) {
    const defaultExercise = {
      id: `ex-default-${Date.now()}`,
      name: 'Bodyweight Squat',
      sets: setsByRank[rank],
      reps: repsByRank[rank],
      restBetweenSets: 60,
      equipment: 'None',
      weight: 0,
      videoUrl: getExerciseVideoUrl('Squat')
    };
    exercises.push(defaultExercise);
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
        videoUrl: getExerciseVideoUrl('Equipment Change Rest')
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
