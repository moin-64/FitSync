
import { encryptData, decryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { saveToStorage, getFromStorage } from './localStorage';
import { Rank } from './rankingUtils';

// Improved decryption function with retry mechanism and backup
export const decryptUserData = async (privateKey: string): Promise<any> => {
  if (!privateKey) {
    console.error('Cannot decrypt user data: Missing private key');
    return null;
  }
  
  try {
    const encryptedData = localStorage.getItem(USER_DATA_KEY);
    if (!encryptedData) {
      console.warn('No encrypted data found in storage, checking backup');
      // If no encrypted data exists, try loading from backup
      const backupData = getFromStorage('userData_backup', null);
      if (backupData) {
        console.log('Loaded data from backup');
        return backupData;
      }
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
        
        // Ensure profile has correct experienceLevel and rank values of type Rank
        if (userData.profile) {
          userData.profile = validateUserProfile(userData.profile);
        }
        
        // Save a backup copy in unencrypted format
        saveToStorage('userData_backup', userData);
        
        return userData;
      } catch (error) {
        console.error(`Decryption attempt ${attempts + 1} failed:`, error);
        lastError = error;
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait before next attempt
      }
    }
    
    console.error('All decryption attempts failed:', lastError);
    
    // If all decryption attempts fail, try loading from backup
    const backupData = getFromStorage('userData_backup', null);
    if (backupData) {
      console.log('Loaded data from backup after decryption failure');
      return backupData;
    }
    
    return null;
  } catch (error) {
    console.error('Error decrypting user data:', error);
    
    // On errors try loading from backup
    const backupData = getFromStorage('userData_backup', null);
    if (backupData) {
      console.log('Loaded data from backup after error');
      return backupData;
    }
    
    return null;
  }
};

// Helper function to validate user profile data
const validateUserProfile = (profile: any) => {
  const validatedProfile = { ...profile };
  
  // Ensure experienceLevel is a valid Rank
  if (validatedProfile.experienceLevel && typeof validatedProfile.experienceLevel === 'string') {
    // Capitalize first letter to match Rank type
    validatedProfile.experienceLevel = validatedProfile.experienceLevel.charAt(0).toUpperCase() + 
                                     validatedProfile.experienceLevel.slice(1).toLowerCase();
    // Ensure it's a valid Rank
    if (!['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'].includes(validatedProfile.experienceLevel)) {
      validatedProfile.experienceLevel = 'Beginner';
    }
  } else {
    validatedProfile.experienceLevel = 'Beginner';
  }
  
  // Ensure Rank is properly set
  if (!validatedProfile.rank || typeof validatedProfile.rank !== 'string') {
    validatedProfile.rank = validatedProfile.experienceLevel || 'Beginner';
  }
  
  // Ensure friends and friendRequests exist
  if (!Array.isArray(validatedProfile.friends)) {
    validatedProfile.friends = [];
  }
  
  if (!Array.isArray(validatedProfile.friendRequests)) {
    validatedProfile.friendRequests = [];
  }
  
  return validatedProfile;
};
