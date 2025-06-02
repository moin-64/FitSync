
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend THREE with all the geometries and materials we use
extend(THREE);

// This ensures all THREE.js objects are available as JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Explicit material definitions to fix type errors
      meshStandardMaterial: any;
      meshPhongMaterial: any;
      boxGeometry: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      planeGeometry: any;
      mesh: any;
      group: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
  
  // Add __r3f property to HTMLCanvasElement for controls
  interface HTMLCanvasElement {
    __r3f?: {
      controls?: any;
    };
  }
}
