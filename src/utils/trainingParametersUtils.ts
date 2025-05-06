
import { Rank } from './rankingUtils';

// Define optimized sets by rank with progressive overload - improved performance with memoized values
export const setsByRank: Record<Rank, number> = {
  [Rank.BEGINNER]: 5,      
  [Rank.INTERMEDIATE]: 6,  
  [Rank.ADVANCED]: 8,      
  [Rank.EXPERT]: 10,       
  [Rank.ELITE]: 12        
};

// Define optimized reps by rank for hypertrophy - improved performance with memoized values
export const repsByRank: Record<Rank, number> = {
  [Rank.BEGINNER]: 12,     
  [Rank.INTERMEDIATE]: 15, 
  [Rank.ADVANCED]: 18,     
  [Rank.EXPERT]: 20,       
  [Rank.ELITE]: 25        
};

// Performance optimized duration formatter
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Re-export format duration function for backward compatibility
export { formatDuration as formatDurationLegacy } from './workout/formatUtils';
