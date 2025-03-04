
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Exercise } from '@/types/exercise';
import ExerciseItem from './ExerciseItem';

interface ExerciseListProps {
  exercises: Exercise[];
  expandedExercise: string | null;
  setExpandedExercise: (id: string | null) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
  addExercise: () => void;
  exerciseFilter: string;
  setExerciseFilter: (filter: string) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  expandedExercise,
  setExpandedExercise,
  updateExercise,
  removeExercise,
  addExercise,
  exerciseFilter,
  setExerciseFilter
}) => {
  return (
    <div>
      <div className="space-y-4 mb-8">
        {exercises.map((exercise, index) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            index={index}
            expandedExercise={expandedExercise}
            setExpandedExercise={setExpandedExercise}
            updateExercise={updateExercise}
            removeExercise={removeExercise}
            exercises={exercises}
            exerciseFilter={exerciseFilter}
            setExerciseFilter={setExerciseFilter}
          />
        ))}
      </div>
      
      <Button
        onClick={addExercise}
        className="w-full bg-secondary hover:bg-secondary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Übung hinzufügen
      </Button>
    </div>
  );
};

export default ExerciseList;
