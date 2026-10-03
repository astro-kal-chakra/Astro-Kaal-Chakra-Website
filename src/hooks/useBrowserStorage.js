"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "browser-storage:change";

const read = (storage, key) => {
  try {
    return window[storage].getItem(key);
  } catch {
    return null; // private mode / blocked storage
  }
};

/**
 * Read/write a localStorage or sessionStorage key without hydration mismatches.
 * Server render (and first client render) sees `serverValue`.
 * @returns {[string|null, (value: string|null) => void]}
 */
export function useBrowserStorage(key, { storage = "localStorage", serverValue = null } = {}) {
  const subscribe = useCallback((cb) => {
    window.addEventListener(EVENT, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(EVENT, cb);
      window.removeEventListener("storage", cb);
    };
  }, []);

  const value = useSyncExternalStore(subscribe, () => read(storage, key), () => serverValue);

  const setValue = useCallback(
    (next) => {
      try {
        if (next === null) window[storage].removeItem(key);
        else window[storage].setItem(key, next);
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    [key, storage]
  );

  return [value, setValue];
}
