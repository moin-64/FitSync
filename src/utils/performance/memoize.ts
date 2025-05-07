
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
