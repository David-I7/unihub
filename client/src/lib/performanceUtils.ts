export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Args) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  limitMs: number,
): (...args: Args) => void {
  let lastRan = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Args) => {
    const now = Date.now();
    if (now - lastRan >= limitMs) {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      lastRan = now;
      fn(...args);
    } else if (timeoutId === undefined) {
      timeoutId = setTimeout(() => {
        lastRan = Date.now();
        timeoutId = undefined;
        fn(...args);
      }, limitMs - (now - lastRan));
    }
  };
}
