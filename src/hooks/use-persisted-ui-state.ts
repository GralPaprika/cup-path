"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readInitialUiPreference,
  writeUiPreference,
} from "@/lib/client/ui-preference";

type StateUpdater<T> = T | ((prev: T) => T);

/**
 * Client-only preference state. Starts at `defaultValue`, then hydrates
 * from localStorage after mount. Pass `key: null` to skip persistence.
 */
export function usePersistedUiState<T>(
  key: string | null,
  defaultValue: T,
): [T, (next: StateUpdater<T>) => void] {
  const [value, setValueState] = useState<T>(defaultValue);

  useEffect(() => {
    if (!key) return;
    // Hydrate the browser-only preference after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValueState(readInitialUiPreference(key, defaultValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from localStorage
  }, [key]);

  const setValue = useCallback(
    (next: StateUpdater<T>) => {
      setValueState((current) => {
        const resolved =
          typeof next === "function"
            ? (next as (prev: T) => T)(current)
            : next;
        if (key) writeUiPreference(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, setValue];
}
