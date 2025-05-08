
// This file is kept for backward compatibility
// It re-exports all utilities from the refactored structure

// Import from the correct path
import * as performanceUtils from './performance/index';

export const {
  debounce,
  throttle,
  memoize,
  measurePerformance,
  optimizeImageLoading,
  browserSupports,
  getConnectionSpeed,
  scheduleIdleTask,
  cancelIdleTask,
  processInChunks
} = performanceUtils;

export default performanceUtils;
