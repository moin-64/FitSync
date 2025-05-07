
/**
 * Check if browser supports certain performance features
 */
export const browserSupports = {
  webp: async (): Promise<boolean> => {
    try {
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
  webGL: (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  },
  webGL2: (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
      return false;
    }
  }
};

/**
 * Helper to detect slow connections for adaptive loading
 */
export const getConnectionSpeed = (): 'slow' | 'medium' | 'fast' => {
  const connection = (navigator as any).connection;
  
  if (connection) {
    const { effectiveType, downlink, rtt } = connection;
    
    if (effectiveType === '4g' && downlink > 1.5 && rtt < 100) {
      return 'fast';
    } else if ((effectiveType === '4g' || effectiveType === '3g') && downlink > 0.5) {
      return 'medium';
    } else {
      return 'slow';
    }
  }
  
  // Default when Network Information API isn't available
  return 'medium';
};
