
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptData, decryptData, generateKeyPair } from '../utils/encryption';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key storage constants
const USER_KEY = 'user';
const KEY_PREFIX = 'secure_key-';
const USER_DATA_KEY = 'userData';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to validate credentials
      // For demo purposes, we're simulating authentication locally
      
      // Retrieve the private key for this user
      const privateKey = localStorage.getItem(`${KEY_PREFIX}${email}`);
      
      if (!privateKey) {
        throw new Error('User not found or invalid credentials');
      }
      
      // Simulating server response with user data
      const mockUserResponse = {
        id: `user-${Date.now()}`,
        username: email.split('@')[0],
        email,
      };
      
      // Store user in state
      setUser({
        id: mockUserResponse.id,
        username: mockUserResponse.username,
        email: mockUserResponse.email
      });
      
      // Save to local storage for persistence
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: mockUserResponse.id,
        username: mockUserResponse.username,
        email: mockUserResponse.email
      }));
      
      // Decrypt and load user data
      await decryptUserData(privateKey);
      
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Generate secure encryption key pair for the user
      const { publicKey, privateKey } = await generateKeyPair();
      
      // In a real app, the public key would be sent to the server,
      // while the private key would be derived from the user's password
      // or stored in a secure enclave/keychain
      
      // For demo, we'll store the private key locally (not recommended for production)
      localStorage.setItem(`${KEY_PREFIX}${email}`, privateKey);
      
      // Create user data
      const userData = {
        id: `user-${Date.now()}`,
        username,
        email
      };
      
      // Store user in state
      setUser(userData);
      
      // Save to local storage for persistence
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Initialize encrypted user data storage using the public key
      await initializeUserData(publicKey);
      
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    // Note: We don't remove the encrypted data or keys on logout
    // This allows the user to log back in and access their data
    navigate('/login');
  };

  const initializeUserData = async (publicKey: string) => {
    // Initialize empty encrypted user data
    const emptyUserData = {
      profile: {
        birthdate: null,
        height: null,
        weight: null,
        experienceLevel: null,
        limitations: [],
      },
      workouts: [],
      history: [],
      settings: {}
    };
    
    // Encrypt and store using the public key
    const encrypted = await encryptData(JSON.stringify(emptyUserData), publicKey);
    localStorage.setItem(USER_DATA_KEY, encrypted);
  };

  const decryptUserData = async (privateKey: string) => {
    // In a real app, this might fetch encrypted data from a server
    // For demo, we're just retrieving from localStorage
    try {
      const encryptedData = localStorage.getItem(USER_DATA_KEY);
      if (encryptedData) {
        // Decrypt user data using the private key
        const decrypted = await decryptData(encryptedData, privateKey);
        // Here we would parse and load decrypted user data into app state
        console.log('User data loaded successfully');
      }
    } catch (error) {
      console.error('Failed to decrypt user data:', error);
      // Handle decryption failure - possibly wrong key/user
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
