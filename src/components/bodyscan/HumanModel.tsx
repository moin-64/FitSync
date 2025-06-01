
import React, { useRef, useCallback } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend THREE to make sure all geometries and materials are available
extend(THREE);

interface HumanModelProps {
  bodyData: any;
  selectedMuscleGroup: string | null;
  onSelectMuscleGroup: (muscleGroup: string) => void;
}

const HumanModel = ({ bodyData, selectedMuscleGroup, onSelectMuscleGroup }: HumanModelProps) => {
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

export default HumanModel;
