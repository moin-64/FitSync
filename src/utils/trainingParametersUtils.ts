
import { Rank } from './rankingUtils';

// Define optimized sets by rank with progressive overload
export const setsByRank: Record<Rank, number> = {
  'Beginner': 5,      
  'Intermediate': 6,  
  'Advanced': 8,      
  'Expert': 10,       
  'Master': 12        
};

// Define optimized reps by rank for hypertrophy
export const repsByRank: Record<Rank, number> = {
  'Beginner': 12,     
  'Intermediate': 15, 
  'Advanced': 18,     
  'Expert': 20,       
  'Master': 25        
};

// Re-export format duration function for backward compatibility
export { formatDuration } from './workout/formatUtils';
