
import React from 'react';
import { Button } from "@/components/ui/button";
import { SkipForward, StopCircle } from 'lucide-react';

interface WorkoutControlsProps {
  onSkip: () => void;
  onEndWorkout: () => void;
}

const WorkoutControls: React.FC<WorkoutControlsProps> = ({
  onSkip,
  onEndWorkout
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={onSkip}
      >
        <SkipForward className="h-4 w-4 mr-2" />
        Skip Exercise
      </Button>
      
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={onEndWorkout}
      >
        <StopCircle className="h-4 w-4 mr-2" />
        End Workout
      </Button>
    </div>
  );
};

export default WorkoutControls;
