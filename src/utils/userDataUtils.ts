
import { encryptData, decryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';

// Initialize user data with improved error handling
export const initializeUserData = async (publicKey: string) => {
  if (!publicKey) {
    console.error('Cannot initialize user data: Missing public key');
    return false;
  }
  
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
    settings: {
      lastUpdated: new Date().toISOString()
    }
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

// Improved decryption function
export const decryptUserData = async (privateKey: string): Promise<boolean> => {
  if (!privateKey) {
    console.error('Cannot decrypt user data: Missing private key');
    return false;
  }
  
  try {
    const encryptedData = localStorage.getItem(USER_DATA_KEY);
    if (!encryptedData) {
      console.error('No encrypted data found in storage');
      return false;
    }
    
    // Decrypt user data with private key
    const decrypted = await decryptData(encryptedData, privateKey);
    
    // Validate JSON structure
    try {
      JSON.parse(decrypted);
      console.log('User data successfully loaded and validated');
      return true;
    } catch (jsonError) {
      console.error('Decrypted data is not valid JSON:', jsonError);
      return false;
    }
  } catch (error) {
    console.error('Error decrypting user data:', error);
    return false;
  }
};

// Enhanced function to get max weights with better error handling
export const getUserMaxWeights = (workouts: any[]): Record<string, number> => {
  if (!workouts || !Array.isArray(workouts)) {
    console.warn('Invalid workouts data provided to getUserMaxWeights');
    return {};
  }
  
  const maxWeights: Record<string, number> = {};
  
  try {
    // Extract all exercises from completed workouts
    const allExercises = workouts
      .filter(w => w && w.completed)
      .flatMap(w => w.exercises || []);
    
    // Find max weight for each exercise
    allExercises.forEach(exercise => {
      if (exercise && exercise.name && exercise.weight && exercise.weight > 0) {
        const currentMax = maxWeights[exercise.name] || 0;
        if (exercise.weight > currentMax) {
          maxWeights[exercise.name] = exercise.weight;
        }
      }
    });
    
    return maxWeights;
  } catch (error) {
    console.error('Error processing workout data for max weights:', error);
    return {};
  }
};
