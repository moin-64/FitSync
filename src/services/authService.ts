
import { USER_KEY, KEY_PREFIX, USER_DATA_KEY } from '../constants/authConstants';
import { generateKeyPair } from '../utils/encryption';
import { User } from '../types/auth';
import { initializeUserData, decryptUserData } from '../utils/userDataUtils';

// Get stored user with improved error handling
export const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

// Check if user key exists with robust checking
export const userKeyExists = (email: string): boolean => {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  return localStorage.getItem(`${KEY_PREFIX}${normalizedEmail}`) !== null;
};

// More reliable login with improved error messages
export const loginUser = async (email: string, password: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Get private key for this user
  const privateKey = localStorage.getItem(`${KEY_PREFIX}${normalizedEmail}`);
  
  if (!privateKey) {
    console.error('No private key found for:', normalizedEmail);
    throw new Error('User not found or invalid credentials');
  }
  
  try {
    // Mock server response with user data
    const mockUserResponse = {
      id: `user-${Date.now()}`,
      username: normalizedEmail.split('@')[0],
      email: normalizedEmail,
    };
    
    // Store user in localStorage for persistence
    localStorage.setItem(USER_KEY, JSON.stringify(mockUserResponse));
    
    // Decrypt user data
    const success = await decryptUserData(privateKey);
    
    if (!success) {
      throw new Error('Failed to decrypt user data');
    }
    
    return mockUserResponse;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Improved registration with better validation
export const registerUser = async (username: string, email: string, password: string): Promise<User> => {
  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if user already exists
  if (userKeyExists(normalizedEmail)) {
    throw new Error('User already exists');
  }
  
  try {
    // Generate secure encryption key pair
    const { publicKey, privateKey } = await generateKeyPair();
    
    if (!publicKey || !privateKey) {
      throw new Error('Failed to generate encryption keys');
    }
    
    // Store private key (in a real app, this would be derived from user password or stored in secure enclave)
    localStorage.setItem(`${KEY_PREFIX}${normalizedEmail}`, privateKey);
    
    // Create user data
    const userData = {
      id: `user-${Date.now()}`,
      username,
      email: normalizedEmail
    };
    
    // Store in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    // Initialize encrypted user data store with public key
    const initialized = await initializeUserData(publicKey);
    
    if (!initialized) {
      // Clean up if initialization fails
      localStorage.removeItem(`${KEY_PREFIX}${normalizedEmail}`);
      localStorage.removeItem(USER_KEY);
      throw new Error('Failed to initialize user data');
    }
    
    return userData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Log out user with complete cleanup
export const logoutUser = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
    // We don't remove the key because we want to allow the user to log back in
    // But we could add a complete account deletion function here if needed
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
