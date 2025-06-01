
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { extend, ReactThreeFiber } from '@react-three/fiber';
import * as THREE from 'three';

// Extend THREE with additional geometries and materials
extend(THREE);

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Geometries
      boxGeometry: ReactThreeFiber.Object3DNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>
      capsuleGeometry: ReactThreeFiber.Object3DNode<THREE.CapsuleGeometry, typeof THREE.CapsuleGeometry>
      sphereGeometry: ReactThreeFiber.Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
      
      // Materials
      meshStandardMaterial: ReactThreeFiber.MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>
      
      // Objects
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
      group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>
      
      // Lights
      ambientLight: ReactThreeFiber.Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
      directionalLight: ReactThreeFiber.Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
    }
  }
  
  interface HTMLCanvasElement {
    __r3f?: {
      controls?: ThreeOrbitControls;
    };
  }
}

export {};
