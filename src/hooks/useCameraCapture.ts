
import { useCallback } from 'react';

interface UseCameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useCameraCapture = ({ videoRef, canvasRef }: UseCameraCaptureProps) => {
  
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return null;
      
      // Setze Canvas-Dimensionen passend zum Video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Fallback, falls videoWidth oder videoHeight 0 sind
      if (canvas.width === 0 || canvas.height === 0) {
        canvas.width = 640;
        canvas.height = 480;
      }
      
      // Zeichne Videoframe auf Canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Konvertiere zu Base64 Data URL
      const imageData = canvas.toDataURL('image/jpeg', 0.8); // Komprimiere für bessere Performance
      return imageData;
    } catch (err) {
      console.error('Error in captureImage:', err);
      return null;
    }
  }, [videoRef, canvasRef]);
  
  return { captureImage };
};

export default useCameraCapture;
