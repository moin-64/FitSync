
import { useCallback, useState, useEffect } from 'react';

interface UseCameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useCameraCapture = ({ videoRef, canvasRef }: UseCameraCaptureProps) => {
  const [cameraReady, setCameraReady] = useState(false);
  
  // Funktion zum Starten der Kamera
  const startCamera = useCallback(async (constraints = { 
    facingMode: 'environment', 
    width: { ideal: 1280 }, 
    height: { ideal: 720 } 
  }) => {
    try {
      if (!videoRef.current) return false;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints
      });
      
      videoRef.current.srcObject = stream;
      setCameraReady(true);
      return true;
    } catch (err) {
      console.error('Error starting camera:', err);
      setCameraReady(false);
      return false;
    }
  }, [videoRef]);
  
  // Funktion zum Stoppen der Kamera
  const stopCamera = useCallback(() => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
      setCameraReady(false);
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
  }, [videoRef]);
  
  // Optimierte Funktion zum Erfassen eines Bildes
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return null;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return null;
      
      // Prüfen, ob das Video bereit ist
      if (video.readyState !== 4) {
        console.warn('Video is not ready yet');
        return null;
      }
      
      // Setze Canvas-Dimensionen passend zum Video mit Fallback-Werten
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Zeichne Videoframe auf Canvas mit Error Handling
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Konvertiere zu Base64 Data URL mit geringerer Qualität für bessere Performance
        return canvas.toDataURL('image/jpeg', 0.7);
      } catch (drawError) {
        console.error('Error drawing video to canvas:', drawError);
        return null;
      }
    } catch (err) {
      console.error('Error in captureImage:', err);
      return null;
    }
  }, [videoRef, canvasRef, cameraReady]);
  
  // Automatisches Bereinigen der Ressourcen
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef]);
  
  return { captureImage, startCamera, stopCamera, cameraReady };
};

export default useCameraCapture;
