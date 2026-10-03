"use client";

import { useCallback, useEffect, useState } from "react";

/** Simple seconds countdown — for OTP resend, "your turn" accept window, free-chat timer. */
export function useCountdown(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const start = useCallback((s) => setSeconds(s), []);
  return { seconds, isDone: seconds <= 0, start };
}
