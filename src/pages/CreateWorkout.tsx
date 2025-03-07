
import React from 'react';
import { useLocation } from 'react-router-dom';
import { LocationState } from '@/types/exercise';
import { useWorkoutCreation } from '@/hooks/useWorkoutCreation';
import { useWorkoutSave } from '@/hooks/useWorkoutSave';

// Component imports
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutForm from '@/components/workout/WorkoutForm';
import WorkoutFooter from '@/components/workout/WorkoutFooter';
import LoadingWorkout from '@/components/workout/LoadingWorkout';

const CreateWorkout = () => {
  const location = useLocation();
  const { state } = location as { state: LocationState };
  
  const {
    workoutName,
    setWorkoutName,
    exercises,
    expandedExercise,
    setExpandedExercise,
    isGenerating,
    exerciseFilter,
    setExerciseFilter,
    addExercise,
    updateExercise,
    removeExercise
  } = useWorkoutCreation(state);
  
  const {
    isSaving,
    handleSaveWorkout
  } = useWorkoutSave(workoutName, exercises, state);

  if (isGenerating) {
    return <LoadingWorkout />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 animate-page-transition-in">
      <WorkoutHeader 
        type={state?.type}
        isSaving={isSaving}
      />
      
      <WorkoutForm
        workoutName={workoutName}
        setWorkoutName={setWorkoutName}
        exercises={exercises}
        expandedExercise={expandedExercise}
        setExpandedExercise={setExpandedExercise}
        updateExercise={updateExercise}
        removeExercise={removeExercise}
        addExercise={addExercise}
        exerciseFilter={exerciseFilter}
        setExerciseFilter={setExerciseFilter}
      />
      
      <WorkoutFooter 
        exerciseCount={exercises.length}
        isSaving={isSaving}
        onSaveWorkout={handleSaveWorkout}
      />
    </div>
  );
};

export default CreateWorkout;
