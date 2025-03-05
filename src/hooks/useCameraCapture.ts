
import { useRef } from 'react';

interface UseCameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useCameraCapture = ({ videoRef, canvasRef }: UseCameraCaptureProps) => {
  
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 data URL
    const imageData = canvas.toDataURL('image/jpeg');
    return imageData;
  };
  
  return { captureImage };
};

export default useCameraCapture;
