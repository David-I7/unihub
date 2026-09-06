import * as React from "react";

export interface UseCountdownTimerOptions {
  defaultSeconds?: number;
  storageKey?: string;
}

function getStoredRemainingSeconds(key?: string): number {
  if (!key || typeof window === "undefined") return 0;
  try {
    const item = window.sessionStorage.getItem(key);
    if (!item) return 0;
    const expiresAt = Number(item);
    if (Number.isNaN(expiresAt)) return 0;
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

function setStoredExpiresAt(key: string | undefined, seconds: number): void {
  if (!key || typeof window === "undefined") return;
  try {
    const expiresAt = Date.now() + seconds * 1000;
    window.sessionStorage.setItem(key, String(expiresAt));
  } catch {
    // Ignore storage errors
  }
}

function clearStoredExpiresAt(key?: string): void {
  if (!key || typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

export function useCountdownTimer({
  defaultSeconds = 60,
  storageKey,
}: UseCountdownTimerOptions = {}) {
  const initialRemaining = React.useMemo(
    () => getStoredRemainingSeconds(storageKey),
    [storageKey],
  );
  const [isActive, setIsActive] = React.useState(initialRemaining > 0);
  const secondsLeftRef = React.useRef(
    initialRemaining > 0 ? initialRemaining : defaultSeconds,
  );
  const timerTextRef = React.useRef<HTMLSpanElement | null>(null);
  const intervalIdRef = React.useRef<number | null>(null);

  const clearTimerInterval = React.useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const runTick = React.useCallback(() => {
    let currentRemaining: number;
    if (storageKey) {
      currentRemaining = getStoredRemainingSeconds(storageKey);
    } else {
      secondsLeftRef.current -= 1;
      currentRemaining = secondsLeftRef.current;
    }

    secondsLeftRef.current = currentRemaining;
    if (timerTextRef.current) {
      timerTextRef.current.textContent = String(currentRemaining);
    }
    if (currentRemaining <= 0) {
      clearTimerInterval();
      clearStoredExpiresAt(storageKey);
      setIsActive(false);
    }
  }, [clearTimerInterval, storageKey]);

  const startTimer = React.useCallback(
    (seconds = defaultSeconds) => {
      clearTimerInterval();
      setStoredExpiresAt(storageKey, seconds);
      secondsLeftRef.current = seconds;
      setIsActive(true);

      if (timerTextRef.current) {
        timerTextRef.current.textContent = String(seconds);
      }

      intervalIdRef.current = window.setInterval(runTick, 1000);
    },
    [defaultSeconds, clearTimerInterval, runTick, storageKey],
  );

  const resetTimer = React.useCallback(() => {
    clearTimerInterval();
    clearStoredExpiresAt(storageKey);
    secondsLeftRef.current = 0;
    setIsActive(false);
  }, [clearTimerInterval, storageKey]);

  React.useEffect(() => {
    const remaining = getStoredRemainingSeconds(storageKey);
    if (remaining > 0) {
      secondsLeftRef.current = remaining;
      if (timerTextRef.current) {
        timerTextRef.current.textContent = String(remaining);
      }
      clearTimerInterval();
      intervalIdRef.current = window.setInterval(runTick, 1000);
    }

    return () => {
      clearTimerInterval();
    };
  }, [storageKey, clearTimerInterval, runTick]);

  return {
    isActive,
    timerTextRef,
    secondsLeftRef,
    startTimer,
    resetTimer,
  };
}

export default useCountdownTimer;
