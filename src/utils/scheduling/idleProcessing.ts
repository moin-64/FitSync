
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

// Instead of using declare global, we'll use a type assertion approach
// to avoid conflicts with existing TypeScript lib declarations
interface CustomWindow extends Window {
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
  const customWindow = window as CustomWindow;
  
  if (customWindow.requestIdleCallback) {
    return customWindow.requestIdleCallback(callback, { timeout });
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
  const customWindow = window as CustomWindow;
  
  if (customWindow.cancelIdleCallback) {
    customWindow.cancelIdleCallback(id);
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
