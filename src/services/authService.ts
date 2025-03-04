
import { USER_KEY, KEY_PREFIX } from '../constants/authConstants';
import { generateKeyPair } from '../utils/encryption';
import { User } from '../types/auth';
import { initializeUserData, decryptUserData } from '../utils/userDataUtils';

// Get stored user
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

// Check if user key exists
export const userKeyExists = (email: string): boolean => {
  return localStorage.getItem(`${KEY_PREFIX}${email}`) !== null;
};

// Mock login
export const loginUser = async (email: string, password: string): Promise<User> => {
  // Get private key for this user
  const privateKey = localStorage.getItem(`${KEY_PREFIX}${email}`);
  
  if (!privateKey) {
    throw new Error('User not found or invalid credentials');
  }
  
  // Mock server response with user data
  const mockUserResponse = {
    id: `user-${Date.now()}`,
    username: email.split('@')[0],
    email,
  };
  
  // Store user in localStorage for persistence
  localStorage.setItem(USER_KEY, JSON.stringify(mockUserResponse));
  
  // Decrypt user data
  await decryptUserData(privateKey);
  
  return mockUserResponse;
};

// Register user
export const registerUser = async (username: string, email: string, password: string): Promise<User> => {
  // Check if user already exists
  if (userKeyExists(email)) {
    throw new Error('User already exists');
  }
  
  // Generate secure encryption key pair
  const { publicKey, privateKey } = await generateKeyPair();
  
  // Store private key (in a real app, this would be derived from user password or stored in secure enclave)
  localStorage.setItem(`${KEY_PREFIX}${email}`, privateKey);
  
  // Create user data
  const userData = {
    id: `user-${Date.now()}`,
    username,
    email
  };
  
  // Store in localStorage
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
  
  // Initialize encrypted user data store with public key
  await initializeUserData(publicKey);
  
  return userData;
};

// Log out user
export const logoutUser = (): void => {
  localStorage.removeItem(USER_KEY);
};
