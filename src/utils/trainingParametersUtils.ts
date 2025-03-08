
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

// Format duration from seconds to MM:SS
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
