import { useState, useEffect, useRef } from "react";

export function useTimer(initialTime: number = 0) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setTime(initialTime);
    setIsRunning(false);
  };
  const setTimeValue = (newTime: number) => {
    setTime(newTime);
  };

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    setTime: setTimeValue,
  };
}
