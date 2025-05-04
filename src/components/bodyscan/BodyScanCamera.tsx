
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import useCameraCapture from '@/hooks/useCameraCapture';

interface BodyScanCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCapture: () => void;
  instructions: string;
  muscleGroup?: string;
}

const BodyScanCamera: React.FC<BodyScanCameraProps> = ({ 
  videoRef, 
  canvasRef, 
  onCapture, 
  instructions,
  muscleGroup
}) => {
  const [error, setError] = useState<string | null>(null);
  const { captureImage, startCamera, stopCamera, cameraReady } = useCameraCapture({ videoRef, canvasRef });
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Starte die Kamera beim Mounten der Komponente
  useEffect(() => {
    const initCamera = async () => {
      try {
        setError(null);
        const success = await startCamera();
        if (!success) {
          setError('Kamera konnte nicht initialisiert werden.');
        }
      } catch (err) {
        console.error('Error initializing camera:', err);
        setError('Fehler beim Initialisieren der Kamera. Bitte erlaube den Zugriff und lade die Seite neu.');
      }
    };
    
    initCamera();
    
    // Cleanup-Funktion zum Stoppen der Kamera beim Unmounten
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);
  
  const handleRestartCamera = async () => {
    stopCamera();
    setError(null);
    setTimeout(async () => {
      const success = await startCamera();
      if (!success) {
        setError('Kamera konnte nicht neu gestartet werden.');
      }
    }, 300);
  };
  
  const handleCapture = () => {
    if (isCapturing) return; // Verhindere mehrfaches Klicken
    
    try {
      setIsCapturing(true);
      setError(null);
      
      const imageData = captureImage();
      if (imageData) {
        onCapture();
      } else {
        setError('Fehler beim Erfassen des Bildes. Ist die Kamera bereit?');
      }
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsCapturing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={handleRestartCamera}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Kamera neustarten
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="aspect-[3/4] bg-black rounded-lg overflow-hidden relative">
        {muscleGroup && (
          <div className="absolute top-2 left-2 bg-primary/80 text-primary-foreground px-3 py-1 rounded-full text-sm capitalize z-10">
            {muscleGroup}
          </div>
        )}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Video error:', e);
            setError('Fehler beim Laden des Videostreams.');
          }}
        />
        
        {/* Silhouette-Guide als Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[60%] h-[80%] border-2 border-dashed border-white/40 rounded-full opacity-40"></div>
        </div>
        
        {!cameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Kamera wird initialisiert...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">{instructions}</p>
        <Button 
          onClick={handleCapture}
          size="lg"
          className="min-w-[200px]"
          disabled={!cameraReady || isCapturing}
        >
          {isCapturing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Verarbeite...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-5 w-5" />
              Aufnehmen
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BodyScanCamera;
