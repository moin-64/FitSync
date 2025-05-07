// New utility file for performance optimizations

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          const currentArgs = lastArgs;
          lastArgs = null;
          func(...currentArgs);
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * Memoize function results for improved performance
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Provides a performance measurement wrapper for functions
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  func: T,
  label: string
): (...args: Parameters<T>) => ReturnType<T> {
  return function(...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    
    return result;
  };
}

/**
 * Optimize image loading for improved performance
 */
export function optimizeImageLoading(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    
    // Use cache control for better performance
    img.src = `${imageUrl}?t=${Date.now()}`;
  });
}

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

/**
 * Add idle callbacks that execute when the browser is not busy
 */
export const scheduleIdleTask = (
  callback: IdleRequestCallback,
  timeout = 2000
): number => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  } else {
    // Corrected type for setTimeout return value
    return window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1);
  }
};

/**
 * Cancel idle tasks
 */
export const cancelIdleTask = (id: number): void => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
};

/**
 * Use this to mark operations that shouldn't block rendering
 */
export const markNonBlockingOperation = <T>(operation: () => T): Promise<T> => {
  return new Promise((resolve) => {
    scheduleIdleTask(() => {
      const result = operation();
      resolve(result);
    });
  });
};
