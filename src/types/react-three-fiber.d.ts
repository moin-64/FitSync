
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { extend, ReactThreeFiber } from '@react-three/fiber';
import * as THREE from 'three';

// Extend THREE with additional geometries and materials
extend(THREE);

declare global {
  namespace JSX {
    interface IntrinsicElements extends ReactThreeFiber.IntrinsicElements {}
  }
  
  interface HTMLCanvasElement {
    __r3f?: {
      controls?: ThreeOrbitControls;
    };
  }
}

export {};
