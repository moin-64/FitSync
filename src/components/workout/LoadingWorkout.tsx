
import React from 'react';

const LoadingWorkout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Erstelle dein Workout</h2>
        <p className="text-muted-foreground mb-6">
          Unsere KI erstellt einen personalisierten Trainingsplan für dich...
        </p>
        <div className="glass p-4 rounded-lg text-left space-y-2 max-w-md mx-auto animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingWorkout;
