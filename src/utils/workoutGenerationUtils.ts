import { EQUIPMENT_TYPES } from '../constants/exerciseData';
import { Rank } from './rankingUtils';
import { determineWeight } from './weightCalculationUtils';
import { 
  getRandomCardioMachine, 
  getExerciseVideoUrl, 
  getEquipmentCategory,
  pickExercisesForWorkout
} from './exerciseSelectionUtils';
import { 
  setsByRank, 
  repsByRank,
  formatDuration 
} from './trainingParametersUtils';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for calling edge functions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced AI workout generation that uses OpenRouter API via Supabase Edge Function
export const generateAIWorkout = async (
  limitations: string[] = [], 
  rank: Rank = 'Beginner',
  maxWeights: Record<string, number> = {}
) => {
  // Ensure rank is a valid Rank type
  if (!['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].includes(rank)) {
    rank = 'Beginner';
  }

  try {
    // First try to get enhanced AI suggestions
    const { data: aiData, error } = await supabase.functions.invoke('ai-workout', {
      body: { 
        type: "workout", 
        data: { 
          rank,
          limitations
        }
      }
    });

    // If AI returned useful data, we'll use it to influence our workout generation
    const aiSuggestions = aiData?.result || '';
    
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
  } catch (error) {
    console.error("Error generating AI workout:", error);
    
    // Fallback to original algorithm if AI fails
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
  }
};

// Re-export format duration from trainingParametersUtils to maintain backward compatibility
export { formatDuration };
