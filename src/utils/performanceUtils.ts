
// This file is kept for backward compatibility
// It re-exports all utilities from the refactored structure

import performanceUtils from './performance/index';

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
