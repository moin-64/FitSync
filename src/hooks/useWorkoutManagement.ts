import { useState } from 'react';
import { UserData, Workout, WorkoutHistory } from '@/types/user';
import { updateProfileRank } from '@/utils/userContext.utils';
import { useSupabaseWorkouts } from './useSupabaseWorkouts';

export function useWorkoutManagement(
  userData: UserData,
  setUserData: (data: UserData) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    saveWorkout: saveWorkoutToSupabase, 
    updateWorkout: updateWorkoutInSupabase,
    deleteWorkout: deleteWorkoutFromSupabase,
    completeWorkout: completeWorkoutInSupabase
  } = useSupabaseWorkouts();

  const addWorkout = async (workout: Omit<Workout, 'id' | 'created_at'>): Promise<Workout> => {
    setIsProcessing(true);
    try {
      // Convert the workout to the format expected by Supabase
      const workoutForSupabase = {
        ...workout,
        // Ensure the type is one of the allowed values in the workout.ts type
        type: workout.type as any
      };
      
      // Save to Supabase
      const savedWorkout = await saveWorkoutToSupabase(workoutForSupabase as any);
      
      if (!savedWorkout) {
        throw new Error('Failed to save workout to Supabase');
      }
      
      // Update local state
      const updatedWorkouts = [...userData.workouts, savedWorkout];
      const updatedData = { ...userData, workouts: updatedWorkouts };
      setUserData(updatedData);
      
      return savedWorkout;
    } catch (error) {
      console.error('Failed to add workout:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateWorkout = async (id: string, data: Partial<Workout>) => {
    setIsProcessing(true);
    try {
      // Convert the workout data to the format expected by Supabase
      const workoutDataForSupabase = {
        ...data,
        // Ensure the type is one of the allowed values if it's being updated
        type: data.type as any
      };
      
      // Update in Supabase
      const success = await updateWorkoutInSupabase(id, workoutDataForSupabase as any);
      
      if (!success) {
        throw new Error('Failed to update workout in Supabase');
      }
      
      // Update local state
      const workoutIndex = userData.workouts.findIndex(w => w.id === id);
      if (workoutIndex === -1) throw new Error('Workout not found');
      
      const updatedWorkouts = [...userData.workouts];
      updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], ...data };
      
      const updatedData = { ...userData, workouts: updatedWorkouts };
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to update workout:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const completeWorkout = async (id: string, stats: Omit<WorkoutHistory, 'id' | 'workoutId' | 'date'>) => {
    setIsProcessing(true);
    try {
      // Ensure the stats object has the required duration property
      const statsWithRequiredFields = {
        ...stats,
        duration: stats.duration || 0, // Default to 0 if not provided
      };
      
      // Complete workout in Supabase
      const success = await completeWorkoutInSupabase(id, statsWithRequiredFields as any);
      
      if (!success) {
        throw new Error('Failed to complete workout in Supabase');
      }
      
      // Update local state
      const workoutIndex = userData.workouts.findIndex(w => w.id === id);
      if (workoutIndex === -1) throw new Error('Workout not found');
      
      const updatedWorkouts = [...userData.workouts];
      updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], completed: true };
      
      const workoutHistory: WorkoutHistory = {
        id: `history-${Date.now()}`,
        workoutId: id,
        date: new Date().toISOString(),
        ...stats
      };
      
      const updatedHistory = [...userData.history, workoutHistory];
      
      const updatedData = {
        ...userData,
        workouts: updatedWorkouts,
        history: updatedHistory
      };
      
      const updatedProfile = updateProfileRank(updatedData);
      updatedData.profile = updatedProfile;
      
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to complete workout:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteWorkout = async (id: string) => {
    setIsProcessing(true);
    try {
      // Delete from Supabase
      const success = await deleteWorkoutFromSupabase(id);
      
      if (!success) {
        throw new Error('Failed to delete workout from Supabase');
      }
      
      // Update local state
      const updatedWorkouts = userData.workouts.filter(w => w.id !== id);
      const updatedData = { ...userData, workouts: updatedWorkouts };
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to delete workout:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    addWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout,
    isProcessing
  };
}
