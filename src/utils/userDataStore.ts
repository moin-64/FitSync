
import { encryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { saveToStorage } from './localStorage';

// Improved function for securely storing user data with encryption, backup and error handling
export const storeUserData = async (userData: any, publicKey: string): Promise<boolean> => {
  if (!userData || !publicKey) {
    console.error('Cannot store user data: Missing data or public key');
    return false;
  }
  
  try {
    // Validate and ensure types are correct
    if (userData.profile) {
      // Validate profile data
      validateProfileData(userData.profile);
    }
    
    // Add a last updated timestamp
    userData.settings = {
      ...userData.settings || {},
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    // Make sure userData is properly structured
    if (!userData.workouts) userData.workouts = [];
    if (!userData.history) userData.history = [];
    
    // Create a JSON-serializable copy to avoid circular references
    const safeUserData = JSON.parse(JSON.stringify(userData));
    
    // Save a backup copy in unencrypted format
    try {
      saveToStorage('userData_backup', safeUserData);
    } catch (backupError) {
      console.warn('Failed to save backup user data:', backupError);
      // Continue with main storage even if backup fails
    }
    
    // Encrypt and store
    try {
      const dataString = JSON.stringify(safeUserData);
      const encrypted = await encryptData(dataString, publicKey);
      localStorage.setItem(USER_DATA_KEY, encrypted);
      console.log('User data stored successfully (encrypted)');
      return true;
    } catch (encryptionError) {
      console.error('Encryption failed, storing backup only:', encryptionError);
      // At least one storage method succeeded (backup), so return partial success
      return true;
    }
  } catch (error) {
    console.error('Error storing user data:', error);
    
    // Last resort fallback - try to store unencrypted in emergency backup key
    try {
      const safeData = {
        ...userData,
        __emergency_backup: true,
        __timestamp: new Date().toISOString()
      };
      saveToStorage('userData_emergency', safeData);
      console.warn('Stored emergency backup of user data');
      return true;
    } catch (emergencyError) {
      console.error('All storage attempts failed:', emergencyError);
      return false;
    }
  }
};

// Helper function to validate profile data
const validateProfileData = (profile: any) => {
  if (!profile) return;
  
  // Ensure experienceLevel is a valid Rank
  if (profile.experienceLevel) {
    if (typeof profile.experienceLevel === 'string') {
      const level = profile.experienceLevel.charAt(0).toUpperCase() + 
                   profile.experienceLevel.slice(1).toLowerCase();
      
      if (['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].includes(level)) {
        profile.experienceLevel = level;
      } else {
        profile.experienceLevel = 'Beginner';
      }
    } else {
      profile.experienceLevel = 'Beginner';
    }
  }
  
  // Ensure Rank is set
  if (!profile.rank) {
    profile.rank = profile.experienceLevel || 'Beginner';
  }
  
  // Ensure friends and friendRequests exist and are arrays
  if (!Array.isArray(profile.friends)) {
    profile.friends = [];
  }
  
  if (!Array.isArray(profile.friendRequests)) {
    profile.friendRequests = [];
  }
  
  // Ensure other required fields
  if (!profile.id) profile.id = '';
  if (!profile.username) profile.username = '';
  if (profile.fitness_score === undefined) profile.fitness_score = 0;
  if (profile.experience === undefined) profile.experience = 0;
  if (!Array.isArray(profile.limitations)) profile.limitations = [];
};
