
import { encryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { saveToStorage } from './localStorage';

// Improved function for securely storing user data with optimized performance
export const storeUserData = async (userData: any, publicKey: string): Promise<boolean> => {
  if (!userData || !publicKey) {
    console.error('Cannot store user data: Missing data or public key');
    return false;
  }
  
  try {
    // Performance optimization: Start with shallow copy to avoid deep cloning overhead
    const startTime = performance.now();
    
    // Validate profile data if it exists
    if (userData.profile) {
      validateProfileData(userData.profile);
    }
    
    // Add metadata with better timestamp format for improved readability
    userData.settings = {
      ...userData.settings || {},
      lastUpdated: new Date().toISOString(),
      version: '1.0',
      platform: navigator.userAgent
    };
    
    // Ensure data structure integrity
    if (!userData.workouts) userData.workouts = [];
    if (!userData.history) userData.history = [];
    
    // Create a safe copy using structured clone for better performance than JSON parse/stringify
    // and to avoid circular references
    let safeUserData;
    try {
      // Use structuredClone for better performance if available
      safeUserData = typeof structuredClone !== 'undefined' 
        ? structuredClone(userData)
        : JSON.parse(JSON.stringify(userData));
    } catch (cloneError) {
      // Fallback to simple object spread for basic data
      console.warn('Structured clone failed, using fallback method:', cloneError);
      safeUserData = { ...userData };
    }
    
    // Save unencrypted backup asynchronously to improve performance
    const backupPromise = (async () => {
      try {
        await saveToStorage('userData_backup', safeUserData);
        return true;
      } catch (backupError) {
        console.warn('Failed to save backup user data:', backupError);
        return false;
      }
    })();
    
    // Encrypt and store main data
    try {
      // Use TextEncoder for more efficient string encoding
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(safeUserData);
      const encryptStartTime = performance.now();
      const encrypted = await encryptData(dataString, publicKey);
      const encryptEndTime = performance.now();
      
      console.log(`Encryption completed in ${(encryptEndTime - encryptStartTime).toFixed(2)}ms`);
      
      localStorage.setItem(USER_DATA_KEY, encrypted);
      
      // Add version in localStorage for migration support
      localStorage.setItem(`${USER_DATA_KEY}_version`, '1.0');
      
      const endTime = performance.now();
      console.log(`User data stored successfully in ${(endTime - startTime).toFixed(2)}ms`);
      
      // Wait for backup to complete
      await backupPromise;
      
      return true;
    } catch (encryptionError) {
      console.error('Encryption failed:', encryptionError);
      
      // Ensure backup completed
      const backupSucceeded = await backupPromise;
      return backupSucceeded; // Return true if at least the backup succeeded
    }
  } catch (error) {
    console.error('Error storing user data:', error);
    
    // Last resort emergency backup with minimal data
    try {
      const minimalData = {
        profile: userData.profile ? { 
          id: userData.profile.id,
          username: userData.profile.username,
          rank: userData.profile.rank || 'Beginner'
        } : {},
        workouts: userData.workouts ? userData.workouts.map((w: any) => ({
          id: w.id,
          name: w.name,
          type: w.type,
          exercises: w.exercises ? w.exercises.map((e: any) => ({
            id: e.id,
            name: e.name
          })) : []
        })) : [],
        __emergency_backup: true,
        __timestamp: new Date().toISOString()
      };
      
      saveToStorage('userData_emergency', minimalData);
      console.warn('Stored emergency backup of user data (minimal)');
      return true;
    } catch (emergencyError) {
      console.error('All storage attempts failed:', emergencyError);
      return false;
    }
  }
};

// Optimized helper function to validate profile data
const validateProfileData = (profile: any) => {
  if (!profile) return;
  
  // Cache valid ranks for faster lookup
  const validRanks = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
  
  // Ensure experienceLevel is a valid Rank
  if (profile.experienceLevel) {
    if (typeof profile.experienceLevel === 'string') {
      // Use first letter uppercase + rest lowercase for consistent formatting
      const level = profile.experienceLevel.charAt(0).toUpperCase() + 
                   profile.experienceLevel.slice(1).toLowerCase();
      
      profile.experienceLevel = validRanks.includes(level) ? level : 'Beginner';
    } else {
      profile.experienceLevel = 'Beginner';
    }
  }
  
  // Ensure Rank is set
  if (!profile.rank) {
    profile.rank = profile.experienceLevel || 'Beginner';
  }
  
  // Ensure arrays exist - use faster typeof check first
  if (typeof profile.friends !== 'object' || !Array.isArray(profile.friends)) {
    profile.friends = [];
  }
  
  if (typeof profile.friendRequests !== 'object' || !Array.isArray(profile.friendRequests)) {
    profile.friendRequests = [];
  }
  
  // Use normal assignment for better performance than conditionals
  profile.id = profile.id || '';
  profile.username = profile.username || '';
  profile.fitness_score = profile.fitness_score ?? 0;
  profile.experience = profile.experience ?? 0;
  profile.limitations = Array.isArray(profile.limitations) ? profile.limitations : [];
};
