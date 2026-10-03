"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb) => {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener("resize", cb);
  vv.addEventListener("scroll", cb);
  return () => {
    vv.removeEventListener("resize", cb);
    vv.removeEventListener("scroll", cb);
  };
};

/** Pixels of the layout viewport hidden at the bottom (on-screen keyboard, iOS toolbar). */
const snapshot = () => {
  const vv = window.visualViewport;
  if (!vv) return 0;
  return Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
};

/**
 * Height covered by the on-screen keyboard. Use it to lift bottom-anchored UI
 * (bottom sheets, sticky bars) above the keyboard — iOS Safari does not resize
 * the layout viewport when the keyboard opens. 0 on the server / desktop.
 */
export function useKeyboardInset() {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}
