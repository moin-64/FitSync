
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WorkoutProgressProps {
  currentExercise: number;
  totalExercises: number;
  timeElapsed: number;
}

// Optimized WorkoutProgress component with memoization and animations
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
    <div className="mb-4 will-change-auto">
      {/* Hardware accelerated progress bar with animation */}
      <div className="relative h-2 overflow-hidden bg-background/40 rounded-full">
        <motion.div 
          className="h-full bg-primary will-change-transform"
          style={{ width: `${progress}%` }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: 0.5, 
            ease: "easeInOut",
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        />
      </div>
      
      {/* Optimized text rendering with GPU acceleration */}
      <motion.div 
        className="flex justify-between text-sm text-muted-foreground mt-1 will-change-transform"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.span
          key={`exercise-${currentExercise}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="will-change-transform"
        >
          Übung {currentExercise + 1}/{totalExercises}
        </motion.span>
        
        <motion.span
          key={`time-${formattedTime}`}
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="will-change-transform"
        >
          {formattedTime}
        </motion.span>
      </motion.div>
    </div>
  );
};

// Export with React.memo for optimized rendering
export default React.memo(WorkoutProgress);
