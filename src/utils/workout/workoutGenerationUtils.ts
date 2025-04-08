
// Re-export functions from the refactored files for backward compatibility
import { generateAIWorkout } from './workoutGeneration/aiWorkoutGenerator';
import { formatDuration } from './formatUtils';

export { generateAIWorkout, formatDuration };
