import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from "@/hooks/use-toast";
import { Exercise } from '../types/user';
import { LocationState } from '@/types/exercise';
import { generateAIWorkout } from '@/utils/workoutGenerationUtils';
import { getUserMaxWeights } from '@/utils/userDataUtils';
import { Rank } from '@/utils/rankingUtils';

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
  const { profile, addWorkout, workouts } = useUser();
  const { toast } = useToast();
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [generationAttempts, setGenerationAttempts] = useState(0);
  
  useEffect(() => {
    if (state?.type === 'ai') {
      setIsGenerating(true);
      setWorkoutName('KI-generiertes Workout');
      
      const exerciseWeights = getUserMaxWeights(workouts || []);
      
      const generateWorkout = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const experienceLevel = profile?.experienceLevel as Rank || 'Beginner';
          
          const aiExercises = generateAIWorkout(
            profile?.limitations || [],
            experienceLevel,
            exerciseWeights
          );
          
          if (aiExercises && aiExercises.length > 0) {
            const modifiedExercises = [...aiExercises];
            
            if (modifiedExercises.length > 5) {
              const selectedExercises = modifiedExercises.slice(0, 4);
              selectedExercises.forEach(ex => {
                if (ex.sets < 4) {
                  ex.sets = Math.min(5, ex.sets + 2);
                }
                if (ex.reps < 12) {
                  ex.reps = Math.min(15, ex.reps + 3);
                }
              });
              setExercises(selectedExercises);
            } else {
              modifiedExercises.forEach(ex => {
                if (ex.sets < 4) {
                  ex.sets = Math.min(5, ex.sets + 1);
                }
                if (ex.reps < 12) {
                  ex.reps = Math.min(15, ex.reps + 2);
                }
              });
              setExercises(modifiedExercises);
            }
            
            setIsGenerating(false);
          } else {
            if (generationAttempts < 3) {
              setGenerationAttempts(prev => prev + 1);
            } else {
              toast({
                title: 'Fehler bei der Workout-Generierung',
                description: 'Wir konnten kein Workout erstellen. Bitte versuche es erneut oder erstelle ein manuelles Workout.',
                variant: 'destructive',
              });
              
              setExercises([
                {
                  id: `ex-warmup-${Date.now()}`,
                  name: 'Cardio Warmup',
                  sets: 1,
                  reps: 1,
                  duration: 600,
                  restBetweenSets: 60,
                  equipment: 'Treadmill',
                  weight: 0,
                }
              ]);
              setIsGenerating(false);
            }
          }
        } catch (error) {
          console.error('Error generating AI workout:', error);
          toast({
            title: 'Fehler',
            description: 'Bei der Erstellung des Workouts ist ein Fehler aufgetreten.',
            variant: 'destructive',
          });
          setIsGenerating(false);
        }
      };
      
      generateWorkout();
      
    } else if (state?.type === 'manual') {
      setExercises([
        {
          id: `ex-warmup-${Date.now()}`,
          name: 'Cardio Warmup',
          sets: 1,
          reps: 1,
          duration: 600,
          restBetweenSets: 60,
          equipment: 'Treadmill',
          weight: 0,
        }
      ]);
      setWorkoutName('Mein eigenes Workout');
    }
  }, [state?.type, profile?.limitations, profile?.experienceLevel, workouts, generationAttempts]);
  
  const addExercise = () => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: '',
      sets: 3,
      reps: 10,
      restBetweenSets: 60,
      equipment: '',
      weight: 0,
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
      
      const newWorkout = {
        id: `workout-${Date.now()}`,
        name: workoutName,
        type: state?.type || 'manual',
        exercises,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      
      setTimeout(async () => {
        try {
          await addWorkout(newWorkout);
          
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
      }, 800);
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
