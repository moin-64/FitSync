
import { UserData, UserProfile, Friend, FriendRequest } from '../types/user';
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
    
    // For demo, we're saving to localStorage with error handling
    const dataString = JSON.stringify(data);
    localStorage.setItem('userData', dataString); // This would be encrypted
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to save user data:', error);
    return Promise.reject(error);
  }
};

export const updateProfileRank = (userData: UserData): UserProfile => {
  const updatedProfile = { ...userData.profile };
  
  // Extract all exercises from completed workouts with error handling
  const allExercises = (userData.workouts || [])
    .filter(w => w && w.completed)
    .flatMap(w => w.exercises || [])
    .filter(Boolean);
  
  // Calculate max weight and reps with safer calculations
  const maxWeight = calculateMaxWeight(allExercises);
  const maxReps = calculateMaxReps(allExercises);
  
  // Determine eligible rank with improved calculation
  const eligibleRank = calculateEligibleRank(
    updatedProfile.rank,
    updatedProfile.birthdate,
    (userData.history || []).length,
    maxWeight,
    maxReps
  );
  
  // Update rank if eligible for promotion
  if (eligibleRank !== updatedProfile.rank) {
    updatedProfile.rank = eligibleRank;
  }
  
  return updatedProfile;
};

// Helper function to find a friend by username
export const findFriendByUsername = (friends: Friend[], username: string): Friend | undefined => {
  if (!friends || !Array.isArray(friends)) return undefined;
  return friends.find(friend => 
    friend && friend.username && friend.username.toLowerCase() === username.toLowerCase()
  );
};

// Helper to check if a friend request already exists
export const hasPendingRequest = (requests: FriendRequest[], username: string): boolean => {
  if (!requests || !Array.isArray(requests)) return false;
  return requests.some(request => 
    request && request.fromUsername && 
    request.fromUsername.toLowerCase() === username.toLowerCase()
  );
};
