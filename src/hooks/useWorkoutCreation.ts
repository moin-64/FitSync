import { useState, useEffect } from 'react';
import { Exercise } from '@/types/exercise';
import { LocationState } from '@/types/exercise';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '../context/UserContext';
import { generateAIWorkout } from '@/utils/workoutGenerationUtils';
import { getUserMaxWeights } from '@/utils/userDataUtils';
import { Rank } from '@/utils/rankingUtils';
import { createClient } from '@supabase/supabase-js';

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
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  useEffect(() => {
    if (state?.type === 'ai') {
      setIsGenerating(true);
      setWorkoutName('KI-generiertes Workout');
      
      const exerciseWeights = getUserMaxWeights(workouts || []);
      
      const generateWorkout = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const experienceLevel: Rank = (profile?.experienceLevel as Rank) || 'Beginner';
          
          const aiExercises = await generateAIWorkout(
            profile?.limitations || [],
            experienceLevel,
            exerciseWeights
          );
          
          if (aiExercises && aiExercises.length > 0) {
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
    removeExercise
  };
};
