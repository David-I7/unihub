import * as React from "react";

export interface UseCountdownTimerOptions {
  defaultSeconds?: number;
}

export function useCountdownTimer({ defaultSeconds = 60 }: UseCountdownTimerOptions = {}) {
  const [isActive, setIsActive] = React.useState(false);
  const secondsLeftRef = React.useRef(defaultSeconds);
  const timerTextRef = React.useRef<HTMLSpanElement | null>(null);
  const intervalIdRef = React.useRef<number | null>(null);

  const clearTimerInterval = React.useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const runTick = React.useCallback(() => {
    secondsLeftRef.current -= 1;
    if (timerTextRef.current) {
      timerTextRef.current.textContent = String(secondsLeftRef.current);
    }
    if (secondsLeftRef.current <= 0) {
      clearTimerInterval();
      setIsActive(false);
    }
  }, [clearTimerInterval]);

  const startTimer = React.useCallback(
    (seconds = defaultSeconds) => {
      clearTimerInterval();
      secondsLeftRef.current = seconds;
      setIsActive(true);

      if (timerTextRef.current) {
        timerTextRef.current.textContent = String(secondsLeftRef.current);
      }

      intervalIdRef.current = window.setInterval(runTick, 1000);
    },
    [defaultSeconds, clearTimerInterval, runTick],
  );

  const resetTimer = React.useCallback(() => {
    clearTimerInterval();
    secondsLeftRef.current = 0;
    setIsActive(false);
  }, [clearTimerInterval]);

  React.useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
    isActive,
    timerTextRef,
    secondsLeftRef,
    startTimer,
    resetTimer,
  };
}

export default useCountdownTimer;
