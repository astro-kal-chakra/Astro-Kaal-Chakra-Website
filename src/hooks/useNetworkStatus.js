"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

/** true when the browser reports a network connection. */
export function useNetworkStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
