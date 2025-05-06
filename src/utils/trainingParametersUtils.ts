
import { Rank } from './rankingUtils';

// Define optimized sets by rank with progressive overload
export const setsByRank: Record<Rank, number> = {
  [Rank.BEGINNER]: 5,      
  [Rank.INTERMEDIATE]: 6,  
  [Rank.ADVANCED]: 8,      
  [Rank.EXPERT]: 10,       
  [Rank.ELITE]: 12        
};

// Define optimized reps by rank for hypertrophy
export const repsByRank: Record<Rank, number> = {
  [Rank.BEGINNER]: 12,     
  [Rank.INTERMEDIATE]: 15, 
  [Rank.ADVANCED]: 18,     
  [Rank.EXPERT]: 20,       
  [Rank.ELITE]: 25        
};

// Re-export format duration function for backward compatibility
export { formatDuration } from './workout/formatUtils';
