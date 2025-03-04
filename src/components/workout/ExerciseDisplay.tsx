
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, AlertTriangle } from 'lucide-react';
import { Exercise } from '@/types/exercise';

interface ExerciseDisplayProps {
  exercise: Exercise;
  formattedTime?: string;
  isPaused?: boolean;
  struggleDetected?: boolean;
  onTogglePause?: () => void;
}

const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({
  exercise,
  formattedTime,
  isPaused,
  struggleDetected,
  onTogglePause
}) => {
  const [currentSet, setCurrentSet] = useState(1);
  const isTimedExercise = Boolean(exercise.duration);
  const isWeightExercise = exercise.equipment !== 'none' && 
                          exercise.equipment !== 'body weight' &&
                          !isTimedExercise;
  
  const handleCompleteSet = () => {
    if (currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center my-8 relative">
      {struggleDetected && (
        <div className="absolute top-0 left-0 right-0 bg-destructive/20 p-4 rounded-md mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
          <p className="text-sm font-medium text-destructive">
            Struggling detected - consider adjusting form or weight
          </p>
        </div>
      )}
      
      <div className="flex flex-col items-center glass p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">{exercise.name}</h2>
        
        {isWeightExercise && exercise.weight && (
          <div className="bg-primary/20 px-3 py-1 rounded-full mb-4 flex items-center">
            <Dumbbell className="h-4 w-4 mr-1 text-primary" />
            <span className="text-sm font-medium">{exercise.weight} kg</span>
          </div>
        )}
        
        {isTimedExercise ? (
          <div className="text-center mb-6">
            <div className="text-4xl font-mono font-bold mb-2">{formattedTime}</div>
            <p className="text-sm text-muted-foreground">Duration</p>
            
            {onTogglePause && (
              <Button 
                onClick={onTogglePause}
                className="mt-4"
                variant={isPaused ? "default" : "secondary"}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-4xl font-bold">{exercise.reps}</span>
              <span className="text-lg">reps</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Set {currentSet} of {exercise.sets}
            </p>
            
            <Button 
              onClick={handleCompleteSet}
              className="mt-4"
              disabled={currentSet === exercise.sets}
            >
              {currentSet === exercise.sets ? "Set Complete" : "Next Set"}
            </Button>
          </div>
        )}
        
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: isTimedExercise 
                ? '100%' // For timed exercises, progress is handled by the timer
                : `${(currentSet / exercise.sets) * 100}%` 
            }}
          ></div>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>Rest: {exercise.restBetweenSets} sec between sets</span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDisplay;
