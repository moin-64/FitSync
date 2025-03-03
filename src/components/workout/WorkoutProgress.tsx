
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { formatTime } from '@/utils/timeUtils';

interface WorkoutProgressProps {
  currentExercise: number;
  totalExercises: number;
  timeElapsed: number;
}

const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  currentExercise,
  totalExercises,
  timeElapsed
}) => {
  // Calculate progress percentage
  const progress = (currentExercise / totalExercises) * 100;
  
  return (
    <div className="mb-4">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-sm text-muted-foreground mt-1">
        <span>Exercise {currentExercise + 1}/{totalExercises}</span>
        <span>{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default WorkoutProgress;
