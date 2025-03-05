
import { encryptData, decryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { useToast } from '@/hooks/use-toast';

export const initializeUserData = async (publicKey: string) => {
  // Initialize empty encrypted user data
  const emptyUserData = {
    profile: {
      birthdate: null,
      height: null,
      weight: null,
      experienceLevel: null,
      limitations: [],
    },
    workouts: [],
    history: [],
    settings: {}
  };
  
  try {
    // Encrypt with public key and store
    const encrypted = await encryptData(JSON.stringify(emptyUserData), publicKey);
    localStorage.setItem(USER_DATA_KEY, encrypted);
    console.log('User data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing user data:', error);
    return false;
  }
};

export const decryptUserData = async (privateKey: string): Promise<boolean> => {
  // In a real app, encrypted data would be retrieved from a server
  // For the demo, we retrieve it from localStorage
  try {
    const encryptedData = localStorage.getItem(USER_DATA_KEY);
    if (encryptedData) {
      // Decrypt user data with private key
      const decrypted = await decryptData(encryptedData, privateKey);
      // Here we would load decrypted user data into app state
      console.log('User data successfully loaded');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error decrypting user data:', error);
    // Handle decryption error - possibly wrong key/user
    return false;
  }
};

export const getUserMaxWeights = (workouts: any[]): Record<string, number> => {
  const maxWeights: Record<string, number> = {};
  
  // Extract all exercises from completed workouts
  const allExercises = workouts
    .filter(w => w.completed)
    .flatMap(w => w.exercises);
  
  // Find max weight for each exercise
  allExercises.forEach(exercise => {
    if (exercise.weight && exercise.weight > 0) {
      const currentMax = maxWeights[exercise.name] || 0;
      if (exercise.weight > currentMax) {
        maxWeights[exercise.name] = exercise.weight;
      }
    }
  });
  
  return maxWeights;
};
