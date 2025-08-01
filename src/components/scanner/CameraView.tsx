
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X, RefreshCw } from 'lucide-react';
import useCameraCapture from '@/hooks/useCameraCapture';
import { useToast } from '@/hooks/use-toast';

interface CameraViewProps {
  onCancel: () => void;
  onCapture: (imageData: string | null) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCancel, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { captureImage, startCamera, stopCamera, cameraReady } = useCameraCapture({
    videoRef,
    canvasRef
  });
  
  // Optimized camera initialization with retry mechanism
  const initCamera = useCallback(async () => {
    try {
      setIsRetrying(true);
      const result = await startCamera();
      if (!result) {
        setError("Die Kamera konnte nicht gestartet werden.");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Kamerafehler:", err);
      setError("Fehler beim Zugriff auf die Kamera. Bitte überprüfe deine Berechtigungen.");
    } finally {
      setIsRetrying(false);
    }
  }, [startCamera]);
  
  // Initial camera setup
  useEffect(() => {
    initCamera();
    
    // Cleanup
    return () => {
      stopCamera();
    };
  }, [initCamera, stopCamera]);
  
  // Optimized capture handling
  const handleCapture = useCallback(() => {
    try {
      // Use performance.now to measure capture time
      const startTime = performance.now();
      
      const imageData = captureImage();
      
      const endTime = performance.now();
      console.log(`Image capture took ${endTime - startTime}ms`);
      
      if (imageData) {
        onCapture(imageData);
      } else {
        toast({
          title: "Fehler beim Scannen",
          description: "Bild konnte nicht aufgenommen werden. Bitte versuche es erneut.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Fehler beim Aufnehmen des Bildes:", err);
      toast({
        title: "Fehler beim Scannen",
        description: "Es ist ein Fehler beim Aufnehmen des Bildes aufgetreten.",
        variant: "destructive"
      });
    }
  }, [captureImage, onCapture, toast]);
  
  const handleRetry = useCallback(async () => {
    setError(null);
    await stopCamera();
    
    // Add a small delay between stopping and starting to ensure hardware has time to reset
    setTimeout(() => {
      initCamera();
    }, 300);
  }, [stopCamera, initCamera]);
  
  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden relative">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-center p-4">
            <div className="text-destructive mb-2">
              <X size={40} className="mx-auto mb-2" />
              <p>{error}</p>
            </div>
            <Button 
              onClick={handleRetry} 
              className="mt-4" 
              variant="outline"
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
                  Versuche erneut...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> 
                  Erneut versuchen
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Hidden canvas for capturing images */}
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button 
          onClick={handleCapture} 
          disabled={!cameraReady || !!error}
          className="bg-primary hover:bg-primary/90 transition-all"
        >
          <Camera className="mr-2 h-4 w-4" />
          Jetzt scannen
        </Button>
      </div>
    </div>
  );
};

export default React.memo(CameraView);
