
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2 } from 'lucide-react';

interface BodyScanCameraProps {
  onScanComplete: () => void;
}

const BodyScanCamera: React.FC<BodyScanCameraProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Start scanning process
  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
  };
  
  // Simulate scan progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning && scanProgress < 100) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + 5;
          return newProgress;
        });
      }, 150);
    }
    
    if (scanProgress >= 100) {
      setTimeout(() => {
        setIsScanning(false);
        onScanComplete();
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, scanProgress, onScanComplete]);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-black/10 rounded-lg mb-4 overflow-hidden">
        {isScanning ? (
          <>
            {/* Scanning animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full relative">
                {/* Scanner line animation */}
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
                  {scanProgress < 100 ? `Scanning... ${scanProgress}%` : 'Scan Complete!'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Camera className="w-12 h-12 mb-2 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Camera ready for body scan
            </p>
          </div>
        )}
      </div>
      
      {!isScanning ? (
        <Button 
          onClick={handleStartScan} 
          className="w-full"
          disabled={isScanning}
        >
          <Camera className="mr-2 h-4 w-4" />
          Begin Scan
        </Button>
      ) : (
        <div className="w-full bg-muted rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${scanProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default BodyScanCamera;
