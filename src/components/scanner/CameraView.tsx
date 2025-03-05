
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface CameraViewProps {
  onCancel: () => void;
  onCapture: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCancel, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);
  
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
      onCancel();
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  return (
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
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onCapture}>
          Scan Now
        </Button>
      </div>
    </div>
  );
};

export default CameraView;
