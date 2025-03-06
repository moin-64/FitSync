
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { UserContextType, UserProfile, Workout, WorkoutHistory } from '../types/user';
import { useUserData } from '../hooks/useUserData';
import { saveUserData, updateProfileRank } from '../utils/userContext.utils';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { userData, setUserData, loading } = useUserData(user, isAuthenticated);

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updatedProfile = { ...userData.profile, ...data };
    const updatedData = { ...userData, profile: updatedProfile };
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const addWorkout = async (workout: Omit<Workout, 'id' | 'createdAt'>): Promise<Workout> => {
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
  };

  const updateWorkout = async (id: string, data: Partial<Workout>) => {
    const workoutIndex = userData.workouts.findIndex(w => w.id === id);
    if (workoutIndex === -1) throw new Error('Workout not found');
    
    const updatedWorkouts = [...userData.workouts];
    updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], ...data };
    
    const updatedData = { ...userData, workouts: updatedWorkouts };
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const deleteWorkout = async (id: string) => {
    const updatedWorkouts = userData.workouts.filter(w => w.id !== id);
    const updatedData = { ...userData, workouts: updatedWorkouts };
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const completeWorkout = async (id: string, stats: Omit<WorkoutHistory, 'id' | 'workoutId' | 'date'>) => {
    // Mark workout as completed
    const workoutIndex = userData.workouts.findIndex(w => w.id === id);
    if (workoutIndex === -1) throw new Error('Workout not found');
    
    const updatedWorkouts = [...userData.workouts];
    updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], completed: true };
    
    // Add to workout history
    const workoutHistory: WorkoutHistory = {
      id: `history-${Date.now()}`,
      workoutId: id,
      date: new Date().toISOString(),
      ...stats
    };
    
    const updatedHistory = [...userData.history, workoutHistory];
    
    // Calculate new rank based on workout achievements
    const updatedData = {
      ...userData,
      workouts: updatedWorkouts,
      history: updatedHistory
    };
    
    // Update rank if eligible for promotion
    const updatedProfile = updateProfileRank(updatedData);
    updatedData.profile = updatedProfile;
    
    await saveUserData(updatedData);
    setUserData(updatedData);
  };

  const addLimitation = async (limitation: string) => {
    if (userData.profile.limitations.includes(limitation)) return;
    
    const updatedLimitations = [...userData.profile.limitations, limitation];
    await updateProfile({ limitations: updatedLimitations });
  };

  const removeLimitation = async (limitation: string) => {
    const updatedLimitations = userData.profile.limitations.filter(l => l !== limitation);
    await updateProfile({ limitations: updatedLimitations });
  };

  return (
    <UserContext.Provider
      value={{
        profile: userData.profile,
        workouts: userData.workouts,
        history: userData.history,
        loading,
        updateProfile,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        completeWorkout,
        addLimitation,
        removeLimitation
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
