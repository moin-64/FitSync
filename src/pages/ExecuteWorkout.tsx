
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';
import { useAudioAnalysis } from '@/hooks/useAudioAnalysis';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';

// Components
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutProgress from '@/components/workout/WorkoutProgress';
import ExerciseDisplay from '@/components/workout/ExerciseDisplay';
import WorkoutControls from '@/components/workout/WorkoutControls';
import WorkoutCompletion from '@/components/workout/WorkoutCompletion';

const ExecuteWorkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeWorkout, workouts } = useUser();
  
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [caloriesBurned, setCaloriesBurned] = useState<number | null>(null);
  const [oxygenSaturation, setOxygenSaturation] = useState<number | null>(null);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [localStruggleDetected, setLocalStruggleDetected] = useState(false);
  
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
  
  // Use the audio analysis hook
  const { struggleDetected, stopAudioAnalysis } = useAudioAnalysis({
    isRecording,
    onStruggleDetected: () => setLocalStruggleDetected(true),
    onStruggleResolved: () => setLocalStruggleDetected(false)
  });
  
  // Use the workout timer hook for exercise timers
  const { formattedTime } = useWorkoutTimer({
    duration: currentEx.duration,
    isPaused,
    onComplete: handleSkip
  });
  
  // Main timer for tracking total workout time
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused]);
  
  function handleSkip() {
    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setLocalStruggleDetected(false);
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
      
      <ExerciseDisplay
        exercise={currentEx}
        formattedTime={formattedTime}
        isPaused={isPaused}
        struggleDetected={localStruggleDetected}
        onTogglePause={handleTogglePause}
      />
      
      <WorkoutControls
        onSkip={handleSkip}
        onEndWorkout={handleEndWorkout}
      />
    </div>
  );
};

export default ExecuteWorkout;
