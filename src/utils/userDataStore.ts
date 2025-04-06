
import { encryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { saveToStorage } from './localStorage';

// Function for securely storing user data with encryption and backup
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
    
    // Save a backup copy in unencrypted format
    saveToStorage('userData_backup', userData);
    
    // Encrypt and store
    const encrypted = await encryptData(JSON.stringify(userData), publicKey);
    localStorage.setItem(USER_DATA_KEY, encrypted);
    console.log('User data stored successfully (encrypted and backup)');
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

// Helper function to validate profile data
const validateProfileData = (profile: any) => {
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
  
  // Ensure friends and friendRequests exist
  if (!Array.isArray(profile.friends)) {
    profile.friends = [];
  }
  
  if (!Array.isArray(profile.friendRequests)) {
    profile.friendRequests = [];
  }
};
