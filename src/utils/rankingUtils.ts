
// Age categories
export type AgeCategory = 'youth' | 'adult' | 'senior';

// Rank definitions
export type Rank = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';

// Rank requirements by age category and exercise type
export interface RankRequirement {
  weightLifting: number; // minimum weight in kg
  reps: number; // minimum reps for bodyweight exercises
  workoutCount: number; // minimum number of completed workouts
}

// Mapping of rank requirements by age category
export const rankRequirements: Record<AgeCategory, Record<Rank, RankRequirement>> = {
  youth: {
    Beginner: { weightLifting: 0, reps: 0, workoutCount: 0 },
    Intermediate: { weightLifting: 30, reps: 10, workoutCount: 5 },
    Advanced: { weightLifting: 50, reps: 15, workoutCount: 15 },
    Expert: { weightLifting: 70, reps: 20, workoutCount: 30 },
    Master: { weightLifting: 90, reps: 25, workoutCount: 50 },
  },
  adult: {
    Beginner: { weightLifting: 0, reps: 0, workoutCount: 0 },
    Intermediate: { weightLifting: 50, reps: 15, workoutCount: 5 },
    Advanced: { weightLifting: 80, reps: 20, workoutCount: 15 },
    Expert: { weightLifting: 120, reps: 30, workoutCount: 30 },
    Master: { weightLifting: 150, reps: 40, workoutCount: 50 },
  },
  senior: {
    Beginner: { weightLifting: 0, reps: 0, workoutCount: 0 },
    Intermediate: { weightLifting: 30, reps: 10, workoutCount: 5 },
    Advanced: { weightLifting: 50, reps: 15, workoutCount: 15 },
    Expert: { weightLifting: 80, reps: 20, workoutCount: 30 },
    Master: { weightLifting: 100, reps: 25, workoutCount: 50 },
  },
};

// Order of ranks for progression
export const rankProgression: Rank[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master',
];

// Calculate age from birthdate
export const calculateAge = (birthdate: string | null): number => {
  if (!birthdate) return 30; // Default age if birthdate is not set
  
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Determine age category
export const getAgeCategory = (age: number): AgeCategory => {
  if (age < 18) return 'youth';
  if (age >= 60) return 'senior';
  return 'adult';
};

// Enhanced max weight calculation with error protection
export const calculateMaxWeight = (exercises: { weight?: number }[]): number => {
  let maxWeight = 0;
  
  if (!Array.isArray(exercises)) {
    return 0;
  }
  
  exercises.forEach(exercise => {
    // Only process valid numbers and ignore unusually high values (potential errors)
    if (exercise?.weight && 
        !isNaN(exercise.weight) && 
        exercise.weight > maxWeight &&
        exercise.weight < 1000) { // Reasonable upper limit check
      maxWeight = exercise.weight;
    }
  });
  
  return maxWeight;
};

// Enhanced max reps calculation with error protection
export const calculateMaxReps = (exercises: { reps: number }[]): number => {
  let maxReps = 0;
  
  if (!Array.isArray(exercises)) {
    return 0;
  }
  
  exercises.forEach(exercise => {
    // Only process valid numbers and ignore unusually high values (potential errors)
    if (exercise?.reps && 
        !isNaN(exercise.reps) && 
        exercise.reps > maxReps &&
        exercise.reps < 200) { // Reasonable upper limit check
      maxReps = exercise.reps;
    }
  });
  
  return maxReps;
};

// Improved rank calculation with consistency checks
export const calculateEligibleRank = (
  currentRank: Rank,
  birthdate: string | null,
  completedWorkouts: number,
  maxWeight: number,
  maxReps: number
): Rank => {
  // Ensure current rank is a valid value
  if (!rankProgression.includes(currentRank)) {
    return 'Beginner';
  }
  
  // Sanity check for unreasonable values
  if (completedWorkouts > 1000 || maxWeight > 1000 || maxReps > 200) {
    console.warn('Unreasonable values detected in rank calculation', {
      completedWorkouts,
      maxWeight,
      maxReps
    });
    return currentRank; // Don't promote with suspect data
  }
  
  const age = calculateAge(birthdate);
  const ageCategory = getAgeCategory(age);
  
  // Find current rank index
  const currentRankIndex = rankProgression.indexOf(currentRank);
  
  // Safety check for invalid ranks
  if (currentRankIndex === -1) {
    return 'Beginner';
  }
  
  // Progressive rank check - first check if eligible for highest possible rank
  // And work down to find the highest eligible rank
  for (let i = rankProgression.length - 1; i > currentRankIndex; i--) {
    const rankToCheck = rankProgression[i];
    const requirements = rankRequirements[ageCategory][rankToCheck];
    
    if (
      maxWeight >= requirements.weightLifting &&
      maxReps >= requirements.reps &&
      completedWorkouts >= requirements.workoutCount
    ) {
      return rankToCheck;
    }
  }
  
  return currentRank;
};
