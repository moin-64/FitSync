
import { availableExercises } from '../constants/exerciseData';

// Get random cardio machine for warmup
export const getRandomCardioMachine = (): string => {
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
export const getEquipmentCategory = (equipment: string): string => {
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

// Updated function to pick a diverse set of exercises
export const pickExercisesForWorkout = (limitations: string[] = [], minExercises: number = 3) => {
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
