
import { encryptData } from './encryption';
import { USER_DATA_KEY } from '../constants/authConstants';
import { saveToStorage } from './localStorage';

// Function for initializing user data with error handling
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
      experienceLevel: 'Beginner',
      limitations: [],
      rank: 'Beginner',
      friends: [],
      friendRequests: []
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
    
    // Store a backup copy in unencrypted format
    saveToStorage('userData_backup', emptyUserData);
    
    console.log('User data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing user data:', error);
    return false;
  }
};
