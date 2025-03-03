
import React from 'react';
import { Button } from "@/components/ui/button";
import { Exercise } from '@/types/workout';

interface ExerciseDisplayProps {
  exercise: Exercise;
  formattedTime: string;
  isPaused: boolean;
  struggleDetected: boolean;
  onTogglePause: () => void;
}

const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({
  exercise,
  formattedTime,
  isPaused,
  struggleDetected,
  onTogglePause
}) => {
  return (
    <div className="flex-1 glass rounded-lg p-6 mb-6 flex flex-col items-center justify-center">
      <div className="w-full aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
        {exercise.videoUrl ? (
          <video 
            src={exercise.videoUrl} 
            className="w-full h-full object-cover rounded-lg"
            autoPlay 
            loop 
            muted 
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-2">Exercise Demonstration</p>
            <p className="text-sm text-muted-foreground">{exercise.name}</p>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-2">{exercise.name}</h2>
      
      {exercise.duration ? (
        <p className="text-xl mb-4">
          {formattedTime}
        </p>
      ) : (
        <p className="text-xl mb-4">{exercise.sets} sets × {exercise.reps} reps</p>
      )}
      
      {struggleDetected && (
        <div className="mb-4 p-3 bg-destructive/20 text-destructive rounded-md text-center">
          <p>Increased effort detected. Consider reducing intensity.</p>
        </div>
      )}
      
      <Button
        onClick={onTogglePause}
        variant="outline"
        className="mb-4 w-full max-w-xs"
      >
        {isPaused ? "Resume" : "Pause"}
      </Button>
    </div>
  );
};

export default ExerciseDisplay;
