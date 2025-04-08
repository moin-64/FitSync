
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
    // Add new equipment videos
    'Stehender Schulterdruck': 'https://storage.googleapis.com/workout-videos/shoulder-press-dlc115.mp4',
    'Seitliches Heben': 'https://storage.googleapis.com/workout-videos/lateral-raise-dlc125.mp4',
    'Butterfly': 'https://storage.googleapis.com/workout-videos/butterfly-dlc220.mp4',
    'Latzug Radial': 'https://storage.googleapis.com/workout-videos/lat-pulldown-dlc315.mp4',
    'Lateral Rudern': 'https://storage.googleapis.com/workout-videos/rowing-dlc325.mp4',
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
    // New equipment categories
    'DLC115 Shoulder Press': 'Shoulder Machines',
    'DLC125 Lateral Raise': 'Shoulder Machines',
    'DLC220 Butterfly': 'Chest Machines',
    'DLC315 Lat Pulldown': 'Back Machines',
    'DLC325 Rowing Machine': 'Back Machines',
    'DLC330 Lat Press': 'Back Machines',
    'DLC345 Pull Over': 'Back Machines',
    'DLC355 Back Extension': 'Back Machines',
    'DLC415 Bicep Machine': 'Arm Machines',
    'DLC435 Dip Machine': 'Arm Machines',
    'DLC635 Squat Machine': 'Leg Machines',
    'DLC665 Kick Machine': 'Leg Machines',
    'DLC685 Calf Machine': 'Leg Machines',
    'K613 Leg Press': 'Leg Machines',
    'K617 Vario Leg Press': 'Leg Machines',
    'K688 Leg Combo': 'Leg Machines',
    'K721 Bench Press': 'Chest Machines',
    'K724 Incline Bench': 'Chest Machines',
    'K733 Hyperextension': 'Back Machines',
    'K740 Bicep Bench': 'Arm Machines',
    'K753 Ab Bench': 'Core Machines',
    'K760 Squat Rack': 'Leg Machines',
    'T310 Lat Station': 'Back Machines',
    'T320 Rowing Station': 'Back Machines',
    'T322 Seated Row': 'Back Machines',
    'T414 Bicep-Tricep': 'Arm Machines',
    'T613 Rolling Leg Press': 'Leg Machines'
  };

  return equipmentCategories[equipment] || 'Other';
};

// Updated function to pick a diverse set of exercises with improved limitation handling
export const pickExercisesForWorkout = (limitations: string[] = [], minExercises: number = 3) => {
  // Parse limitations to identify specific body parts or conditions
  const limitationsLower = limitations.map(l => l.toLowerCase());
  
  // Detect specific body part limitations
  const hasArmLimitation = limitationsLower.some(l => 
    l.includes('arm') || l.includes('wrist') || l.includes('hand') || l.includes('elbow') || l.includes('schulter')
  );
  
  const hasLegLimitation = limitationsLower.some(l =>
    l.includes('bein') || l.includes('leg') || l.includes('knie') || l.includes('knee') || 
    l.includes('fuß') || l.includes('foot') || l.includes('ankle') || l.includes('sprunggelenk')
  );
  
  const hasBackLimitation = limitationsLower.some(l =>
    l.includes('back') || l.includes('rücken') || l.includes('wirbel') || l.includes('spine')
  );
  
  const hasChestLimitation = limitationsLower.some(l =>
    l.includes('brust') || l.includes('chest') || l.includes('pec') || l.includes('schulter')
  );
  
  // Select exercise categories based on limitations
  let exerciseCategories = ['Chest', 'Legs', 'Back', 'Arms', 'Shoulders', 'Core'];
  
  // Apply limitations to filter out categories
  if (hasArmLimitation) {
    exerciseCategories = exerciseCategories.filter(c => 
      c !== 'Arms' && c !== 'Chest' && c !== 'Back' && c !== 'Shoulders'
    );
  }
  
  if (hasLegLimitation) {
    exerciseCategories = exerciseCategories.filter(c => 
      c !== 'Legs' && c !== 'Glutes'
    );
  }
  
  if (hasBackLimitation) {
    exerciseCategories = exerciseCategories.filter(c => 
      c !== 'Back' && c !== 'Core'
    );
  }
  
  if (hasChestLimitation) {
    exerciseCategories = exerciseCategories.filter(c => 
      c !== 'Chest' && c !== 'Shoulders'
    );
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
