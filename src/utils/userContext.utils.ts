
import { UserData, UserProfile } from '../types/user';
import { calculateEligibleRank, calculateMaxWeight, calculateMaxReps } from './rankingUtils';

export const defaultUserProfile: UserProfile = {
  birthdate: null,
  height: null,
  weight: null,
  experienceLevel: null,
  limitations: [],
  rank: 'Beginner',
  friends: [],
  friendRequests: []
};

export const defaultUserData: UserData = {
  profile: defaultUserProfile,
  workouts: [],
  history: [],
  settings: {}
};

export const saveUserData = async (data: UserData): Promise<void> => {
  try {
    // In a real app, we would encrypt the data with the user's key
    // and send it to the server
    
    // For demo, we're saving to localStorage
    const dataString = JSON.stringify(data);
    localStorage.setItem('userData', dataString); // This would be encrypted
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

export const updateProfileRank = (userData: UserData): UserProfile => {
  const updatedProfile = { ...userData.profile };
  
  // Extract all exercises from completed workouts
  const allExercises = userData.workouts
    .filter(w => w.completed)
    .flatMap(w => w.exercises);
  
  // Calculate max weight and reps
  const maxWeight = calculateMaxWeight(allExercises);
  const maxReps = calculateMaxReps(allExercises);
  
  // Determine eligible rank
  const eligibleRank = calculateEligibleRank(
    updatedProfile.rank,
    updatedProfile.birthdate,
    userData.history.length,
    maxWeight,
    maxReps
  );
  
  // Update rank if eligible for promotion
  if (eligibleRank !== updatedProfile.rank) {
    updatedProfile.rank = eligibleRank;
  }
  
  return updatedProfile;
};
