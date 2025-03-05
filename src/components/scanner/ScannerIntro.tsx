
import React from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from 'lucide-react';

interface ScannerIntroProps {
  onStartScan: () => void;
}

const ScannerIntro: React.FC<ScannerIntroProps> = ({ onStartScan }) => {
  return (
    <div className="text-center py-8">
      <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="mb-6 text-muted-foreground">
        Position your printed workout plan in front of the camera to scan it.
      </p>
      <Button onClick={onStartScan}>
        Open Camera
      </Button>
    </div>
  );
};

export default ScannerIntro;
