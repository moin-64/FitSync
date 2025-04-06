
// Helper function for extracting maximum weights for exercise types
export const getUserMaxWeights = (workouts: any): Record<string, number> => {
  const maxWeights: Record<string, number> = {};
  
  try {
    if (!workouts || !Array.isArray(workouts)) {
      return maxWeights;
    }
    
    // Iterate through all workouts and exercises to find maximum weights
    workouts.forEach(workout => {
      if (workout && workout.exercises && Array.isArray(workout.exercises)) {
        workout.exercises.forEach(exercise => {
          if (exercise && exercise.name && typeof exercise.weight === 'number') {
            const currentMax = maxWeights[exercise.name] || 0;
            maxWeights[exercise.name] = Math.max(currentMax, exercise.weight);
          }
        });
      }
    });
    
    return maxWeights;
  } catch (error) {
    console.error('Error getting user max weights:', error);
    return maxWeights;
  }
};
