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

// Snapshot must be a primitive so React can compare it between reads.
const snapshot = () => {
  const vv = window.visualViewport;
  return vv ? `${Math.round(vv.height)}:${Math.round(vv.offsetTop)}` : "";
};

/**
 * Style that pins a full-screen element to the area above the on-screen
 * keyboard. iOS Safari does not shrink `dvh` when the keyboard opens (it
 * scrolls the page instead), so the chat follows the visual viewport to keep
 * the header and composer visible. Returns undefined on the server.
 */
export function useVisualViewportStyle() {
  const value = useSyncExternalStore(subscribe, snapshot, () => "");
  if (!value) return undefined;
  const [height, top] = value.split(":").map(Number);
  return { height, top };
}
