
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, FlipHorizontal, RefreshCw } from 'lucide-react';
import useCameraCapture from '@/hooks/useCameraCapture';

interface BodyScanCameraProps {
  onScanComplete: (imageData: string | null) => void;
  instructions?: string;
  muscleGroup?: string;
  isProcessing?: boolean;
}

const BodyScanCamera: React.FC<BodyScanCameraProps> = ({ 
  onScanComplete, 
  instructions = "Positioniere dich im Bild für den Scan",
  muscleGroup,
  isProcessing = false
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Verwende den optimierten Camera-Hook
  const { captureImage, startCamera, stopCamera, cameraReady } = useCameraCapture({ 
    videoRef, 
    canvasRef 
  });
  
  // Kamera starten, wenn die Komponente geladen wird
  useEffect(() => {
    const initCamera = async () => {
      await startCamera({ 
        facingMode: cameraFacing,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      });
    };
    
    initCamera();
    
    // Kamera stoppen, wenn die Komponente entfernt wird
    return () => {
      stopCamera();
    };
  }, [cameraFacing, startCamera, stopCamera]);
  
  // Kamera umschalten zwischen Vorder- und Rückseite
  const toggleCamera = async () => {
    stopCamera();
    setCameraFacing(cameraFacing === 'environment' ? 'user' : 'environment');
  };
  
  // Scan starten
  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
  };
  
  // Scan-Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning && scanProgress < 100) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + 3;
          return newProgress;
        });
      }, 100);
    }
    
    if (scanProgress >= 100) {
      const imageData = captureImage();
      setTimeout(() => {
        setScanCompleted(true);
        setTimeout(() => {
          setIsScanning(false);
          onScanComplete(imageData);
        }, 800);
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, scanProgress, onScanComplete, captureImage]);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-black/10 rounded-lg mb-4 overflow-hidden">
        {/* Video-Element für die Kamera */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover ${isScanning ? 'opacity-80' : ''}`}
        />
        
        {isScanning ? (
          <>
            {/* Scan-Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full relative">
                {/* Scanner-Linien-Animation */}
                <div 
                  className="absolute left-0 right-0 h-1 bg-primary"
                  style={{ top: `${scanProgress}%`, boxShadow: '0px 0px 8px rgba(var(--primary), 0.8)' }}
                ></div>
                
                {scanProgress >= 100 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-background/80 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">
                  {scanProgress < 100 ? `Scanning... ${Math.floor(scanProgress)}%` : 'Scan Complete!'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            {cameraReady ? (
              <>
                <Camera className="w-12 h-12 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {instructions}
                </p>
                {muscleGroup && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mt-1">
                    {muscleGroup === 'chest' ? 'Brust' : 
                     muscleGroup === 'back' ? 'Rücken' : 
                     muscleGroup === 'shoulders' ? 'Schultern' : 
                     muscleGroup === 'arms' ? 'Arme' : 
                     muscleGroup === 'abs' ? 'Bauchmuskeln' : 
                     muscleGroup === 'legs' ? 'Beine' : 
                     muscleGroup}
                  </div>
                )}
              </>
            ) : (
              <>
                <RefreshCw className="w-8 h-8 mb-2 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Kamera wird initialisiert...
                </p>
              </>
            )}
          </div>
        )}
        
        {/* Kamera-Umschalt-Button */}
        {!isScanning && cameraReady && (
          <Button 
            size="icon" 
            variant="secondary" 
            className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-80"
            onClick={toggleCamera}
            disabled={isProcessing}
          >
            <FlipHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {!isScanning ? (
        <Button 
          onClick={handleStartScan} 
          className="w-full"
          disabled={isScanning || !cameraReady || isProcessing}
        >
          <Camera className="mr-2 h-4 w-4" />
          Scan starten
        </Button>
      ) : (
        <div className="w-full bg-muted rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${scanProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default BodyScanCamera;
