import { UserData, UserProfile, Friend, FriendRequest, Notification, Workout, WorkoutHistory, Rank } from '../types/user';
import { calculateEligibleRank, calculateMaxWeight, calculateMaxReps } from './rankingUtils';

export const defaultUserProfile: UserProfile = {
  id: '',
  username: '',
  avatar_url: null,
  fitness_score: 0,
  experience: 0,
  rank: Rank.BEGINNER,
  limitations: [],
};

export const defaultUserData: UserData = {
  profile: defaultUserProfile,
  workouts: [],
  history: []
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
    updatedProfile.rank as any,
    updatedProfile.birthdate,
    (userData.history || []).length,
    maxWeight,
    maxReps
  );
  
  // Update rank if eligible for promotion
  if (eligibleRank !== updatedProfile.rank) {
    updatedProfile.rank = eligibleRank as any;
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

// Create a notification from a friend request
export const createFriendRequestNotification = (request: FriendRequest): Notification => {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    type: 'friendRequest',
    title: 'Neue Freundschaftsanfrage',
    message: `${request.fromUsername} möchte mit dir befreundet sein`,
    createdAt: new Date().toISOString(),
    read: false,
    requestId: request.id,
    fromUsername: request.fromUsername,
    actionable: true // Mark as actionable since this has accept/decline actions
  };
};
