
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
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
      
      // Simulating server response with user data and encryption key
      const mockUserResponse = {
        id: `user-${Date.now()}`,
        username: email.split('@')[0],
        email,
        // In a real app, this key would be securely stored and retrieved
        encryptionKey: localStorage.getItem(`key-${email}`) || ''
      };
      
      if (!mockUserResponse.encryptionKey) {
        throw new Error('User not found or invalid credentials');
      }
      
      // Store user in state
      setUser({
        id: mockUserResponse.id,
        username: mockUserResponse.username,
        email: mockUserResponse.email
      });
      
      // Save to local storage for persistence
      localStorage.setItem('user', JSON.stringify({
        id: mockUserResponse.id,
        username: mockUserResponse.username,
        email: mockUserResponse.email
      }));
      
      // Decrypt and load user data
      await decryptUserData(mockUserResponse.encryptionKey);
      
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
      // Generate encryption key pair for the user
      const { publicKey, privateKey } = await generateKeyPair();
      
      // In a real app, this would be an API call to create a user account
      // and store the public key securely on the server
      
      // For demo, we'll store locally
      localStorage.setItem(`key-${email}`, privateKey);
      
      // Create user data
      const userData = {
        id: `user-${Date.now()}`,
        username,
        email
      };
      
      // Store user in state
      setUser(userData);
      
      // Save to local storage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Initialize encrypted user data storage
      await initializeUserData(privateKey);
      
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
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const initializeUserData = async (key: string) => {
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
    
    // Encrypt and store
    const encrypted = await encryptData(JSON.stringify(emptyUserData), key);
    localStorage.setItem('userData', encrypted);
  };

  const decryptUserData = async (key: string) => {
    // In a real app, this might fetch encrypted data from a server
    // For demo, we're just retrieving from localStorage
    try {
      const encryptedData = localStorage.getItem('userData');
      if (encryptedData) {
        // Decrypt user data
        const decrypted = await decryptData(encryptedData, key);
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
