
import { useState } from 'react';
import { UserData, Workout, WorkoutHistory } from '@/types/user';
import { saveUserData, updateProfileRank } from '@/utils/userContext.utils';

export function useWorkoutManagement(
  userData: UserData,
  setUserData: (data: UserData) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);

  const addWorkout = async (workout: Omit<Workout, 'id' | 'createdAt'>): Promise<Workout> => {
    setIsProcessing(true);
    try {
      const newWorkout: Workout = {
        ...workout,
        id: `workout-${Date.now()}`,
        createdAt: new Date().toISOString(),
        completed: false
      };
      
      const updatedWorkouts = [...userData.workouts, newWorkout];
      const updatedData = { ...userData, workouts: updatedWorkouts };
      await saveUserData(updatedData);
      setUserData(updatedData);
      
      return newWorkout;
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
      const workoutIndex = userData.workouts.findIndex(w => w.id === id);
      if (workoutIndex === -1) throw new Error('Workout not found');
      
      const updatedWorkouts = [...userData.workouts];
      updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], ...data };
      
      const updatedData = { ...userData, workouts: updatedWorkouts };
      await saveUserData(updatedData);
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to update workout:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteWorkout = async (id: string) => {
    setIsProcessing(true);
    try {
      const updatedWorkouts = userData.workouts.filter(w => w.id !== id);
      const updatedData = { ...userData, workouts: updatedWorkouts };
      await saveUserData(updatedData);
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to delete workout:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const completeWorkout = async (id: string, stats: Omit<WorkoutHistory, 'id' | 'workoutId' | 'date'>) => {
    setIsProcessing(true);
    try {
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
      
      await saveUserData(updatedData);
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to complete workout:', error);
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
