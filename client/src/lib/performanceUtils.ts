export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): DebouncedFunction<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Args) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debounced;
}

export interface ThrottledFunction<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  limitMs: number,
): ThrottledFunction<Args> {
  let lastRan = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Args | undefined;

  const throttled = (...args: Args) => {
    const now = Date.now();
    lastArgs = args;

    if (now - lastRan >= limitMs) {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      lastRan = now;
      lastArgs = undefined;
      fn(...args);
    } else if (timeoutId === undefined) {
      timeoutId = setTimeout(() => {
        lastRan = Date.now();
        timeoutId = undefined;
        if (lastArgs !== undefined) {
          const argsToRun = lastArgs;
          lastArgs = undefined;
          fn(...argsToRun);
        }
      }, limitMs - (now - lastRan));
    }
  };

  throttled.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    lastArgs = undefined;
  };

  return throttled;
}
