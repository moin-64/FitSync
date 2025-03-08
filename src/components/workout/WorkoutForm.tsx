
import React from 'react';
import { Exercise } from '@/types/exercise';
import WorkoutName from './WorkoutName';
import ExerciseList from './ExerciseList';

interface WorkoutFormProps {
  workoutName: string;
  setWorkoutName: (name: string) => void;
  exercises: Exercise[];
  expandedExercise: string | null;
  setExpandedExercise: (id: string | null) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
  addExercise: () => void;
  exerciseFilter: string;
  setExerciseFilter: (filter: string) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({
  workoutName,
  setWorkoutName,
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
    <main className="container mx-auto px-4 py-6">
      <WorkoutName 
        workoutName={workoutName}
        setWorkoutName={setWorkoutName}
      />
      
      <ExerciseList 
        exercises={exercises}
        expandedExercise={expandedExercise}
        setExpandedExercise={setExpandedExercise}
        updateExercise={updateExercise}
        removeExercise={removeExercise}
        addExercise={addExercise}
        exerciseFilter={exerciseFilter}
        setExerciseFilter={setExerciseFilter}
      />
    </main>
  );
};

export default WorkoutForm;
