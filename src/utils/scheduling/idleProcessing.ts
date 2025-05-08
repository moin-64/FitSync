
// Types for requestIdleCallback
interface IdleRequestOptions {
  timeout: number;
}

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

// Define the global window with optional idle callback properties
interface WindowWithIdleCallback {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
}

// Modern polyfill for requestIdleCallback for browsers that don't support it
export const scheduleIdleTask = (callback: IdleRequestCallback, options?: IdleRequestOptions): number => {
  // Cast the window to our interface
  const win = window as (Window & WindowWithIdleCallback);

  // Use native requestIdleCallback if available
  if (win.requestIdleCallback) {
    return win.requestIdleCallback(callback, options);
  }

  // Fallback using setTimeout
  const timeout = options?.timeout || 50;
  return setTimeout(() => {
    const start = Date.now();
    
    // Create a deadline object that mimics IdleDeadline
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, timeout) as unknown as number;
};

// Cancel an idle task
export const cancelIdleTask = (handle: number): void => {
  // Cast the window to our interface
  const win = window as (Window & WindowWithIdleCallback);

  // Use native cancelIdleCallback if available
  if (win.cancelIdleCallback) {
    win.cancelIdleCallback(handle);
    return;
  }

  // Fallback using clearTimeout
  clearTimeout(handle);
};

// Helper function to break up heavy work
export const processInChunks = <T>(
  items: T[],
  processItem: (item: T) => void,
  chunkSize: number = 5,
  timeBudget: number = 10
): Promise<void> => {
  return new Promise((resolve) => {
    let index = 0;
    
    const processChunk = (deadline: IdleDeadline) => {
      // Process until we run out of time or items
      while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && index < items.length) {
        const endOfChunk = Math.min(index + chunkSize, items.length);
        
        // Process the next chunk
        for (let i = index; i < endOfChunk; i++) {
          processItem(items[i]);
        }
        
        index = endOfChunk;
        
        // Break out if we're done
        if (index >= items.length) {
          break;
        }
      }
      
      // If we have more items to process, schedule the next chunk
      if (index < items.length) {
        scheduleIdleTask(processChunk, { timeout: timeBudget });
      } else {
        resolve();
      }
    };
    
    // Start processing
    scheduleIdleTask(processChunk, { timeout: timeBudget });
  });
};
