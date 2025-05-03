
import { useState, useEffect } from 'react';
import { Exercise } from '@/types/exercise';
import { LocationState } from '@/types/exercise';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '../context/UserContext';
import { generateAIWorkout } from '@/utils/workout/workoutGenerationUtils';
import { getUserMaxWeights } from '@/utils/userDataUtils';
import { Rank } from '@/utils/rankingUtils';

export const useWorkoutCreation = (state: LocationState | undefined) => {
  const { profile, workouts } = useUser();
  const { toast } = useToast();
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [generationAttempts, setGenerationAttempts] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  useEffect(() => {
    if (state?.type === 'ai') {
      setIsGenerating(true);
      setGenerationError(null);
      setWorkoutName('KI-generiertes Workout');
      
      const exerciseWeights = getUserMaxWeights(workouts || []);
      
      const generateWorkout = async () => {
        try {
          // Add a short delay to show loading state
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const experienceLevel: Rank = (profile?.experienceLevel as Rank) || 'Beginner';
          
          console.log('Generating workout for experience level:', experienceLevel);
          console.log('User limitations:', profile?.limitations || []);
          
          const aiExercises = await generateAIWorkout(
            profile?.limitations || [],
            experienceLevel,
            exerciseWeights
          );
          
          if (aiExercises && aiExercises.length > 0) {
            console.log('Successfully generated workout with exercises:', aiExercises.length);
            
            if (aiExercises.length > 3) {
              const warmup = aiExercises[0];
              const mainExercises = aiExercises.slice(1, 3);
              
              mainExercises.forEach(ex => {
                if (ex.sets) {
                  ex.sets = Math.min(12, ex.sets + 1 + Math.floor(Math.random() * 2));
                }
                if (ex.reps) {
                  ex.reps = Math.min(25, ex.reps + 2 + Math.floor(Math.random() * 4));
                }
              });
              
              setExercises([warmup, ...mainExercises]);
            } else {
              aiExercises.forEach((ex, index) => {
                if (index > 0) {
                  if (ex.sets) {
                    ex.sets = Math.min(12, ex.sets + 2);
                  }
                  if (ex.reps) {
                    ex.reps = Math.min(25, ex.reps + 3);
                  }
                }
              });
              setExercises(aiExercises);
            }
            
            setIsGenerating(false);
            setGenerationError(null);
          } else {
            console.warn('Generated workout has no exercises, retrying...');
            if (generationAttempts < 3) {
              setGenerationAttempts(prev => prev + 1);
            } else {
              console.error('Failed to generate workout after multiple attempts');
              toast({
                title: 'Fehler bei der Workout-Generierung',
                description: 'Wir konnten kein Workout erstellen. Bitte versuche es erneut oder erstelle ein manuelles Workout.',
                variant: 'destructive',
              });
              
              // Fallback to basic workout
              setExercises([
                {
                  id: `ex-warmup-${Date.now()}`,
                  name: 'Cardio Aufwärmen',
                  sets: 1,
                  reps: 1,
                  duration: 600,
                  restBetweenSets: 60,
                  equipment: 'Laufband',
                  weight: 0,
                }
              ]);
              setIsGenerating(false);
              setGenerationError('Fehler bei KI-Generierung. Fallback verwendet.');
            }
          }
        } catch (error) {
          console.error('Fehler bei der Generierung des KI-Workouts:', error);
          toast({
            title: 'Fehler',
            description: 'Bei der Erstellung des Workouts ist ein Fehler aufgetreten. Wir verwenden ein Standard-Workout.',
            variant: 'destructive',
          });
          
          // Fallback in case of error
          setExercises([
            {
              id: `ex-warmup-${Date.now()}`,
              name: 'Cardio Aufwärmen',
              sets: 1,
              reps: 1,
              duration: 600,
              restBetweenSets: 60,
              equipment: 'Laufband',
              weight: 0,
            },
            {
              id: `ex-${Date.now()}-1`,
              name: 'Liegestütze',
              sets: 3,
              reps: 10,
              restBetweenSets: 60,
              equipment: 'Körpergewicht',
              weight: 0,
            },
            {
              id: `ex-${Date.now()}-2`,
              name: 'Kniebeugen',
              sets: 3,
              reps: 12,
              restBetweenSets: 60,
              equipment: 'Körpergewicht',
              weight: 0,
            }
          ]);
          
          setIsGenerating(false);
          setGenerationError('Technischer Fehler bei der KI-Generierung. Fallback verwendet.');
        }
      };
      
      generateWorkout();
      
    } else if (state?.type === 'manual') {
      setExercises([
        {
          id: `ex-warmup-${Date.now()}`,
          name: 'Cardio Aufwärmen',
          sets: 1,
          reps: 1,
          duration: 600,
          restBetweenSets: 60,
          equipment: 'Laufband',
          weight: 0,
        }
      ]);
      setWorkoutName('Mein eigenes Workout');
    }
  }, [state?.type, profile?.limitations, profile?.experienceLevel, workouts, generationAttempts, toast]);
  
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
  
  const retryGeneration = async () => {
    if (state?.type === 'ai') {
      setIsGenerating(true);
      setGenerationError(null);
      setGenerationAttempts(0);
      
      // Reset state as if we're starting fresh
      const experienceLevel: Rank = (profile?.experienceLevel as Rank) || 'Beginner';
      const exerciseWeights = getUserMaxWeights(workouts || []);
      
      try {
        toast({
          title: 'Workout wird neu generiert',
          description: 'Bitte warten...',
        });
        
        const aiExercises = await generateAIWorkout(
          profile?.limitations || [],
          experienceLevel,
          exerciseWeights,
          true // Force regeneration flag
        );
        
        if (aiExercises && aiExercises.length > 0) {
          setExercises(aiExercises);
          setIsGenerating(false);
          
          toast({
            title: 'Neues Workout generiert',
            description: 'Dein Workout wurde erfolgreich neu erstellt.',
          });
        } else {
          throw new Error('Keine Übungen generiert');
        }
      } catch (error) {
        console.error('Fehler bei erneuter Generierung:', error);
        toast({
          title: 'Fehler bei der Neugenerierung',
          description: 'Bitte versuche es später erneut oder erstelle ein manuelles Workout.',
          variant: 'destructive',
        });
        setIsGenerating(false);
        setGenerationError('Fehler bei erneuter KI-Generierung.');
      }
    }
  };
  
  return {
    workoutName,
    setWorkoutName,
    exercises,
    expandedExercise,
    setExpandedExercise,
    isGenerating,
    isSaving,
    setIsSaving,
    exerciseFilter,
    setExerciseFilter,
    addExercise,
    updateExercise,
    removeExercise,
    retryGeneration,
    generationError
  };
};
