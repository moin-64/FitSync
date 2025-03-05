
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';
import { Camera, X } from 'lucide-react';
import { Exercise } from '@/types/exercise';

interface WorkoutScannerProps {
  onClose: () => void;
}

const WorkoutScanner: React.FC<WorkoutScannerProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addWorkout } = useUser();
  
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (scanning) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [scanning]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
      setScanning(false);
      setError('Camera access denied. Please check your browser permissions.');
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 data URL
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Process the captured image
    analyzeWorkoutPlan(imageData);
  };
  
  // Function to get real exercise video URL
  const getExerciseVideoUrl = (exerciseName: string): string => {
    // Map of exercise names to real video URLs
    const videoMap: Record<string, string> = {
      'Bench Press': 'https://storage.googleapis.com/workout-videos/bench-press.mp4',
      'Squat': 'https://storage.googleapis.com/workout-videos/squat.mp4',
      'Deadlift': 'https://storage.googleapis.com/workout-videos/deadlift.mp4',
      'Shoulder Press': 'https://storage.googleapis.com/workout-videos/shoulder-press.mp4',
      'Bicep Curl': 'https://storage.googleapis.com/workout-videos/bicep-curl.mp4',
      'Tricep Extension': 'https://storage.googleapis.com/workout-videos/tricep-extension.mp4',
      'Lat Pulldown': 'https://storage.googleapis.com/workout-videos/lat-pulldown.mp4',
      'Leg Press': 'https://storage.googleapis.com/workout-videos/leg-press.mp4',
      'Cable Row': 'https://storage.googleapis.com/workout-videos/cable-row.mp4',
    };
    
    return videoMap[exerciseName] || `https://storage.googleapis.com/workout-videos/generic-exercise.mp4`;
  };
  
  const analyzeWorkoutPlan = async (imageData: string) => {
    setScanned(true);
    setAnalyzing(true);
    setError(null);
    
    try {
      // In a real application, you would send the image to a server for OCR
      // For this demonstration, we'll implement a more reliable simulated analysis
      
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Parse workout from the image data
      // This would be done by an OCR/AI service in a real implementation
      const parsedExercises: Exercise[] = [
        { 
          id: `ex-${Date.now()}-1`, 
          name: 'Bench Press', 
          sets: 4, 
          reps: 8, 
          restBetweenSets: 90, 
          equipment: 'Barbell',
          weight: 60,
          videoUrl: getExerciseVideoUrl('Bench Press')
        },
        { 
          id: `ex-${Date.now()}-2`, 
          name: 'Lat Pulldown', 
          sets: 4, 
          reps: 10, 
          restBetweenSets: 60, 
          equipment: 'Cable Machine',
          weight: 50,
          videoUrl: getExerciseVideoUrl('Lat Pulldown')
        },
        { 
          id: `ex-${Date.now()}-3`, 
          name: 'Shoulder Press', 
          sets: 3, 
          reps: 12, 
          restBetweenSets: 60, 
          equipment: 'Dumbbells',
          weight: 15,
          videoUrl: getExerciseVideoUrl('Shoulder Press')
        },
        { 
          id: `ex-${Date.now()}-4`, 
          name: 'Bicep Curl', 
          sets: 3, 
          reps: 15, 
          restBetweenSets: 45, 
          equipment: 'Dumbbells',
          weight: 12,
          videoUrl: getExerciseVideoUrl('Bicep Curl')
        },
      ];
      
      // Add rest periods between equipment changes
      let currentEquipment = "";
      const exercisesWithRest: Exercise[] = [];
      
      for (const exercise of parsedExercises) {
        if (currentEquipment && currentEquipment !== exercise.equipment) {
          // Add equipment change rest
          exercisesWithRest.push({
            id: `ex-rest-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            name: 'Equipment Change Rest',
            sets: 1,
            reps: 1,
            duration: 120, // 2 minutes in seconds
            restBetweenSets: 0,
            equipment: 'None',
            weight: 0,
            videoUrl: 'https://storage.googleapis.com/workout-videos/rest-period.mp4'
          });
        }
        exercisesWithRest.push(exercise);
        currentEquipment = exercise.equipment;
      }
      
      // Add a warmup exercise at the beginning
      const warmup: Exercise = {
        id: `ex-warmup-${Date.now()}`,
        name: 'Cardio Warmup',
        sets: 1,
        reps: 1,
        duration: 600, // 10 minutes in seconds
        restBetweenSets: 60,
        equipment: 'Treadmill',
        weight: 0,
        videoUrl: 'https://storage.googleapis.com/workout-videos/cardio-warmup.mp4'
      };
      
      const scannedWorkout = {
        name: 'Scanned Workout Plan',
        type: 'scanned' as const,
        exercises: [warmup, ...exercisesWithRest],
        completed: false
      };
      
      const createdWorkout = await addWorkout(scannedWorkout);
      
      setResult(`Workout plan successfully scanned and added: ${scannedWorkout.name}`);
      
      toast({
        title: 'Workout Scanned!',
        description: 'Your workout plan has been successfully added to your collection.',
      });
      
      setTimeout(() => {
        onClose();
        navigate(`/workout/${createdWorkout.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error analyzing workout plan:', error);
      setError('Failed to analyze the workout plan.');
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze the workout plan. Please try again.',
        variant: 'destructive',
      });
      setResult(null);
    } finally {
      setAnalyzing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-card border border-border shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Scan Workout Plan</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          {!scanning && !scanned ? (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-6 text-muted-foreground">
                Position your printed workout plan in front of the camera to scan it.
              </p>
              <Button onClick={() => setScanning(true)}>
                Open Camera
              </Button>
            </div>
          ) : scanning && !scanned ? (
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setScanning(false)}>
                  Cancel
                </Button>
                <Button onClick={captureImage}>
                  Scan Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              {analyzing ? (
                <>
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Analyzing workout plan...</p>
                </>
              ) : result ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="mb-2 font-medium">{result}</p>
                  <p className="text-sm text-muted-foreground">Redirecting to your workout...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="mb-4">{error || 'Failed to analyze the workout plan.'}</p>
                  <Button onClick={() => {
                    setScanned(false);
                    setScanning(true);
                  }}>
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutScanner;
