
/**
 * Types for idle processing
 */
interface IdleRequestOptions {
  timeout: number;
}

interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

// Use module augmentation instead of global declaration
// This prevents duplicate interface extension errors
declare global {
  interface Window {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
  }
}

/**
 * Add idle callbacks that execute when the browser is not busy
 */
export const scheduleIdleTask = (
  callback: IdleRequestCallback,
  timeout = 2000
): number => {
  if (window.requestIdleCallback) {
    return window.requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    // Explicitly convert setTimeout's return to number
    return Number(setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 50
      });
    }, 1));
  }
};

/**
 * Cancel idle tasks
 */
export const cancelIdleTask = (id: number): void => {
  if (window.cancelIdleCallback) {
    window.cancelIdleCallback(id);
  } else {
    // Fallback for browsers that don't support cancelIdleCallback
    clearTimeout(id);
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
