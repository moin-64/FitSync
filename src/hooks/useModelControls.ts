
import { useCallback } from 'react';

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

export default useModelControls;
