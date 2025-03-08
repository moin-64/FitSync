
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

// Define optimized sets by rank with progressive overload
const setsByRank: Record<Rank, number> = {
  'Beginner': 5,      
  'Intermediate': 6,  
  'Advanced': 8,      
  'Expert': 10,       
  'Master': 12        
};

// Define optimized reps by rank for hypertrophy
const repsByRank: Record<Rank, number> = {
  'Beginner': 12,     
  'Intermediate': 15, 
  'Advanced': 18,     
  'Expert': 20,       
  'Master': 25        
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

// Helper function to categorize equipment properly
const getEquipmentCategory = (equipment: string): string => {
  // Map equipment to categories for better sorting
  const equipmentCategories: Record<string, string> = {
    'Body Weight': 'Free Weights',
    'Barbell': 'Free Weights',
    'Dumbbell': 'Free Weights',
    'Free Weights': 'Free Weights',
    'Cable': 'Cable Station',
    'Cable Station': 'Cable Station',
    'Machine': 'Machine',
    'Leg Press': 'Leg Machines',
    'Leg Extension': 'Leg Machines',
    'Leg Curl': 'Leg Machines',
    'Calf Raise': 'Leg Machines',
    'Pec Deck': 'Chest Machines',
    'Chest Press': 'Chest Machines',
    'Lat Pulldown': 'Back Machines',
    'Rowing Machine': 'Back Machines',
    'Back Extension': 'Back Machines',
    'Shoulder Press': 'Shoulder Machines',
    'Tricep Machine': 'Arm Machines',
    'Bicep Machine': 'Arm Machines',
    'Smith Machine': 'Multi-Purpose',
    'Treadmill': 'Cardio',
    'Elliptical': 'Cardio',
    'Exercise Bike': 'Cardio',
    'Rowing Ergometer': 'Cardio',
    'Stairmaster': 'Cardio',
  };

  return equipmentCategories[equipment] || 'Other';
};

// Generates an AI workout based on user limitations, rank, and workout history
// Improved: More exercises and better distribution
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
  
  // Updated function to pick a diverse set of exercises
  const pickExercisesForWorkout = (limitations: string[] = [], minExercises: number = 3) => {
    // Select exercise categories based on limitations
    let exerciseCategories = ['Chest', 'Legs', 'Back', 'Arms', 'Shoulders', 'Core'];
    
    // Consider limitations
    if (limitations.length > 0) {
      if (limitations.some(l => l.toLowerCase().includes('arm') || l.toLowerCase().includes('wrist'))) {
        // Remove upper body exercises
        exerciseCategories = exerciseCategories.filter(c => c !== 'Chest' && c !== 'Back' && c !== 'Arms' && c !== 'Shoulders');
        // Add more leg exercises
        exerciseCategories = ['Legs', 'Core', 'Glutes'];
      }
      
      if (limitations.some(l => l.toLowerCase().includes('leg') || l.toLowerCase().includes('knee'))) {
        // Remove leg exercises
        exerciseCategories = exerciseCategories.filter(c => c !== 'Legs' && c !== 'Glutes');
        // Add more upper body exercises
        exerciseCategories = ['Chest', 'Back', 'Arms', 'Shoulders', 'Core'];
      }
    }
    
    // Make sure we have at least 1 category
    if (exerciseCategories.length === 0) {
      exerciseCategories.push('Core');
    }
    
    // Deduplicate categories
    exerciseCategories = [...new Set(exerciseCategories)];
    
    // Create a balanced workout with at least minExercises exercises
    const selectedExercises = [];
    const categoriesForSelection = [...exerciseCategories];
    
    // First, ensure we have at least one exercise from each available category if possible
    for (const category of exerciseCategories) {
      const categoryExercises = availableExercises.filter(ex => ex.category === category);
      
      if (categoryExercises.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryExercises.length);
        selectedExercises.push(categoryExercises[randomIndex]);
      }
    }
    
    // If we still need more exercises, add them from random categories
    while (selectedExercises.length < minExercises) {
      // Cycle through categories again if we've used them all
      if (categoriesForSelection.length === 0) {
        categoriesForSelection.push(...exerciseCategories);
      }
      
      const randomCategoryIndex = Math.floor(Math.random() * categoriesForSelection.length);
      const randomCategory = categoriesForSelection[randomCategoryIndex];
      
      // Remove this category so we don't immediately pick from it again
      categoriesForSelection.splice(randomCategoryIndex, 1);
      
      const categoryExercises = availableExercises.filter(ex => 
        ex.category === randomCategory && 
        !selectedExercises.some(selected => selected.id === ex.id)
      );
      
      if (categoryExercises.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryExercises.length);
        selectedExercises.push(categoryExercises[randomIndex]);
      }
    }
    
    return selectedExercises;
  };
  
  // Get at least 3 exercises for the workout, plus the warmup
  const selectedExercises = pickExercisesForWorkout(limitations, 3);
  
  // Create exercises with optimized training parameters
  const exercises = selectedExercises.map(exercise => {
    // Reps with small variation for muscle confusion
    const baseReps = repsByRank[rank];
    const reps = baseReps + Math.floor(Math.random() * 3);
    
    // Sets based on rank with progressive overload
    const baseSets = setsByRank[rank];
    const sets = baseSets + (Math.random() > 0.5 ? 1 : 0);
    
    // Check if this is a machine exercise for weight adjustment
    const isMachineExercise = 
      exercise.equipment.includes('Machine') || 
      EQUIPMENT_TYPES.slice(5, 18).includes(exercise.equipment);
    
    // Determine weight based on rank, exercise name, and equipment type
    const weight = determineWeight(
      exercise.name, 
      rank, 
      maxWeights, 
      isMachineExercise
    );
    
    // Calculate appropriate rest time based on exercise intensity and rank
    const restTime = rank === 'Beginner' ? 90 : 
                     rank === 'Intermediate' ? 75 : 
                     rank === 'Advanced' ? 60 :
                     rank === 'Expert' ? 45 : 30;
    
    return {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(7)}-${exercise.id}`,
      name: exercise.name,
      sets: sets,
      reps: reps,
      restBetweenSets: restTime,
      equipment: exercise.equipment,
      weight: weight,
      videoUrl: getExerciseVideoUrl(exercise.name)
    };
  });
  
  // Add equipment change rest periods based on equipment categories
  let currentEquipmentCategory = "";
  const exercisesWithRest = [];
  
  for (const exercise of exercises) {
    const equipmentCategory = getEquipmentCategory(exercise.equipment);
    
    if (currentEquipmentCategory && currentEquipmentCategory !== equipmentCategory) {
      // Add equipment change rest with appropriate time based on rank
      const restTime = rank === 'Beginner' ? 150 : // 2.5 minutes
                       rank === 'Intermediate' ? 120 : // 2 minutes
                       90; // 1.5 minutes for advanced+
      
      exercisesWithRest.push({
        id: `ex-rest-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: 'Equipment Change Rest',
        sets: 1,
        reps: 1,
        duration: restTime,
        restBetweenSets: 0,
        equipment: 'None',
        weight: 0,
        videoUrl: getExerciseVideoUrl('Equipment Change Rest')
      });
    }
    exercisesWithRest.push(exercise);
    currentEquipmentCategory = equipmentCategory;
  }
  
  return [warmup, ...exercisesWithRest];
};

// Format duration from seconds to MM:SS
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
