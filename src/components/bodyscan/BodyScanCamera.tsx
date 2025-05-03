
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X } from 'lucide-react';
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);
  
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Kamerazugriff nicht möglich. Bitte erlaube den Zugriff auf deine Kamera und lade die Seite neu.');
      setIsCameraActive(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };
  
  const { captureImage } = useCameraCapture({ videoRef, canvasRef });
  
  const handleCapture = () => {
    const imageData = captureImage();
    if (imageData) {
      onCapture();
    } else {
      setError('Fehler beim Erfassen des Bildes. Bitte versuche es erneut.');
    }
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
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
          className="w-full h-full object-cover"
        />
        
        {/* Overlay with silhouette guide */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[60%] h-[80%] border-2 border-dashed border-white/40 rounded-full opacity-40"></div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">{instructions}</p>
        <Button 
          onClick={handleCapture}
          size="lg"
          className="min-w-[200px]"
          disabled={!isCameraActive}
        >
          <Camera className="mr-2 h-5 w-5" />
          Aufnehmen
        </Button>
      </div>
    </div>
  );
};

export default BodyScanCamera;
