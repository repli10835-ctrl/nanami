import { useState, useEffect, useCallback, useRef } from "react";
import { useBlocker } from "@tanstack/react-router";

export function useUnsavedChanges<T>(current: T) {
  const [snapshot, setSnapshot] = useState<T>(() => JSON.parse(JSON.stringify(current)));
  const currentRef = useRef(current);
  currentRef.current = current;

  const isDirty = JSON.stringify(current) !== JSON.stringify(snapshot);

  const markSaved = useCallback((newSnapshot?: T) => {
    setSnapshot(
      JSON.parse(JSON.stringify(newSnapshot !== undefined ? newSnapshot : currentRef.current)),
    );
  }, []);

  const resetToSnapshot = useCallback(() => {
    return JSON.parse(JSON.stringify(snapshot));
  }, [snapshot]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: true,
  });

  return {
    isDirty,
    markSaved,
    resetToSnapshot,
    blocker,
  };
}
