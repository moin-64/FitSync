
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

// Fix for the type error - instead of extending Window,
// create a standalone interface that matches our needs
interface WindowWithIdleCallback {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
}

/**
 * Add idle callbacks that execute when the browser is not busy
 */
export const scheduleIdleTask = (
  callback: IdleRequestCallback,
  timeout = 2000
): number => {
  // Cast window as our custom interface with optional idle callback methods
  const win = window as unknown as WindowWithIdleCallback;
  
  if (win.requestIdleCallback) {
    return win.requestIdleCallback(callback, { timeout });
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
  // Cast window as our custom interface with optional idle callback methods
  const win = window as unknown as WindowWithIdleCallback;
  
  if (win.cancelIdleCallback) {
    win.cancelIdleCallback(id);
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
