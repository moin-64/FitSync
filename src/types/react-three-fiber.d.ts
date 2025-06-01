
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { extend, ReactThreeFiber } from '@react-three/fiber';
import * as THREE from 'three';

// Extend THREE with additional geometries and materials
extend(THREE);

declare global {
  namespace JSX {
    interface IntrinsicElements extends ReactThreeFiber.IntrinsicElements {
      // Extend with any additional custom elements if needed
    }
  }
  
  interface HTMLCanvasElement {
    __r3f?: {
      controls?: ThreeOrbitControls;
    };
  }
}

// Ensure THREE types are available
declare module '@react-three/fiber' {
  namespace ReactThreeFiber {
    interface IntrinsicElements {
      // Geometries
      boxGeometry: Object3DNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>
      capsuleGeometry: Object3DNode<THREE.CapsuleGeometry, typeof THREE.CapsuleGeometry>
      sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
      torusGeometry: Object3DNode<THREE.TorusGeometry, typeof THREE.TorusGeometry>
      
      // Materials
      meshStandardMaterial: MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>
      meshPhongMaterial: MaterialNode<THREE.MeshPhongMaterial, typeof THREE.MeshPhongMaterial>
      meshBasicMaterial: MaterialNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>
      
      // Objects
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
      group: Object3DNode<THREE.Group, typeof THREE.Group>
      
      // Lights
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
      directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
    }
  }
}

export {};
