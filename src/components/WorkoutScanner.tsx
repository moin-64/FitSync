
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';

// Import the refactored components
import ScannerModal from './scanner/ScannerModal';
import ScannerIntro from './scanner/ScannerIntro';
import CameraView from './scanner/CameraView';
import ScanningResults from './scanner/ScanningResults';

// Import utility functions
import { 
  analyzeWorkoutPlanFromImage, 
  addEquipmentChangeRests, 
  addWarmupExercise 
} from '@/utils/scannerUtils';

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
  
  const analyzeWorkoutPlan = async (imageData: string) => {
    setScanned(true);
    setAnalyzing(true);
    setError(null);
    
    try {
      // Get parsed exercises from image
      const parsedExercises = await analyzeWorkoutPlanFromImage(imageData);
      
      // Add rest periods between equipment changes
      const exercisesWithRest = addEquipmentChangeRests(parsedExercises);
      
      // Add a warmup exercise at the beginning
      const completeWorkout = addWarmupExercise(exercisesWithRest);
      
      const scannedWorkout = {
        name: 'Scanned Workout Plan',
        type: 'scanned' as const,
        exercises: completeWorkout,
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
  
  // Helper to reset and try again
  const handleRetry = () => {
    setScanned(false);
    setScanning(true);
    setError(null);
    setResult(null);
  };
  
  return (
    <ScannerModal title="Scan Workout Plan" onClose={onClose}>
      {!scanning && !scanned ? (
        <ScannerIntro onStartScan={() => setScanning(true)} />
      ) : scanning && !scanned ? (
        <CameraView 
          onCancel={() => setScanning(false)} 
          onCapture={captureImage} 
        />
      ) : (
        <ScanningResults
          analyzing={analyzing}
          result={result}
          error={error}
          onRetry={handleRetry}
        />
      )}
    </ScannerModal>
  );
};

export default WorkoutScanner;
