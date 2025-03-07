
import { encryptData, decryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { Rank } from './rankingUtils';

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
      experienceLevel: 'Beginner' as Rank,
      limitations: [],
      rank: 'Beginner' as Rank
    },
    workouts: [],
    history: [],
    settings: {
      lastUpdated: new Date().toISOString(),
      version: '1.0'
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

// Improved decryption function with retry mechanism
export const decryptUserData = async (privateKey: string): Promise<any> => {
  if (!privateKey) {
    console.error('Cannot decrypt user data: Missing private key');
    return null;
  }
  
  try {
    const encryptedData = localStorage.getItem(USER_DATA_KEY);
    if (!encryptedData) {
      console.error('No encrypted data found in storage');
      return null;
    }
    
    // Decrypt user data with private key and retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        // Decrypt user data with private key
        const decrypted = await decryptData(encryptedData, privateKey);
        
        // Validate JSON structure
        const userData = JSON.parse(decrypted);
        console.log('User data successfully loaded and validated');
        
        // Ensure profile has correct experienceLevel and rank as Rank type
        if (userData.profile) {
          if (userData.profile.experienceLevel && typeof userData.profile.experienceLevel === 'string') {
            // Capitalize first letter to match Rank type
            userData.profile.experienceLevel = userData.profile.experienceLevel.charAt(0).toUpperCase() + 
                                             userData.profile.experienceLevel.slice(1).toLowerCase();
            // Ensure it's a valid Rank
            if (!['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].includes(userData.profile.experienceLevel)) {
              userData.profile.experienceLevel = 'Beginner';
            }
          } else {
            userData.profile.experienceLevel = 'Beginner';
          }
          
          // Ensure rank is properly set
          if (!userData.profile.rank || typeof userData.profile.rank !== 'string') {
            userData.profile.rank = userData.profile.experienceLevel || 'Beginner';
          }
        }
        
        return userData;
      } catch (error) {
        console.error(`Decryption attempt ${attempts + 1} failed:`, error);
        lastError = error;
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait before retry
      }
    }
    
    console.error('All decryption attempts failed:', lastError);
    return null;
  } catch (error) {
    console.error('Error decrypting user data:', error);
    return null;
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

// Safely store user data with encryption
export const storeUserData = async (userData: any, publicKey: string): Promise<boolean> => {
  if (!userData || !publicKey) {
    console.error('Cannot store user data: Missing data or public key');
    return false;
  }
  
  try {
    // Validate and ensure proper types
    if (userData.profile) {
      // Ensure experienceLevel is a valid Rank
      if (userData.profile.experienceLevel) {
        if (typeof userData.profile.experienceLevel === 'string') {
          const level = userData.profile.experienceLevel.charAt(0).toUpperCase() + 
                       userData.profile.experienceLevel.slice(1).toLowerCase();
          
          if (['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].includes(level)) {
            userData.profile.experienceLevel = level;
          } else {
            userData.profile.experienceLevel = 'Beginner';
          }
        } else {
          userData.profile.experienceLevel = 'Beginner';
        }
      }
      
      // Ensure rank is set
      if (!userData.profile.rank) {
        userData.profile.rank = userData.profile.experienceLevel || 'Beginner';
      }
    }
    
    // Add last updated timestamp
    userData.settings = {
      ...userData.settings || {},
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    // Encrypt and store
    const encrypted = await encryptData(JSON.stringify(userData), publicKey);
    localStorage.setItem(USER_DATA_KEY, encrypted);
    console.log('User data stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};
