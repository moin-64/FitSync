
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, CheckCircle2, Play, Pause, RefreshCw } from 'lucide-react';
import useCameraCapture from '@/hooks/useCameraCapture';
import { useToast } from '@/hooks/use-toast';

interface BodyScan360Props {
  onScanComplete: (images: string[]) => void;
  scanType: 'full-body' | 'muscle-group';
  muscleGroup?: string;
  isProcessing?: boolean;
}

const BodyScan360: React.FC<BodyScan360Props> = ({ 
  onScanComplete, 
  scanType,
  muscleGroup,
  isProcessing = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const [isScanning, setIsScanning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Capture every 45 degrees for 8 total images (360°/45° = 8)
  const totalAngles = 8;
  const angleStep = 360 / totalAngles;
  
  const { captureImage, startCamera, stopCamera, cameraReady } = useCameraCapture({
    videoRef,
    canvasRef
  });
  
  useEffect(() => {
    startCamera({
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    });
    
    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCamera, stopCamera]);
  
  const handleStartScan = useCallback(() => {
    if (!cameraReady) return;
    
    setIsScanning(true);
    setCurrentAngle(0);
    setCapturedImages([]);
    setScanProgress(0);
    setIsPaused(false);
    
    // Start automatic capture every 3 seconds
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        captureCurrentAngle();
      }
    }, 3000);
    
    // Capture first image immediately
    setTimeout(() => captureCurrentAngle(), 500);
  }, [cameraReady, isPaused]);
  
  const captureCurrentAngle = useCallback(() => {
    const imageData = captureImage();
    if (imageData) {
      setCapturedImages(prev => [...prev, imageData]);
      
      const nextAngle = currentAngle + angleStep;
      const progress = ((currentAngle / angleStep) + 1) / totalAngles * 100;
      
      setScanProgress(progress);
      
      if (nextAngle >= 360) {
        // Scan complete
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsScanning(false);
        
        // Include the last captured image
        const allImages = [...capturedImages, imageData];
        setTimeout(() => {
          onScanComplete(allImages);
        }, 1000);
        
        toast({
          title: "360° Scan Complete!",
          description: `Captured ${allImages.length} angles successfully.`,
        });
      } else {
        setCurrentAngle(nextAngle);
      }
    }
  }, [captureImage, currentAngle, angleStep, capturedImages, onScanComplete, toast]);
  
  const handlePauseScan = () => {
    setIsPaused(!isPaused);
  };
  
  const handleResetScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
    setCurrentAngle(0);
    setCapturedImages([]);
    setScanProgress(0);
    setIsPaused(false);
  };
  
  const getCurrentAngleLabel = () => {
    const angleLabels = [
      'Front', 'Front-Right', 'Right', 'Back-Right',
      'Back', 'Back-Left', 'Left', 'Front-Left'
    ];
    const index = Math.floor(currentAngle / angleStep);
    return angleLabels[index] || 'Front';
  };
  
  const getInstructions = () => {
    if (scanType === 'full-body') {
      return `Stand in the center and slowly rotate clockwise. Currently capturing: ${getCurrentAngleLabel()}`;
    } else {
      const muscleNames = {
        'chest': 'Brust',
        'back': 'Rücken', 
        'shoulders': 'Schultern',
        'arms': 'Arme',
        'abs': 'Bauchmuskeln',
        'legs': 'Beine'
      };
      const muscleName = muscleNames[muscleGroup as keyof typeof muscleNames] || muscleGroup;
      return `Focus on ${muscleName} - rotate slowly clockwise. Currently: ${getCurrentAngleLabel()}`;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden relative">
        {cameraReady ? (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Scan overlay */}
            {isScanning && (
              <div className="absolute inset-0">
                {/* Progress ring */}
                <div className="absolute top-4 right-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - scanProgress / 100)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {Math.round(scanProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Angle indicator */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                  <div className="text-sm font-medium">{getCurrentAngleLabel()}</div>
                  <div className="text-xs opacity-80">{currentAngle}°</div>
                </div>
                
                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 border-2 border-white rounded-full opacity-60">
                    <div className="w-full h-full border-2 border-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Pause indicator */}
                {isPaused && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white/90 text-black px-4 py-2 rounded-lg font-medium">
                      PAUSED
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Captured images count */}
            {capturedImages.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                <div className="text-sm">
                  Captured: {capturedImages.length}/{totalAngles}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {getInstructions()}
        </p>
        
        {isScanning && (
          <p className="text-xs text-muted-foreground">
            Next capture in {isPaused ? '∞' : '3'} seconds
          </p>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-3">
        {!isScanning ? (
          <Button 
            onClick={handleStartScan}
            disabled={!cameraReady || isProcessing}
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            Start 360° Scan
          </Button>
        ) : (
          <>
            <Button 
              variant="outline"
              onClick={handlePauseScan}
              disabled={isProcessing}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleResetScan}
              disabled={isProcessing}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {/* Progress bar */}
      {isScanning && (
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500" 
            style={{ width: `${scanProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default BodyScan360;
