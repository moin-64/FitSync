
import React, { useRef } from 'react';
import { PerspectiveCamera, OrbitControls, ContactShadows } from '@react-three/drei';
import HumanModel from './HumanModel';

interface ModelSceneProps {
  bodyData: any;
  selectedMuscleGroup: string | null;
  onSelectMuscleGroup: (muscleGroup: string) => void;
}

const ModelScene = (props: ModelSceneProps) => {
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

export default ModelScene;
