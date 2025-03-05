
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';
import { useAudioAnalysis } from '@/hooks/useAudioAnalysis';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { calculateMaxWeight } from '@/utils/rankingUtils';

// Components
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutProgress from '@/components/workout/WorkoutProgress';
import ExerciseDisplay from '@/components/workout/ExerciseDisplay';
import WorkoutControls from '@/components/workout/WorkoutControls';
import WorkoutCompletion from '@/components/workout/WorkoutCompletion';

// Exercise states
enum ExerciseState {
  ACTIVE = 'active',
  REST = 'rest',
  TRANSITION = 'transition'
}

const ExecuteWorkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeWorkout, workouts, history } = useUser();
  
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [exerciseState, setExerciseState] = useState<ExerciseState>(ExerciseState.ACTIVE);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [caloriesBurned, setCaloriesBurned] = useState<number | null>(null);
  const [oxygenSaturation, setOxygenSaturation] = useState<number | null>(null);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [localStruggleDetected, setLocalStruggleDetected] = useState(false);
  const [maxWeights, setMaxWeights] = useState<Record<string, number>>({});
  
  // Get the workout based on ID
  const workout = workouts.find(w => w.id === id) || {
    id: id || '1',
    name: 'Full Body Workout',
    type: 'manual' as const,
    exercises: [
      { id: 'ex1', name: 'Warm Up', duration: 600, restBetweenSets: 60, sets: 1, reps: 1, equipment: 'none' },
      { id: 'ex2', name: 'Push-ups', sets: 3, reps: 10, restBetweenSets: 60, equipment: 'none' },
      { id: 'ex3', name: 'Squats', sets: 3, reps: 15, restBetweenSets: 60, equipment: 'none' },
      { id: 'ex4', name: 'Plank', duration: 60, sets: 3, reps: 1, restBetweenSets: 30, equipment: 'none' },
    ],
    createdAt: new Date().toISOString(),
    completed: false
  };
  
  const currentEx = workout.exercises[currentExercise];
  
  // Initialize max weights from workout history
  useEffect(() => {
    // Extract all exercises from completed workouts
    const allExercises = workouts
      .filter(w => w.completed)
      .flatMap(w => w.exercises);
    
    // Calculate max weight for each exercise
    const exerciseWeights: Record<string, number> = {};
    
    allExercises.forEach(exercise => {
      if (exercise.weight && exercise.weight > 0) {
        const existingMax = exerciseWeights[exercise.name] || 0;
        if (exercise.weight > existingMax) {
          exerciseWeights[exercise.name] = exercise.weight;
        }
      }
    });
    
    setMaxWeights(exerciseWeights);
  }, [workouts]);
  
  // Use the audio analysis hook
  const { struggleDetected, stopAudioAnalysis } = useAudioAnalysis({
    isRecording,
    onStruggleDetected: () => setLocalStruggleDetected(true),
    onStruggleResolved: () => setLocalStruggleDetected(false)
  });
  
  // Use the workout timer hook for exercise timers
  const { formattedTime } = useWorkoutTimer({
    duration: exerciseState === ExerciseState.ACTIVE ? currentEx.duration : undefined,
    isPaused,
    onComplete: handleExerciseComplete
  });
  
  // Rest timer
  useEffect(() => {
    let timer: number;
    
    if (exerciseState === ExerciseState.REST && restTimeRemaining > 0 && !isPaused) {
      timer = window.setInterval(() => {
        setRestTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // End of rest period
            if (currentSet < currentEx.sets) {
              // Move to next set of the same exercise
              setCurrentSet(prev => prev + 1);
              setExerciseState(ExerciseState.ACTIVE);
              return 0;
            } else if (currentExercise < workout.exercises.length - 1) {
              // Move to next exercise with transition period
              setExerciseState(ExerciseState.TRANSITION);
              return 120; // 2 minute transition period between exercises
            } else {
              // End of workout
              handleEndWorkout();
              return 0;
            }
          }
          return newTime;
        });
      }, 1000);
    }
    
    if (exerciseState === ExerciseState.TRANSITION && restTimeRemaining > 0 && !isPaused) {
      timer = window.setInterval(() => {
        setRestTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // End of transition period, move to next exercise
            setCurrentExercise(prev => prev + 1);
            setCurrentSet(1);
            setExerciseState(ExerciseState.ACTIVE);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [exerciseState, restTimeRemaining, isPaused, currentSet, currentEx.sets, currentExercise, workout.exercises.length]);
  
  // Main timer for tracking total workout time
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused]);
  
  // Function to handle completing a timed exercise
  function handleExerciseComplete() {
    if (exerciseState === ExerciseState.ACTIVE) {
      if (currentEx.duration) {
        // For timed exercises
        if (currentSet < currentEx.sets) {
          // Move to rest period before next set
          setExerciseState(ExerciseState.REST);
          setRestTimeRemaining(currentEx.restBetweenSets);
        } else if (currentExercise < workout.exercises.length - 1) {
          // Move to transition period before next exercise
          setExerciseState(ExerciseState.TRANSITION);
          setRestTimeRemaining(120); // 2 minute transition
        } else {
          // End of workout
          handleEndWorkout();
        }
      }
    }
  }
  
  // Function to handle completing a set (non-timed exercise)
  function handleCompleteSet() {
    if (exerciseState === ExerciseState.ACTIVE) {
      if (currentSet < currentEx.sets) {
        // Move to rest period before next set
        setExerciseState(ExerciseState.REST);
        setRestTimeRemaining(currentEx.restBetweenSets);
      } else if (currentExercise < workout.exercises.length - 1) {
        // Move to transition period before next exercise
        setExerciseState(ExerciseState.TRANSITION);
        setRestTimeRemaining(120); // 2 minute transition
      } else {
        // End of workout
        handleEndWorkout();
      }
    }
  }
  
  function handleSkip() {
    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setCurrentSet(1);
      setExerciseState(ExerciseState.ACTIVE);
      setLocalStruggleDetected(false);
    } else {
      handleEndWorkout();
    }
  }
  
  function handleEndWorkout() {
    stopAudioAnalysis();
    setShowCompletionForm(true);
  }
  
  function handleTogglePause() {
    setIsPaused(prev => !prev);
  }
  
  function handleToggleRecording() {
    setIsRecording(prev => !prev);
  }
  
  const handleFinishWorkout = async () => {
    // Default calculated values if user doesn't input them
    const calculatedCalories = caloriesBurned || Math.round(timeElapsed / 60 * 5);
    const calculatedHeartRate = heartRate || 120;
    const calculatedOxygen = oxygenSaturation || 98;
    
    try {
      await completeWorkout(workout.id, {
        duration: timeElapsed,
        caloriesBurned: calculatedCalories,
        heartRate: calculatedHeartRate,
        oxygenSaturation: calculatedOxygen,
        performance: struggleDetected ? 65 : 85 // Lower performance if struggle detected
      });
      
      toast({
        title: "Workout completed!",
        description: "Your workout has been saved successfully",
      });
      
      navigate('/home');
    } catch (error) {
      console.error("Error completing workout:", error);
      toast({
        title: "Error",
        description: "Failed to save workout data",
        variant: "destructive",
      });
    }
  };
  
  if (showCompletionForm) {
    return (
      <WorkoutCompletion
        timeElapsed={timeElapsed}
        heartRate={heartRate}
        caloriesBurned={caloriesBurned}
        oxygenSaturation={oxygenSaturation}
        onHeartRateChange={setHeartRate}
        onCaloriesBurnedChange={setCaloriesBurned}
        onOxygenSaturationChange={setOxygenSaturation}
        onSaveWorkout={handleFinishWorkout}
      />
    );
  }
  
  // Determine the current display
  const renderExerciseOrRest = () => {
    if (exerciseState === ExerciseState.REST || exerciseState === ExerciseState.TRANSITION) {
      // Display rest countdown
      const isTransition = exerciseState === ExerciseState.TRANSITION;
      const nextExerciseName = isTransition && currentExercise < workout.exercises.length - 1 
        ? workout.exercises[currentExercise + 1].name 
        : null;
      
      return (
        <div className="flex-1 flex flex-col items-center justify-center my-8">
          <div className="flex flex-col items-center glass p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2">
              {isTransition ? "Transition Rest" : "Rest"}
            </h2>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-mono font-bold mb-2">
                {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-sm text-muted-foreground">
                {isTransition 
                  ? `Get ready for: ${nextExerciseName}` 
                  : `Prepare for set ${currentSet + 1} of ${currentEx.sets}`
                }
              </p>
              
              <Button 
                onClick={handleTogglePause}
                className="mt-4"
                variant={isPaused ? "default" : "secondary"}
              >
                {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            </div>
          </div>
        </div>
      );
    } else {
      // Display the active exercise
      return (
        <ExerciseDisplay
          exercise={currentEx}
          formattedTime={formattedTime}
          isPaused={isPaused}
          struggleDetected={localStruggleDetected}
          onTogglePause={handleTogglePause}
          onCompleteSet={handleCompleteSet}
          maxWeight={maxWeights[currentEx.name] || null}
        />
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <WorkoutHeader
        workoutName={workout.name}
        isRecording={isRecording}
        onBack={() => navigate('/home')}
        onToggleRecording={handleToggleRecording}
      />
      
      <WorkoutProgress
        currentExercise={currentExercise}
        totalExercises={workout.exercises.length}
        timeElapsed={timeElapsed}
      />
      
      {renderExerciseOrRest()}
      
      <WorkoutControls
        onSkip={handleSkip}
        onEndWorkout={handleEndWorkout}
      />
    </div>
  );
};

export default ExecuteWorkout;
