"use client";

import { useEffect } from "react";

/** Ask the browser to confirm before closing / reloading the tab during a live session. */
export function useLeaveWarning(active) {
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // required by older Chrome / Safari
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);
}
