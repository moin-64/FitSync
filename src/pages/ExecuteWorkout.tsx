
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, SkipForward, StopCircle } from 'lucide-react';

const ExecuteWorkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Placeholder workout data - in a real app, this would be fetched based on the ID
  const workout = {
    id: id || '1',
    name: 'Full Body Workout',
    exercises: [
      { name: 'Warm Up', duration: 600, type: 'cardio' },
      { name: 'Push-ups', sets: 3, reps: 10, type: 'strength' },
      { name: 'Squats', sets: 3, reps: 15, type: 'strength' },
      { name: 'Plank', duration: 60, type: 'core' },
    ],
    totalDuration: 45 // in minutes
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused]);
  
  const handleSkip = () => {
    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
    }
  };
  
  const handleEndWorkout = () => {
    // In a real app, you'd save workout progress here
    navigate('/home');
  };
  
  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Calculate progress percentage
  const progress = (currentExercise / workout.exercises.length) * 100;
  
  const currentEx = workout.exercises[currentExercise];
  
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/home')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{workout.name}</h1>
      </div>
      
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>Exercise {currentExercise + 1}/{workout.exercises.length}</span>
          <span>{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
      
      <div className="flex-1 glass rounded-lg p-6 mb-6 flex flex-col items-center justify-center">
        <div className="w-full aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
          {/* Placeholder for exercise video */}
          <p className="text-muted-foreground">Exercise Video</p>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">{currentEx.name}</h2>
        
        {currentEx.type === 'strength' ? (
          <p className="text-xl mb-4">{currentEx.sets} sets × {currentEx.reps} reps</p>
        ) : (
          <p className="text-xl mb-4">
            {Math.floor(currentEx.duration / 60)}:{(currentEx.duration % 60).toString().padStart(2, '0')}
          </p>
        )}
        
        <Button
          onClick={handleTogglePause}
          variant="outline"
          className="mb-4 w-full max-w-xs"
        >
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleSkip}
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Skip Exercise
        </Button>
        
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleEndWorkout}
        >
          <StopCircle className="h-4 w-4 mr-2" />
          End Workout
        </Button>
      </div>
    </div>
  );
};

export default ExecuteWorkout;
