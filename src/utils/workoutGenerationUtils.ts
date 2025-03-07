
import { availableExercises, EQUIPMENT_TYPES } from '../constants/exerciseData';
import { Rank } from './rankingUtils';

// Helper function to determine weight based on rank and exercise
const determineWeight = (
  exerciseName: string, 
  rank: Rank,
  maxWeights: Record<string, number> = {},
  isForMachine: boolean = false
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
    'Pec Deck Fly': 0.8,
    'Chest Press Machine': 0.9,
    'Leg Extension': 0.8,
    'Leg Curl': 0.7,
    'Seated Calf Raise': 0.5,
    'Smith Machine Squat': 1.3,
    'Smith Machine Bench': 0.9,
    'Shoulder Press Machine': 0.6,
    'Tricep Machine': 0.4,
    'Bicep Curl Machine': 0.4,
  };

  // Default modifier if exercise not found
  const modifier = exerciseModifiers[exerciseName] || 0.5;
  
  // Calculate base weight from rank
  let baseWeight = baseWeightsByRank[rank] * modifier;
  
  // If user has a previous max for this exercise, recommend slightly higher
  if (maxWeights[exerciseName]) {
    baseWeight = maxWeights[exerciseName] * 1.05; // 5% increase from last max
  }
  
  // Apply machine modifier if needed
  if (isForMachine) {
    baseWeight *= 1.15; // 15% more weight for machine exercises
  }
  
  // Return rounded weight
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

// Get random cardio machine for warmup
const getRandomCardioMachine = (): string => {
  const cardioMachines = [
    'Treadmill',
    'Elliptical',
    'Exercise Bike',
    'Rowing Ergometer',
    'Stairmaster'
  ];
  
  const randomIndex = Math.floor(Math.random() * cardioMachines.length);
  return cardioMachines[randomIndex];
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
    'Pec Deck Fly': 'https://storage.googleapis.com/workout-videos/pec-deck.mp4',
    'Chest Press Machine': 'https://storage.googleapis.com/workout-videos/chest-press-machine.mp4',
    'Leg Extension': 'https://storage.googleapis.com/workout-videos/leg-extension.mp4',
    'Leg Curl': 'https://storage.googleapis.com/workout-videos/leg-curl.mp4',
    'Seated Calf Raise': 'https://storage.googleapis.com/workout-videos/calf-raise.mp4',
    'Smith Machine Squat': 'https://storage.googleapis.com/workout-videos/smith-machine-squat.mp4',
    'Smith Machine Bench': 'https://storage.googleapis.com/workout-videos/smith-machine-bench.mp4',
    'Shoulder Press Machine': 'https://storage.googleapis.com/workout-videos/shoulder-press-machine.mp4',
    'Tricep Machine': 'https://storage.googleapis.com/workout-videos/tricep-machine.mp4',
    'Bicep Curl Machine': 'https://storage.googleapis.com/workout-videos/bicep-curl-machine.mp4',
    'Cardio Warmup': 'https://storage.googleapis.com/workout-videos/cardio-warmup.mp4',
    'Equipment Change Rest': 'https://storage.googleapis.com/workout-videos/rest-period.mp4',
    'Treadmill': 'https://storage.googleapis.com/workout-videos/treadmill-run.mp4',
    'Elliptical': 'https://storage.googleapis.com/workout-videos/elliptical.mp4',
    'Exercise Bike': 'https://storage.googleapis.com/workout-videos/exercise-bike.mp4',
    'Rowing Ergometer': 'https://storage.googleapis.com/workout-videos/rowing-machine.mp4',
    'Stairmaster': 'https://storage.googleapis.com/workout-videos/stairmaster.mp4',
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

  // Generate cardio warmup with random cardio machine
  const cardioMachine = getRandomCardioMachine();
  const warmup = {
    id: `ex-warmup-${Date.now()}`,
    name: 'Cardio Warmup',
    sets: 1,
    reps: 1,
    duration: 600, // 10 minutes in seconds
    restBetweenSets: 60,
    equipment: cardioMachine,
    weight: 0,
    videoUrl: getExerciseVideoUrl(cardioMachine),
  };
  
  // Pick random exercises based on categories
  const pickRandomExercises = (category: string, count: number) => {
    const categoryExercises = availableExercises.filter(ex => ex.category === category);
    const selected = [];
    
    // Pick exercises from this category
    const actualCount = Math.min(count, categoryExercises.length);
    
    for (let i = 0; i < actualCount; i++) {
      const randomIndex = Math.floor(Math.random() * categoryExercises.length);
      selected.push(categoryExercises[randomIndex]);
      categoryExercises.splice(randomIndex, 1); // Remove selected exercise to avoid duplicates
    }
    return selected;
  };
  
  // Select exercise categories based on limitations
  let exerciseCategories = ['Chest', 'Legs', 'Back', 'Arms'];
  
  // Consider limitations
  if (limitations.length > 0) {
    if (limitations.some(l => l.toLowerCase().includes('arm') || l.toLowerCase().includes('wrist'))) {
      // Remove upper body exercises
      exerciseCategories = exerciseCategories.filter(c => c !== 'Chest' && c !== 'Back' && c !== 'Arms');
      // Add more leg exercises
      exerciseCategories = ['Legs', 'Core'];
    }
    
    if (limitations.some(l => l.toLowerCase().includes('leg') || l.toLowerCase().includes('knee'))) {
      // Remove leg exercises
      exerciseCategories = exerciseCategories.filter(c => c !== 'Legs');
      // Add more upper body exercises
      exerciseCategories = ['Chest', 'Back', 'Arms'];
    }
  }
  
  // Make sure we have at least 1 category
  if (exerciseCategories.length === 0) {
    exerciseCategories.push('Core');
  }
  
  // Deduplicate categories
  exerciseCategories = [...new Set(exerciseCategories)];
  
  // Create exercises with MORE SETS AND REPS
  let exercises = exerciseCategories.flatMap(category => {
    // Get 1-2 exercises from each category
    const exerciseCount = Math.min(2, Math.max(1, Math.floor(3 / exerciseCategories.length)));
    return pickRandomExercises(category, exerciseCount).map(exercise => {
      // More reps with additional bonus
      const baseReps = repsByRank[rank];
      const reps = baseReps + Math.floor(Math.random() * 3); // Small variation
      
      // More sets based on rank with additional bonus
      const sets = setsByRank[rank] + (Math.random() > 0.5 ? 1 : 0); // Occasional extra set
      
      // Check if this is a machine exercise
      const isMachineExercise = 
        exercise.equipment.includes('Machine') || 
        EQUIPMENT_TYPES.slice(5, 18).includes(exercise.equipment);
      
      // Determine weight based on rank and exercise name, with machine adjustment
      const weight = determineWeight(
        exercise.name, 
        rank, 
        maxWeights, 
        isMachineExercise
      );
      
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
  
  // Ensure we have at least 3 exercises (plus warmup)
  if (exercises.length < 3) {
    // Add more exercises from random categories to reach minimum of 3
    const additionalNeeded = 3 - exercises.length;
    const allCategories = ['Chest', 'Legs', 'Back', 'Arms', 'Shoulders', 'Core'];
    
    // Filter out categories we already used
    const remainingCategories = allCategories.filter(c => !exerciseCategories.includes(c));
    
    for (let i = 0; i < additionalNeeded; i++) {
      // Get a random category
      const randomCategoryIndex = Math.floor(Math.random() * remainingCategories.length);
      const randomCategory = remainingCategories[randomCategoryIndex] || 'Core';
      
      // Get an exercise from this category
      const additionalExercises = pickRandomExercises(randomCategory, 1);
      
      if (additionalExercises.length > 0) {
        const exercise = additionalExercises[0];
        
        // Configure the exercise
        const reps = repsByRank[rank] + Math.floor(Math.random() * 3);
        const sets = setsByRank[rank] + (Math.random() > 0.5 ? 1 : 0);
        
        const isMachineExercise = 
          exercise.equipment.includes('Machine') || 
          EQUIPMENT_TYPES.slice(5, 18).includes(exercise.equipment);
        
        const weight = determineWeight(exercise.name, rank, maxWeights, isMachineExercise);
        
        exercises.push({
          id: `ex-${Date.now()}-${Math.random().toString(36).substring(7)}-${exercise.id}`,
          name: exercise.name,
          sets: sets,
          reps: reps,
          restBetweenSets: rank === 'Beginner' ? 90 : (rank === 'Intermediate' ? 75 : 60),
          equipment: exercise.equipment,
          weight: weight,
          videoUrl: getExerciseVideoUrl(exercise.name)
        });
      }
      
      // Remove this category so we don't pick from it again
      remainingCategories.splice(randomCategoryIndex, 1);
      
      // If we ran out of categories, just use Core
      if (remainingCategories.length === 0) {
        remainingCategories.push('Core');
      }
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
