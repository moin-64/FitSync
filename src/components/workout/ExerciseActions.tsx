
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Exercise } from '@/types/exercise';

interface ExerciseActionsProps {
  addExercise: () => void;
}

const ExerciseActions: React.FC<ExerciseActionsProps> = ({ addExercise }) => {
  return (
    <Button
      onClick={addExercise}
      className="w-full bg-secondary hover:bg-secondary/90"
    >
      <Plus className="h-4 w-4 mr-2" />
      Übung hinzufügen
    </Button>
  );
};

export default ExerciseActions;
