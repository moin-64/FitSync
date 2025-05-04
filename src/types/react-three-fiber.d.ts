
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';

declare global {
  interface HTMLCanvasElement {
    __r3f?: {
      controls?: ThreeOrbitControls;
    };
  }
}

export {};
