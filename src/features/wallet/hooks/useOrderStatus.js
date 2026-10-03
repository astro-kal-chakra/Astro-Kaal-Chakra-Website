"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { walletService } from "@/lib/api/services/wallet.service";

const TERMINAL = new Set(["success", "failed"]);
/** Poll fast at first (webhooks usually land within seconds), then back off. */
const delayFor = (attempt) => (attempt < 10 ? 2000 : attempt < 25 ? 5000 : 15000);
/** After this long we tell the user it's taking longer than usual (but keep polling). */
const SLOW_AFTER_MS = 45_000;
/** Hard stop — the user can still re-check manually. */
const GIVE_UP_AFTER_MS = 15 * 60_000;

/**
 * Polls walletService.getOrderStatus(orderId) until success / failed.
 * `onDone(order)` fires once when a terminal status arrives (e.g. to update the header balance).
 * @returns {{ order: object|null, status: string, slow: boolean, stopped: boolean, error: object|null, recheck: () => void }}
 *   status: "loading" | "created" | "pending" | "success" | "failed" | "notFound" | "error"
 */
export function useOrderStatus(orderId, { enabled = true, onDone } = {}) {
  const [state, setState] = useState({ order: null, status: "loading", slow: false, stopped: false, error: null });
  const [runId, setRunId] = useState(0);
  const startedAt = useRef(0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!enabled || !orderId) return;
    let cancelled = false;
    let timer;
    let attempt = 0;
    let finished = false;
    startedAt.current = Date.now();

    const tick = () => {
      walletService
        .getOrderStatus(orderId)
        .then((order) => {
          if (cancelled) return;
          const elapsed = Date.now() - startedAt.current;
          const done = TERMINAL.has(order.status);
          const stopped = !done && elapsed > GIVE_UP_AFTER_MS;
          setState({ order, status: order.status, slow: !done && elapsed > SLOW_AFTER_MS, stopped, error: null });
          finished = done || stopped;
          if (done) onDoneRef.current?.(order);
          if (!finished) timer = setTimeout(tick, delayFor(++attempt));
        })
        .catch((error) => {
          if (cancelled) return;
          if (error?.status === 404) {
            finished = true;
            setState((s) => ({ ...s, status: "notFound", error }));
            return;
          }
          // Network blips: keep the last known state and retry.
          setState((s) => ({ ...s, error, status: s.order ? s.status : "error" }));
          timer = setTimeout(tick, delayFor(++attempt));
        });
    };
    tick();

    const onVisible = () => {
      if (document.visibilityState === "visible" && !finished) {
        clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [orderId, enabled, runId]);

  const recheck = useCallback(() => {
    setState((s) => ({ ...s, slow: false, stopped: false }));
    setRunId((n) => n + 1);
  }, []);

  return { ...state, recheck };
}
