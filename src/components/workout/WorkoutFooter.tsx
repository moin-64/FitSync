
import React from 'react';
import { Button } from "@/components/ui/button";

interface WorkoutFooterProps {
  exerciseCount: number;
  isSaving: boolean;
  onSaveWorkout: () => void;
}

const WorkoutFooter: React.FC<WorkoutFooterProps> = ({
  exerciseCount,
  isSaving,
  onSaveWorkout
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/30 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <span className="text-sm text-muted-foreground">Übungen gesamt: {exerciseCount}</span>
        </div>
        
        <Button
          onClick={onSaveWorkout}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? 'Speichern...' : 'Workout speichern'}
        </Button>
      </div>
    </div>
  );
};

export default WorkoutFooter;
