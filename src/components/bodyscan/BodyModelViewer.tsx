
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface BodyModelViewerProps {
  bodyData: any;
  selectedMuscleGroup: string | null;
  onSelectMuscleGroup: (muscleGroup: any) => void;
}

const BodyModelViewer: React.FC<BodyModelViewerProps> = ({ 
  bodyData, 
  selectedMuscleGroup,
  onSelectMuscleGroup 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  
  // Optimierte Muskelgruppenpositionen
  const musclePositions = {
    chest: { top: '30%', left: '50%', width: '40%', height: '15%' },
    back: { top: '30%', left: '50%', width: '40%', height: '15%' },
    shoulders: { top: '25%', left: '50%', width: '50%', height: '10%' },
    arms: { top: '35%', left: '50%', width: '60%', height: '15%' },
    abs: { top: '45%', left: '50%', width: '30%', height: '15%' },
    legs: { top: '65%', left: '50%', width: '45%', height: '25%' }
  };
  
  // Farbberechnung basierend auf Muskelentwicklung
  const getColorForMuscle = useCallback((muscleGroup: string) => {
    if (!bodyData?.muscleGroups?.[muscleGroup]) return 'rgba(125, 125, 125, 0.7)';
    
    const development = bodyData.muscleGroups[muscleGroup].development || 50;
    
    // Farbverlauf basierend auf Muskelentwicklung (rot nach grün)
    if (development < 40) return 'rgba(255, 59, 48, 0.7)'; // Rot für unterentwickelt
    if (development < 60) return 'rgba(255, 204, 0, 0.7)'; // Gelb für durchschnittlich
    return 'rgba(52, 199, 89, 0.7)'; // Grün für gut entwickelt
  }, [bodyData]);
  
  // Transparenz basierend auf Auswahl
  const getMuscleOpacity = useCallback((muscleGroup: string) => {
    if (!selectedMuscleGroup) return 0.7;
    return muscleGroup === selectedMuscleGroup ? 0.9 : 0.3;
  }, [selectedMuscleGroup]);
  
  // Verzögertes Laden simulieren
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Rotationshandler
  const handleRotateLeft = () => {
    setRotation(rotation - 45);
  };
  
  const handleRotateRight = () => {
    setRotation(rotation + 45);
  };
  
  // Zoom-Handler
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };
  
  // Zurücksetzen der Ansicht
  const handleReset = () => {
    setRotation(0);
    setZoom(1);
  };
  
  return (
    <div className="relative">
      {isLoading ? (
        <div className="aspect-[3/4] flex items-center justify-center bg-black/10 rounded-lg">
          <Skeleton className="w-[60%] h-[80%] rounded-full" />
        </div>
      ) : (
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg">
          <div 
            ref={containerRef}
            className="w-full h-full relative transition-transform duration-300 ease-in-out"
            style={{
              transform: `rotateY(${rotation}deg) scale(${zoom})`,
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Basic human model - would be replaced with a real 3D model */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[80%] flex flex-col items-center">
              {/* Head */}
              <div className="w-[40%] aspect-square rounded-full bg-gray-300"></div>
              
              {/* Body */}
              <div className="w-full h-[35%] bg-gray-200 mt-[5%] rounded-lg"></div>
              
              {/* Arms */}
              <div className="w-full flex justify-between mt-[-20%]">
                <div className="w-[15%] h-[30%] bg-gray-200 rounded-lg"></div>
                <div className="w-[15%] h-[30%] bg-gray-200 rounded-lg"></div>
              </div>
              
              {/* Legs */}
              <div className="w-full flex justify-between mt-[5%]">
                <div className="w-[20%] h-[40%] bg-gray-200 rounded-lg"></div>
                <div className="w-[20%] h-[40%] bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            
            {/* Muscle group overlays - nur rendern, wenn bodyData verfügbar ist */}
            {bodyData && musclePositions && Object.entries(musclePositions).map(([muscle, position]: [string, any]) => (
              <div
                key={muscle}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-lg cursor-pointer transition-opacity duration-300"
                style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  height: position.height,
                  backgroundColor: getColorForMuscle(muscle),
                  opacity: getMuscleOpacity(muscle),
                }}
                onClick={() => onSelectMuscleGroup(muscle)}
              />
            ))}
          </div>
          
          {/* Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            <Button variant="secondary" size="icon" onClick={handleRotateLeft}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleReset}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleRotateRight}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyModelViewer;
