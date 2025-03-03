
import { useState, useEffect } from 'react';

interface UseWorkoutTimerProps {
  duration?: number;
  isPaused: boolean;
  onComplete: () => void;
}

export const useWorkoutTimer = ({ 
  duration, 
  isPaused, 
  onComplete 
}: UseWorkoutTimerProps) => {
  const [exerciseTimer, setExerciseTimer] = useState(duration || 0);
  
  // Initialize timer when duration changes
  useEffect(() => {
    if (duration) {
      setExerciseTimer(duration);
    }
  }, [duration]);
  
  // Exercise countdown timer
  useEffect(() => {
    let intervalId: number;
    
    if (duration && exerciseTimer > 0 && !isPaused) {
      intervalId = window.setInterval(() => {
        setExerciseTimer(prevTime => {
          const newTime = prevTime - 1;
          
          // If timer reaches zero, move to next exercise or rest period
          if (newTime <= 0) {
            onComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [exerciseTimer, isPaused, duration, onComplete]);
  
  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return {
    exerciseTimer,
    formattedTime: formatTime(exerciseTimer)
  };
};
