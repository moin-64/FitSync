
import React, { useRef, useState, memo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Skeleton } from '@/components/ui/skeleton';
import ModelScene from './ModelScene';
import ModelControls from './ModelControls';
import useModelControls from '@/hooks/useModelControls';

interface BodyModelViewerProps {
  bodyData: any;
  selectedMuscleGroup: string | null;
  onSelectMuscleGroup: (muscleGroup: string) => void;
}

// Memoized main component
const BodyModelViewer: React.FC<BodyModelViewerProps> = memo(({ 
  bodyData, 
  selectedMuscleGroup,
  onSelectMuscleGroup 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get control handlers from our custom hook
  const {
    handleReset,
    handleRotateLeft,
    handleRotateRight,
    handleZoomIn,
    handleZoomOut
  } = useModelControls(canvasRef);
  
  // Cleanup loading state
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);
  
  // If no data and not loading, show placeholder
  if (!bodyData && !isLoading) {
    return (
      <div className="aspect-[3/4] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Keine Daten verfügbar</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {isLoading ? (
        <div className="aspect-[3/4] flex items-center justify-center bg-muted rounded-lg">
          <Skeleton className="w-[60%] h-[80%] rounded-full" />
        </div>
      ) : (
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg">
          <Canvas ref={canvasRef} shadows dpr={[1, 2]} className="h-full w-full">
            <Suspense fallback={null}>
              <ModelScene 
                bodyData={bodyData} 
                selectedMuscleGroup={selectedMuscleGroup}
                onSelectMuscleGroup={onSelectMuscleGroup}
              />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
          
          {/* Controls */}
          <ModelControls 
            onRotateLeft={handleRotateLeft}
            onRotateRight={handleRotateRight}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
});

BodyModelViewer.displayName = 'BodyModelViewer';

export default BodyModelViewer;
