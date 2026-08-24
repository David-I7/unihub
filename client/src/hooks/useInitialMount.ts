import { useEffect, useRef } from "react";

export default function useInitialMount() {
  const isInitialMount = useRef(true);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return isInitialMount.current;
}
