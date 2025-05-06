
import React, { useMemo } from 'react';
import { Progress } from "@/components/ui/progress";
import { formatDuration } from '@/utils/trainingParametersUtils';
import { motion } from 'framer-motion';

interface WorkoutProgressProps {
  currentExercise: number;
  totalExercises: number;
  timeElapsed: number;
}

// Optimize the WorkoutProgress component with useMemo for better performance
const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  currentExercise,
  totalExercises,
  timeElapsed
}) => {
  // Memoize progress calculation to avoid unnecessary recalculations
  const progress = useMemo(() => 
    Math.min(100, (currentExercise / totalExercises) * 100), 
    [currentExercise, totalExercises]
  );
  
  // Memoize time formatting for better performance
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeElapsed]);
  
  return (
    <div className="mb-4">
      {/* Enhanced progress bar with animation */}
      <div className="relative h-2 overflow-hidden bg-background/40 rounded-full">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      
      {/* Animated text with transition effects */}
      <motion.div 
        className="flex justify-between text-sm text-muted-foreground mt-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.span
          key={currentExercise} // Key helps React identify when to animate
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Übung {currentExercise + 1}/{totalExercises}
        </motion.span>
        
        <motion.span
          key={formattedTime} // Key helps React identify when to animate
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {formattedTime}
        </motion.span>
      </motion.div>
    </div>
  );
};

// Export with React.memo for optimized rendering
export default React.memo(WorkoutProgress);
