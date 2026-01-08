import { useEffect, useRef, useCallback } from "react";

function useAutosave(value, onSave, delay = 1000, enabled = true) {
  const timeoutRef = useRef(null);
  const previousValueRef = useRef(value);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (JSON.stringify(value) === JSON.stringify(previousValueRef.current)) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (isMountedRef.current) {
        previousValueRef.current = value;
        await onSave(value);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, delay, enabled]);

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    previousValueRef.current = value;
    await onSave(value);
  }, [value, onSave]);

  return { saveNow };
}

export default useAutosave;
