
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, AuthContextType } from '../types/auth';
import { 
  getStoredUser, 
  loginUser, 
  registerUser, 
  logoutUser,
  userKeyExists
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      setAuthError(null);
      const storedUser = getStoredUser();
      
      if (storedUser) {
        setUser(storedUser);
        
        // Check if key exists for this user
        if (!userKeyExists(storedUser.email)) {
          throw new Error('Key not found');
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthError(error as Error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check auth on initialization
    checkAuth();
  }, []);

  const retryAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      
      toast({
        title: 'Successfully logged in',
        description: `Welcome back, ${userData.username}!`,
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again',
        variant: 'destructive',
      });
      setLoading(false);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const userData = await registerUser(username, email, password);
      setUser(userData);
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully',
      });
      
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    logoutUser();
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
    
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        retryAuth
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
