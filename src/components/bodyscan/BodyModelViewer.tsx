import React, { useRef, useState, useCallback, memo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import * as THREE from 'three';

interface BodyModelViewerProps {
  bodyData: any;
  selectedMuscleGroup: string | null;
  onSelectMuscleGroup: (muscleGroup: string) => void;
}

// Human figure model component
const HumanModel = ({ bodyData, selectedMuscleGroup, onSelectMuscleGroup }: BodyModelViewerProps) => {
  const modelRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Muscle group colors calculated based on development score
  const getColorForMuscle = useCallback((muscleGroup: string) => {
    if (!bodyData?.muscleGroups?.[muscleGroup]) return new THREE.Color(0x7d7d7d);
    
    const development = bodyData.muscleGroups[muscleGroup].development || 50;
    
    if (development < 40) return new THREE.Color(0xff3b30); // Red for underdeveloped
    if (development < 60) return new THREE.Color(0xffcc00); // Yellow for average
    return new THREE.Color(0x34c759); // Green for well developed
  }, [bodyData]);

  // Muscle group opacity based on selection
  const getMuscleOpacity = useCallback((muscleGroup: string) => {
    if (!selectedMuscleGroup) return 0.7;
    return muscleGroup === selectedMuscleGroup ? 0.9 : 0.3;
  }, [selectedMuscleGroup]);
  
  // Gentle rotation animation when not interacting
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  // Simplified human model with muscle groups as meshes
  return (
    <group ref={modelRef} position={[0, 0, 0]} scale={1}>
      {/* Basic human body structure */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.8, 1.8, 4, 8]} />
        <meshStandardMaterial color="#e1e1e1" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.4, 32, 16]} />
        <meshStandardMaterial color="#e1e1e1" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Muscle groups - only render if bodyData available */}
      {bodyData && (
        <>
          {/* Chest muscle group */}
          <mesh 
            position={[0, 0.7, 0.4]} 
            onClick={() => onSelectMuscleGroup('chest')}
            castShadow
          >
            <boxGeometry args={[1.2, 0.5, 0.3]} />
            <meshStandardMaterial 
              color={getColorForMuscle('chest')} 
              opacity={getMuscleOpacity('chest')} 
              transparent
              emissive={selectedMuscleGroup === 'chest' ? getColorForMuscle('chest') : undefined}
              emissiveIntensity={selectedMuscleGroup === 'chest' ? 0.3 : 0}
            />
          </mesh>
          
          {/* Back muscle group */}
          <mesh 
            position={[0, 0.7, -0.4]} 
            onClick={() => onSelectMuscleGroup('back')}
            castShadow
          >
            <boxGeometry args={[1.2, 0.7, 0.3]} />
            <meshStandardMaterial 
              color={getColorForMuscle('back')} 
              opacity={getMuscleOpacity('back')} 
              transparent
              emissive={selectedMuscleGroup === 'back' ? getColorForMuscle('back') : undefined}
              emissiveIntensity={selectedMuscleGroup === 'back' ? 0.3 : 0}
            />
          </mesh>
          
          {/* Shoulders muscle group */}
          <group>
            <mesh 
              position={[-0.8, 0.7, 0]} 
              onClick={() => onSelectMuscleGroup('shoulders')}
              castShadow
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial 
                color={getColorForMuscle('shoulders')} 
                opacity={getMuscleOpacity('shoulders')} 
                transparent
                emissive={selectedMuscleGroup === 'shoulders' ? getColorForMuscle('shoulders') : undefined}
                emissiveIntensity={selectedMuscleGroup === 'shoulders' ? 0.3 : 0}
              />
            </mesh>
            <mesh 
              position={[0.8, 0.7, 0]} 
              onClick={() => onSelectMuscleGroup('shoulders')}
              castShadow
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial 
                color={getColorForMuscle('shoulders')} 
                opacity={getMuscleOpacity('shoulders')} 
                transparent
                emissive={selectedMuscleGroup === 'shoulders' ? getColorForMuscle('shoulders') : undefined}
                emissiveIntensity={selectedMuscleGroup === 'shoulders' ? 0.3 : 0}
              />
            </mesh>
          </group>
          
          {/* Arms muscle group */}
          <group>
            <mesh 
              position={[-0.8, 0.2, 0]} 
              rotation={[0, 0, -0.2]}
              onClick={() => onSelectMuscleGroup('arms')}
              castShadow
            >
              <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
              <meshStandardMaterial 
                color={getColorForMuscle('arms')} 
                opacity={getMuscleOpacity('arms')} 
                transparent
                emissive={selectedMuscleGroup === 'arms' ? getColorForMuscle('arms') : undefined}
                emissiveIntensity={selectedMuscleGroup === 'arms' ? 0.3 : 0}
              />
            </mesh>
            <mesh 
              position={[0.8, 0.2, 0]} 
              rotation={[0, 0, 0.2]}
              onClick={() => onSelectMuscleGroup('arms')}
              castShadow
            >
              <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
              <meshStandardMaterial 
                color={getColorForMuscle('arms')} 
                opacity={getMuscleOpacity('arms')} 
                transparent
                emissive={selectedMuscleGroup === 'arms' ? getColorForMuscle('arms') : undefined}
                emissiveIntensity={selectedMuscleGroup === 'arms' ? 0.3 : 0}
              />
            </mesh>
          </group>
          
          {/* Abs muscle group */}
          <mesh 
            position={[0, 0.1, 0.3]} 
            onClick={() => onSelectMuscleGroup('abs')}
            castShadow
          >
            <boxGeometry args={[0.8, 0.6, 0.2]} />
            <meshStandardMaterial 
              color={getColorForMuscle('abs')} 
              opacity={getMuscleOpacity('abs')} 
              transparent
              emissive={selectedMuscleGroup === 'abs' ? getColorForMuscle('abs') : undefined}
              emissiveIntensity={selectedMuscleGroup === 'abs' ? 0.3 : 0}
            />
          </mesh>
          
          {/* Legs muscle group */}
          <group>
            <mesh 
              position={[-0.3, -0.8, 0]} 
              onClick={() => onSelectMuscleGroup('legs')}
              castShadow
            >
              <capsuleGeometry args={[0.25, 1.2, 4, 8]} />
              <meshStandardMaterial 
                color={getColorForMuscle('legs')} 
                opacity={getMuscleOpacity('legs')} 
                transparent
                emissive={selectedMuscleGroup === 'legs' ? getColorForMuscle('legs') : undefined}
                emissiveIntensity={selectedMuscleGroup === 'legs' ? 0.3 : 0}
              />
            </mesh>
            <mesh 
              position={[0.3, -0.8, 0]} 
              onClick={() => onSelectMuscleGroup('legs')}
              castShadow
            >
              <capsuleGeometry args={[0.25, 1.2, 4, 8]} />
              <meshStandardMaterial 
                color={getColorForMuscle('legs')} 
                opacity={getMuscleOpacity('legs')} 
                transparent
                emissive={selectedMuscleGroup === 'legs' ? getColorForMuscle('legs') : undefined}
                emissiveIntensity={selectedMuscleGroup === 'legs' ? 0.3 : 0}
              />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
};

// Scene container with camera setup and controls
const Scene = (props: BodyModelViewerProps) => {
  const controlsRef = useRef(null);
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <HumanModel {...props} />
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2.5} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.6}
      />
    </>
  );
};

// Create a custom hook to handle the controls
const useModelControls = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const handleReset = useCallback(() => {
    if (canvasRef.current?.__r3f?.controls) {
      canvasRef.current.__r3f.controls.reset();
    }
  }, [canvasRef]);
  
  const handleRotateLeft = useCallback(() => {
    if (canvasRef.current?.__r3f?.controls) {
      canvasRef.current.__r3f.controls.rotateLeft(Math.PI / 8);
    }
  }, [canvasRef]);
  
  const handleRotateRight = useCallback(() => {
    if (canvasRef.current?.__r3f?.controls) {
      canvasRef.current.__r3f.controls.rotateRight(Math.PI / 8);
    }
  }, [canvasRef]);
  
  const handleZoomIn = useCallback(() => {
    if (canvasRef.current?.__r3f?.controls) {
      canvasRef.current.__r3f.controls.dollyIn(1.2);
      canvasRef.current.__r3f.controls.update();
    }
  }, [canvasRef]);
  
  const handleZoomOut = useCallback(() => {
    if (canvasRef.current?.__r3f?.controls) {
      canvasRef.current.__r3f.controls.dollyOut(1.2);
      canvasRef.current.__r3f.controls.update();
    }
  }, [canvasRef]);

  return {
    handleReset,
    handleRotateLeft,
    handleRotateRight,
    handleZoomIn,
    handleZoomOut
  };
};

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
              <Scene 
                bodyData={bodyData} 
                selectedMuscleGroup={selectedMuscleGroup}
                onSelectMuscleGroup={onSelectMuscleGroup}
              />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
          
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
});

BodyModelViewer.displayName = 'BodyModelViewer';

export default BodyModelViewer;
