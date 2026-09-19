import { useState, useEffect, useCallback, useRef } from "react";
import { useBlocker } from "@tanstack/react-router";

function deepEqual<T>(a: T, b: T): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

export function useUnsavedChanges<T>(current: T) {
  const [snapshot, setSnapshot] = useState<T>(() =>
    current !== undefined ? JSON.parse(JSON.stringify(current)) : current,
  );
  const currentRef = useRef(current);
  currentRef.current = current;

  const isDirty = !deepEqual(current, snapshot);

  const markSaved = useCallback((newSnapshot?: T) => {
    const val = newSnapshot !== undefined ? newSnapshot : currentRef.current;
    setSnapshot(val !== undefined ? JSON.parse(JSON.stringify(val)) : val);
  }, []);

  const resetToSnapshot = useCallback(() => {
    return snapshot !== undefined ? JSON.parse(JSON.stringify(snapshot)) : snapshot;
  }, [snapshot]);

  // Only TanStack router blocker for in-app navigation
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: false,
  });

  return {
    isDirty,
    markSaved,
    resetToSnapshot,
    blocker,
  };
}
