
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { encryptData, decryptData } from '../utils/encryption';

interface UserProfile {
  birthdate: string | null;
  height: number | null;
  weight: number | null;
  experienceLevel: string | null;
  limitations: string[];
  rank: string;
}

interface Workout {
  id: string;
  name: string;
  type: 'manual' | 'ai' | 'scanned';
  exercises: Exercise[];
  createdAt: string;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  restBetweenSets: number;
  equipment: string;
  videoUrl?: string;
}

interface WorkoutHistory {
  id: string;
  workoutId: string;
  date: string;
  duration: number;
  heartRate?: number;
  caloriesBurned?: number;
  oxygenSaturation?: number;
  performance: number; // 0-100 rating
}

interface UserContextType {
  profile: UserProfile;
  workouts: Workout[];
  history: WorkoutHistory[];
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => Promise<Workout>;
  updateWorkout: (id: string, data: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  completeWorkout: (id: string, stats: Omit<WorkoutHistory, 'id' | 'workoutId' | 'date'>) => Promise<void>;
  addLimitation: (limitation: string) => Promise<void>;
  removeLimitation: (limitation: string) => Promise<void>;
}

interface UserData {
  profile: UserProfile;
  workouts: Workout[];
  history: WorkoutHistory[];
  settings: Record<string, any>;
}

const defaultUserProfile: UserProfile = {
  birthdate: null,
  height: null,
  weight: null,
  experienceLevel: null,
  limitations: [],
  rank: 'Beginner'
};

const defaultUserData: UserData = {
  profile: defaultUserProfile,
  workouts: [],
  history: [],
  settings: {}
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // In a real app, we would fetch the encrypted data from a server
        // and decrypt it with the user's key
        
        // For demo, we're loading from localStorage
        const encryptedData = localStorage.getItem('userData');
        if (encryptedData) {
          // Placeholder - in real app would use actual decryption with user's key
          const userDataString = encryptedData; // This would be decrypted
          try {
            const parsedData = JSON.parse(userDataString);
            setUserData(parsedData);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUserData(defaultUserData);
          }
        } else {
          setUserData(defaultUserData);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, user]);

  const saveUserData = async (data: UserData) => {
    try {
      // In a real app, we would encrypt the data with the user's key
      // and send it to the server
      
      // For demo, we're saving to localStorage
      const dataString = JSON.stringify(data);
      localStorage.setItem('userData', dataString); // This would be encrypted
      
      setUserData(data);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updatedProfile = { ...userData.profile, ...data };
    await saveUserData({ ...userData, profile: updatedProfile });
  };

  const addWorkout = async (workout: Omit<Workout, 'id' | 'createdAt'>): Promise<Workout> => {
    const newWorkout: Workout = {
      ...workout,
      id: `workout-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completed: false
    };
    
    const updatedWorkouts = [...userData.workouts, newWorkout];
    await saveUserData({ ...userData, workouts: updatedWorkouts });
    
    return newWorkout;
  };

  const updateWorkout = async (id: string, data: Partial<Workout>) => {
    const workoutIndex = userData.workouts.findIndex(w => w.id === id);
    if (workoutIndex === -1) throw new Error('Workout not found');
    
    const updatedWorkouts = [...userData.workouts];
    updatedWorkouts[workoutIndex] = { ...updatedWorkouts[workoutIndex], ...data };
    
    await saveUserData({ ...userData, workouts: updatedWorkouts });
  };

  const deleteWorkout = async (id: string) => {
    const updatedWorkouts = userData.workouts.filter(w => w.id !== id);
    await saveUserData({ ...userData, workouts: updatedWorkouts });
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
    
    // Calculate new rank based on workout history (simplified)
    const updatedProfile = { ...userData.profile };
    if (updatedHistory.length >= 20) {
      updatedProfile.rank = 'Advanced';
    } else if (updatedHistory.length >= 10) {
      updatedProfile.rank = 'Intermediate';
    }
    
    await saveUserData({
      ...userData,
      workouts: updatedWorkouts,
      history: updatedHistory,
      profile: updatedProfile
    });
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
