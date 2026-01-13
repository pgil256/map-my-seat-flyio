import { useMemo } from "react";
import SeatingApi from "../api";
import { useDemo } from "../demo/DemoContext";

/**
 * Hook that returns the appropriate API based on demo mode status.
 * In demo mode, returns the demo API that works with local state.
 * In normal mode, returns the real SeatingApi.
 */
export default function useApi() {
  const { isDemo, demoApi } = useDemo();

  const api = useMemo(() => {
    if (isDemo) {
      return demoApi;
    }
    return SeatingApi;
  }, [isDemo, demoApi]);

  return { api, isDemo };
}
