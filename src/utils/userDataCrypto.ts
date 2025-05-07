import { encryptData, decryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { saveToStorage, getFromStorage } from './localStorage';
import { Rank } from './rankingUtils';

// Optimized decryption function with improved performance and reliability
export const decryptUserData = async (privateKey: string): Promise<any> => {
  if (!privateKey) {
    console.error('Cannot decrypt user data: Missing private key');
    return null;
  }
  
  try {
    const startTime = performance.now();
    
    // Check for cached decrypted data first for instant loading
    const cachedDecrypted = sessionStorage.getItem('decrypted_user_data');
    if (cachedDecrypted) {
      try {
        const cachedData = JSON.parse(cachedDecrypted);
        const cachedTimestamp = sessionStorage.getItem('decrypted_user_data_timestamp');
        const now = Date.now();
        
        // Use cached data if it's recent enough (last 2 minutes)
        if (cachedTimestamp && (now - parseInt(cachedTimestamp, 10)) < 120000) {
          console.log('Using cached decrypted data for instant loading');
          
          // Load fresh data in the background for next time
          setTimeout(() => refreshDecryptedData(privateKey), 100);
          
          return cachedData;
        }
      } catch (e) {
        console.warn('Failed to parse cached decrypted data:', e);
        // Continue with normal decryption if cached data fails
      }
    }
    
    const encryptedData = localStorage.getItem(USER_DATA_KEY);
    if (!encryptedData) {
      console.warn('No encrypted data found in storage, checking backup');
      // If no encrypted data exists, try loading from backup
      const backupData = getFromStorage('userData_backup', null);
      if (backupData) {
        console.log('Loaded data from backup');
        
        // Cache the backup data for future quick access
        try {
          sessionStorage.setItem('decrypted_user_data', JSON.stringify(backupData));
          sessionStorage.setItem('decrypted_user_data_timestamp', Date.now().toString());
        } catch (e) {
          console.warn('Failed to cache backup data:', e);
        }
        
        return backupData;
      }
      return null;
    }
    
    // Optimized retry mechanism with exponential backoff
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    let backoffTime = 100; // Start with 100ms
    
    while (attempts < maxAttempts) {
      try {
        const decryptStartTime = performance.now();
        
        // Decrypt user data with private key
        const decrypted = await decryptData(encryptedData, privateKey);
        
        const decryptEndTime = performance.now();
        console.log(`Decryption completed in ${(decryptEndTime - decryptStartTime).toFixed(2)}ms`);
        
        // Validate and parse JSON structure
        const userData = JSON.parse(decrypted);
        
        // Ensure profile has correct values
        if (userData.profile) {
          userData.profile = validateUserProfile(userData.profile);
        }
        
        // Cache the decrypted data for future quick access
        try {
          sessionStorage.setItem('decrypted_user_data', JSON.stringify(userData));
          sessionStorage.setItem('decrypted_user_data_timestamp', Date.now().toString());
        } catch (e) {
          console.warn('Failed to cache decrypted data:', e);
        }
        
        // Save a backup copy asynchronously
        setTimeout(() => {
          try {
            saveToStorage('userData_backup', userData);
          } catch (backupError) {
            console.warn('Failed to save backup after decryption:', backupError);
          }
        }, 0);
        
        const endTime = performance.now();
        console.log(`User data loaded successfully in ${(endTime - startTime).toFixed(2)}ms`);
        
        return userData;
      } catch (error) {
        console.error(`Decryption attempt ${attempts + 1} failed:`, error);
        lastError = error;
        attempts++;
        
        if (attempts < maxAttempts) {
          // Wait with exponential backoff before next attempt
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          backoffTime *= 2; // Double the backoff time
        }
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

// Refresh decrypted data in the background
const refreshDecryptedData = async (privateKey: string) => {
  try {
    const encryptedData = localStorage.getItem(USER_DATA_KEY);
    if (!encryptedData) return;
    
    const decrypted = await decryptData(encryptedData, privateKey);
    const userData = JSON.parse(decrypted);
    
    if (userData.profile) {
      userData.profile = validateUserProfile(userData.profile);
    }
    
    // Update the cache
    sessionStorage.setItem('decrypted_user_data', JSON.stringify(userData));
    sessionStorage.setItem('decrypted_user_data_timestamp', Date.now().toString());
    
    console.log('Background refresh of decrypted data complete');
  } catch (e) {
    console.warn('Failed to refresh decrypted data in background:', e);
  }
};

// Helper function to validate user profile data
const validateUserProfile = (profile: any) => {
  const validatedProfile = { ...profile };
  
  // Optimized rank validation with lookup map for better performance
  const rankMap: Record<string, Rank> = {
    'beginner': Rank.BEGINNER,
    'intermediate': Rank.INTERMEDIATE, 
    'advanced': Rank.ADVANCED,
    'expert': Rank.EXPERT,
    'elite': Rank.ELITE
  };
  
  if (validatedProfile.experienceLevel && typeof validatedProfile.experienceLevel === 'string') {
    const normalizedRank = validatedProfile.experienceLevel.toLowerCase();
    validatedProfile.experienceLevel = rankMap[normalizedRank] || Rank.BEGINNER;
  } else {
    validatedProfile.experienceLevel = Rank.BEGINNER;
  }
  
  // Ensure Rank is properly set
  validatedProfile.rank = 
    (validatedProfile.rank && typeof validatedProfile.rank === 'string') 
      ? validatedProfile.rank 
      : validatedProfile.experienceLevel || Rank.BEGINNER;
  
  // Ensure arrays exist
  validatedProfile.friends = Array.isArray(validatedProfile.friends) ? validatedProfile.friends : [];
  validatedProfile.friendRequests = Array.isArray(validatedProfile.friendRequests) ? validatedProfile.friendRequests : [];
  
  return validatedProfile;
};
