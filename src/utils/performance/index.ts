
// Re-export all performance utilities
export * from '../timing/debounceThrottle';
export * from './memoize';
export * from '../media/imageOptimization';
export * from '../browser/featureDetection';
export * from '../scheduling/idleProcessing';

// For backward compatibility
import { debounce, throttle } from '../timing/debounceThrottle';
import { memoize, measurePerformance } from './memoize';
import { optimizeImageLoading } from '../media/imageOptimization';
import { browserSupports, getConnectionSpeed } from '../browser/featureDetection';
import { 
  scheduleIdleTask, 
  cancelIdleTask, 
  processInChunks 
} from '../scheduling/idleProcessing';

// Bundle all utilities into a single export
export default {
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
};
