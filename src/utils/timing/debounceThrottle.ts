
/**
 * Timing utilities for performance optimization
 */

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
