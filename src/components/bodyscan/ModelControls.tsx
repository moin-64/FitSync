
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ModelControlsProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ModelControls = ({ 
  onRotateLeft, 
  onRotateRight, 
  onZoomIn, 
  onZoomOut, 
  onReset 
}: ModelControlsProps) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
      <Button variant="secondary" size="icon" onClick={onRotateLeft}>
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={onZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={onReset}>
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={onZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={onRotateRight}>
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ModelControls;
