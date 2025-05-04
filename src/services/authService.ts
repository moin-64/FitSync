
import { USER_KEY, KEY_PREFIX, USER_DATA_KEY } from '../constants/authConstants';
import { generateKeyPair } from '../utils/encryption';
import { User } from '../types/auth';
import { initializeUserData, decryptUserData } from '../utils/userDataUtils';

// Improved stored user retrieval with better error handling
export const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) {
      return null;
    }
    
    // Validate JSON structure before returning
    const userData = JSON.parse(storedUser);
    
    // Basic validation of user object structure
    if (!userData || typeof userData !== 'object') {
      console.error('Invalid user data format in localStorage');
      localStorage.removeItem(USER_KEY);
      return null;
    }
    
    // Check for required fields
    if (!userData.id || !userData.email || !userData.username) {
      console.error('Missing required user fields in localStorage');
      localStorage.removeItem(USER_KEY);
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    // Clear corrupt data
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

// Check if user key exists with robust validation
export const userKeyExists = (email: string): boolean => {
  if (!email) return false;
  
  try {
    const normalizedEmail = email.toLowerCase().trim();
    return localStorage.getItem(`${KEY_PREFIX}${normalizedEmail}`) !== null;
  } catch (error) {
    console.error('Error checking user key:', error);
    return false;
  }
};

// More reliable login with enhanced error messages and retry logic
export const loginUser = async (email: string, password: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('E-Mail und Passwort sind erforderlich');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Get private key for this user
  const privateKey = localStorage.getItem(`${KEY_PREFIX}${normalizedEmail}`);
  
  if (!privateKey) {
    console.error('No private key found for:', normalizedEmail);
    throw new Error('Benutzer nicht gefunden oder ungültige Anmeldedaten');
  }
  
  try {
    // Mock server response with user data (with retry mechanism)
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        const mockUserResponse = {
          id: `user-${normalizedEmail.split('@')[0]}`,
          username: normalizedEmail.split('@')[0],
          email: normalizedEmail,
        };
        
        // Store user in localStorage for persistence
        localStorage.setItem(USER_KEY, JSON.stringify(mockUserResponse));
        
        // Update session timestamp
        updateSessionActivity();
        
        // Check if we can decrypt user data
        const userData = await decryptUserData(privateKey);
        
        if (!userData) {
          console.log('Failed to decrypt user data - re-initializing');
          
          // If decryption fails, try to re-initialize user data
          await initializeUserData(privateKey);
        }
        
        return mockUserResponse;
      } catch (error) {
        attempts++;
        lastError = error;
        
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Short delay before retry attempt
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    throw lastError || new Error('Login failed after multiple attempts');
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Anmeldung fehlgeschlagen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
  }
};

// Enhanced registration with better validation and error handling
export const registerUser = async (username: string, email: string, password: string): Promise<User> => {
  if (!username || !email || !password) {
    throw new Error('Benutzername, E-Mail und Passwort sind erforderlich');
  }
  
  if (password.length < 6) {
    throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
  }
  
  // Check if user already exists
  if (userKeyExists(normalizedEmail)) {
    throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits');
  }
  
  try {
    // Generate secure encryption key pair with retry logic
    let keyPair;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        keyPair = await generateKeyPair();
        if (keyPair && keyPair.publicKey && keyPair.privateKey) {
          break;
        }
      } catch (e) {
        console.error(`Key generation attempt ${attempts + 1} failed:`, e);
      }
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate secure keys after multiple attempts');
      }
      
      // Short delay before retry attempt
      await new Promise(resolve => setTimeout(resolve, 300 * attempts));
    }
    
    if (!keyPair) {
      throw new Error('Key generation failed');
    }
    
    const { publicKey, privateKey } = keyPair;
    
    // Store private key (in a real app this would be derived from user password or stored in a secure enclave)
    localStorage.setItem(`${KEY_PREFIX}${normalizedEmail}`, privateKey);
    
    // Create user data
    const userData = {
      id: `user-${normalizedEmail.split('@')[0]}`,
      username,
      email: normalizedEmail,
      createdAt: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    // Update session timestamp
    updateSessionActivity();
    
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
    throw error instanceof Error ? error : new Error('Registration failed: Unknown error');
  }
};

// Log out user with complete cleanup and session management
export const logoutUser = (): void => {
  try {
    // Remove authentication data, but not encryption keys
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('lastActivityTimestamp');
    
    // Clear session cookies (if present)
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim().startsWith('session')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    console.log('User successfully logged out');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Check session expiration time
export const isSessionValid = (): boolean => {
  try {
    const lastActivity = localStorage.getItem('lastActivityTimestamp');
    if (!lastActivity) return false;
    
    const now = Date.now();
    const lastActivityTime = parseInt(lastActivity, 10);
    
    // Check if timestamp is a valid number
    if (isNaN(lastActivityTime)) {
      localStorage.removeItem('lastActivityTimestamp');
      return false;
    }
    
    const sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
    
    return now - lastActivityTime < sessionTimeout;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

// Update session activity
export const updateSessionActivity = (): void => {
  try {
    localStorage.setItem('lastActivityTimestamp', Date.now().toString());
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
};
