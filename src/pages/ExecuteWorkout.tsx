import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, SkipForward, StopCircle, Mic, MicOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';

const ExecuteWorkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeWorkout, workouts } = useUser();
  
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [struggleDetected, setStruggleDetected] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [caloriesBurned, setCaloriesBurned] = useState<number | null>(null);
  const [oxygenSaturation, setOxygenSaturation] = useState<number | null>(null);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  
  // Audio analysis state
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  
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
  
  // Initialize exercise timer when current exercise changes
  useEffect(() => {
    if (currentEx && currentEx.duration) {
      setExerciseTimer(currentEx.duration);
    }
  }, [currentExercise, currentEx]);
  
  // Main timer for tracking total workout time
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused]);
  
  // Exercise countdown timer
  useEffect(() => {
    let intervalId: number;
    
    if (currentEx && currentEx.duration && exerciseTimer > 0 && !isPaused) {
      intervalId = window.setInterval(() => {
        setExerciseTimer(prevTime => {
          const newTime = prevTime - 1;
          
          // If timer reaches zero, move to next exercise or rest period
          if (newTime <= 0) {
            handleSkip();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [exerciseTimer, isPaused, currentEx]);
  
  // Setup audio context and analyzer for detecting struggle
  useEffect(() => {
    if (isRecording) {
      startAudioAnalysis();
    } else {
      stopAudioAnalysis();
    }
    
    return () => {
      stopAudioAnalysis();
    };
  }, [isRecording]);
  
  const startAudioAnalysis = async () => {
    try {
      // Request microphone access
      micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context and analyzer
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      
      const microphone = audioContext.current.createMediaStreamSource(micStream.current);
      microphone.connect(analyser.current);
      
      // Create media recorder
      mediaRecorder.current = new MediaRecorder(micStream.current);
      mediaRecorder.current.start();
      
      // Set up analysis interval
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const analyzeAudio = () => {
        if (!analyser.current || !isRecording) return;
        
        analyser.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Detect struggle based on volume threshold
        // Higher volume might indicate struggle or strain
        if (average > 150) {
          if (!struggleDetected) {
            setStruggleDetected(true);
            toast({
              title: "Potential struggle detected",
              description: "Consider reducing intensity or taking a break",
              variant: "destructive",
            });
          }
        } else {
          setStruggleDetected(false);
        }
        
        if (isRecording) {
          requestAnimationFrame(analyzeAudio);
        }
      };
      
      analyzeAudio();
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Audio analysis will not be available for this workout",
        variant: "destructive",
      });
    }
  };
  
  const stopAudioAnalysis = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    
    if (micStream.current) {
      micStream.current.getTracks().forEach(track => track.stop());
      micStream.current = null;
    }
    
    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close();
    }
    
    analyser.current = null;
    audioContext.current = null;
  };
  
  const handleSkip = () => {
    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setStruggleDetected(false);
    }
  };
  
  const handleEndWorkout = () => {
    stopAudioAnalysis();
    setShowCompletionForm(true);
  };
  
  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  const handleToggleRecording = () => {
    setIsRecording(prev => !prev);
  };
  
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
  
  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = (currentExercise / workout.exercises.length) * 100;
  
  if (showCompletionForm) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col">
        <div className="flex items-center mb-6">
          <h1 className="text-xl font-bold">Workout Complete!</h1>
        </div>
        
        <div className="glass rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Enter Your Stats</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                className="w-full p-2 rounded-md bg-background border border-border"
                placeholder="120"
                min="40"
                max="220"
                value={heartRate || ''}
                onChange={(e) => setHeartRate(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Calories Burned
              </label>
              <input
                type="number"
                className="w-full p-2 rounded-md bg-background border border-border"
                placeholder={`${Math.round(timeElapsed / 60 * 5)}`}
                min="0"
                value={caloriesBurned || ''}
                onChange={(e) => setCaloriesBurned(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Oxygen Saturation (%)
              </label>
              <input
                type="number"
                className="w-full p-2 rounded-md bg-background border border-border"
                placeholder="98"
                min="80"
                max="100"
                value={oxygenSaturation || ''}
                onChange={(e) => setOxygenSaturation(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              className="w-full"
              onClick={handleFinishWorkout}
            >
              Save Workout
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
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
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleRecording}
          className="ml-auto"
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
        </Button>
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
          {currentEx.videoUrl ? (
            <video 
              src={currentEx.videoUrl} 
              className="w-full h-full object-cover rounded-lg"
              autoPlay 
              loop 
              muted 
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="text-muted-foreground mb-2">Exercise Demonstration</p>
              <p className="text-sm text-muted-foreground">{currentEx.name}</p>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-2">{currentEx.name}</h2>
        
        {currentEx.duration ? (
          <p className="text-xl mb-4">
            {formatTime(exerciseTimer)}
          </p>
        ) : (
          <p className="text-xl mb-4">{currentEx.sets} sets × {currentEx.reps} reps</p>
        )}
        
        {struggleDetected && (
          <div className="mb-4 p-3 bg-destructive/20 text-destructive rounded-md text-center">
            <p>Increased effort detected. Consider reducing intensity.</p>
          </div>
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
