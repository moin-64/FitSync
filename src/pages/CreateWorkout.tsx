
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from "@/hooks/use-toast";
import { Exercise, LocationState } from '@/types/exercise';
import { generateAIWorkout } from '@/utils/workoutGenerationUtils';

// Component imports
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutName from '@/components/workout/WorkoutName';
import ExerciseList from '@/components/workout/ExerciseList';
import WorkoutFooter from '@/components/workout/WorkoutFooter';
import LoadingWorkout from '@/components/workout/LoadingWorkout';

const CreateWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location as { state: LocationState };
  const { profile, addWorkout } = useUser();
  const { toast } = useToast();
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exerciseFilter, setExerciseFilter] = useState('all');
  
  useEffect(() => {
    // If AI workout, generate a workout based on user profile
    if (state?.type === 'ai') {
      setIsGenerating(true);
      setWorkoutName('KI-generiertes Workout');
      
      // Simulate AI workout generation
      setTimeout(() => {
        const aiExercises = generateAIWorkout(profile.limitations);
        setExercises(aiExercises);
        setIsGenerating(false);
      }, 1500);
    } else if (state?.type === 'manual') {
      // Start with a warm-up for manual workouts
      setExercises([
        {
          id: `ex-warmup-${Date.now()}`,
          name: 'Cardio Warmup',
          sets: 1,
          reps: 1,
          duration: 600, // 10 minutes in seconds
          restBetweenSets: 60,
          equipment: 'Treadmill',
          weight: 0,
        }
      ]);
      setWorkoutName('Mein eigenes Workout');
    }
  }, [state?.type, profile.limitations]);
  
  const addExercise = () => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: '',
      sets: 3,
      reps: 10,
      restBetweenSets: 60,
      equipment: '',
      weight: 0, // Default weight
    };
    
    setExercises([...exercises, newExercise]);
    setExpandedExercise(newExercise.id);
  };
  
  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(
      exercises.map(exercise => 
        exercise.id === id ? { ...exercise, ...updates } : exercise
      )
    );
  };
  
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };
  
  const handleSaveWorkout = async () => {
    if (!workoutName) {
      toast({
        title: 'Workout-Name erforderlich',
        description: 'Bitte geben Sie Ihrem Workout einen Namen',
        variant: 'destructive',
      });
      return;
    }
    
    if (exercises.length < 2) {
      toast({
        title: 'Mehr Übungen hinzufügen',
        description: 'Ihr Workout sollte mindestens zwei Übungen enthalten',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      await addWorkout({
        name: workoutName,
        type: state?.type || 'manual',
        exercises,
        completed: false,
      });
      
      toast({
        title: 'Workout gespeichert',
        description: 'Ihr Workout wurde erfolgreich gespeichert',
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Fehler beim Speichern des Workouts:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern des Workouts',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  };

  if (isGenerating) {
    return <LoadingWorkout />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 animate-page-transition-in">
      <WorkoutHeader 
        type={state?.type}
        isSaving={isSaving}
        onSaveWorkout={handleSaveWorkout}
      />
      
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
      
      <WorkoutFooter 
        exerciseCount={exercises.length}
        isSaving={isSaving}
        onSaveWorkout={handleSaveWorkout}
      />
    </div>
  );
};

export default CreateWorkout;
