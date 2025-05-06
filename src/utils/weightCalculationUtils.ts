import { Rank } from './rankingUtils';

// Helper function to determine weight based on rank and exercise
export const determineWeight = (
  exerciseName: string, 
  rank: Rank,
  maxWeights: Record<string, number> = {},
  isForMachine: boolean = false
): number => {
  // Base weights by rank (in kg)
  const baseWeightsByRank: Record<Rank, number> = {
    [Rank.BEGINNER]: 10,
    [Rank.INTERMEDIATE]: 25,
    [Rank.ADVANCED]: 45,
    [Rank.EXPERT]: 70,
    [Rank.ELITE]: 100
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
