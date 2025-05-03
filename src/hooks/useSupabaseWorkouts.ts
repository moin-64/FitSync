import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { Workout, Exercise, WorkoutHistory } from '@/types/workout';
import { useAuth } from '@/context/AuthContext';

export function useSupabaseWorkouts() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserWorkouts = async (): Promise<{ 
    workouts: Workout[], 
    history: WorkoutHistory[] 
  }> => {
    if (!user) {
      return { workouts: [], history: [] };
    }

    setIsLoading(true);
    try {
      // Check if the user ID is valid before querying
      // User IDs from auth should be UUIDs for Supabase queries
      let userId = user.id;
      
      // If the user ID doesn't look like a UUID (contains "user-"), return empty data
      // This prevents the invalid UUID format error
      if (typeof userId === 'string' && (userId.startsWith('user-') || !isValidUUID(userId))) {
        console.log('Non-UUID user ID detected, skipping Supabase query:', userId);
        return { workouts: [], history: [] };
      }

      // Fetch workouts
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (workoutError) throw workoutError;
      
      if (!workoutData || workoutData.length === 0) {
        return { workouts: [], history: [] };
      }

      // Fetch exercises for all workouts
      const workoutIds = workoutData.map(w => w.id);
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('workout_id', workoutIds);

      if (exercisesError) throw exercisesError;

      // Fetch workout history
      const { data: historyData, error: historyError } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (historyError) throw historyError;

      // Transform to app data model
      const workouts = workoutData.map(w => {
        const workoutExercises = exercisesData
          .filter(e => e.workout_id === w.id)
          .map(e => ({
            id: e.id,
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration || undefined,
            restBetweenSets: e.rest_between_sets,
            equipment: e.equipment,
            videoUrl: e.video_url || undefined,
            weight: e.weight ? Number(e.weight) : undefined
          }));

        return {
          id: w.id,
          name: w.name,
          type: w.type as 'manual' | 'ai' | 'scanned',
          exercises: workoutExercises,
          createdAt: w.created_at || new Date().toISOString(),
          completed: w.completed || false
        };
      });

      const history = historyData && historyData.length > 0 ? historyData.map(h => ({
        id: h.id,
        workoutId: h.workout_id || '',
        date: h.date || new Date().toISOString(),
        duration: h.duration,
        heartRate: h.heart_rate || undefined,
        caloriesBurned: h.calories_burned || undefined,
        oxygenSaturation: h.oxygen_saturation || undefined,
        performance: h.performance
      })) : [];

      return { workouts, history };
    } catch (error) {
      console.error('Error fetching workouts from Supabase:', error);
      toast({
        title: 'Fehler beim Laden',
        description: 'Deine Trainingsdaten konnten nicht geladen werden',
        variant: 'destructive'
      });
      return { workouts: [], history: [] };
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const saveWorkout = async (workout: Omit<Workout, 'id' | 'createdAt'>): Promise<Workout | null> => {
    if (!user) {
      toast({
        title: 'Nicht angemeldet',
        description: 'Du musst angemeldet sein, um ein Training zu speichern',
        variant: 'destructive'
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Insert workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workout.name,
          type: workout.type,
          completed: workout.completed
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Insert exercises
      const exercisesToInsert = workout.exercises.map(e => ({
        workout_id: workoutData.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        duration: e.duration || null,
        rest_between_sets: e.restBetweenSets,
        equipment: e.equipment,
        video_url: e.videoUrl || null,
        weight: e.weight || null
      }));

      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesToInsert)
        .select();

      if (exercisesError) throw exercisesError;

      // Transform for app model
      const exercises = exercisesData.map(e => ({
        id: e.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        duration: e.duration || undefined,
        restBetweenSets: e.rest_between_sets,
        equipment: e.equipment,
        videoUrl: e.video_url || undefined,
        weight: e.weight ? Number(e.weight) : undefined
      }));

      return {
        id: workoutData.id,
        name: workoutData.name,
        type: workoutData.type as 'manual' | 'ai' | 'scanned',
        exercises: exercises,
        createdAt: workoutData.created_at || new Date().toISOString(),
        completed: workoutData.completed || false
      };
    } catch (error) {
      console.error('Error saving workout to Supabase:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: 'Dein Training konnte nicht gespeichert werden',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkout = async (id: string, data: Partial<Workout>): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      // Update workout data
      const workoutUpdate: any = {};
      if (data.name) workoutUpdate.name = data.name;
      if (data.completed !== undefined) workoutUpdate.completed = data.completed;
      
      if (Object.keys(workoutUpdate).length > 0) {
        const { error: workoutError } = await supabase
          .from('workouts')
          .update(workoutUpdate)
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (workoutError) throw workoutError;
      }
      
      // Update exercises if provided
      if (data.exercises) {
        for (const exercise of data.exercises) {
          // Check if exercise exists
          const { data: existingExercise } = await supabase
            .from('exercises')
            .select('id')
            .eq('id', exercise.id)
            .eq('workout_id', id)
            .single();
          
          if (existingExercise) {
            // Update existing exercise
            const { error: exerciseError } = await supabase
              .from('exercises')
              .update({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration || null,
                rest_between_sets: exercise.restBetweenSets,
                equipment: exercise.equipment,
                video_url: exercise.videoUrl || null,
                weight: exercise.weight || null
              })
              .eq('id', exercise.id)
              .eq('workout_id', id);
            
            if (exerciseError) throw exerciseError;
          } else {
            // Insert new exercise
            const { error: exerciseError } = await supabase
              .from('exercises')
              .insert({
                workout_id: id,
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                duration: exercise.duration || null,
                rest_between_sets: exercise.restBetweenSets,
                equipment: exercise.equipment,
                video_url: exercise.videoUrl || null,
                weight: exercise.weight || null
              });
            
            if (exerciseError) throw exerciseError;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating workout in Supabase:', error);
      toast({
        title: 'Fehler beim Aktualisieren',
        description: 'Dein Training konnte nicht aktualisiert werden',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkout = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      // Delete workout (exercises will be deleted by CASCADE constraint)
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting workout from Supabase:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: 'Dein Training konnte nicht gelöscht werden',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeWorkout = async (
    workoutId: string, 
    stats: Omit<WorkoutHistory, 'id' | 'workoutId' | 'date'>
  ): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      // Update workout as completed
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({ completed: true })
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (workoutError) throw workoutError;

      // Insert workout history
      const { error: historyError } = await supabase
        .from('workout_history')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          duration: stats.duration,
          heart_rate: stats.heartRate || null,
          calories_burned: stats.caloriesBurned || null,
          oxygen_saturation: stats.oxygenSaturation || null,
          performance: stats.performance
        });

      if (historyError) throw historyError;
      
      return true;
    } catch (error) {
      console.error('Error completing workout in Supabase:', error);
      toast({
        title: 'Fehler beim Abschließen',
        description: 'Dein Training konnte nicht als abgeschlossen markiert werden',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchUserWorkouts,
    saveWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout
  };
}
