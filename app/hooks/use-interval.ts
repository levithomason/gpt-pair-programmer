import { useEffect, useRef } from "react";

type Callback = () => void;

export const useInterval = (callback: Callback, timeout: number) => {
  const callbackRef = useRef<Callback>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = setInterval(callbackRef.current, timeout);
    return () => clearInterval(id);
  }, [timeout]);
};
