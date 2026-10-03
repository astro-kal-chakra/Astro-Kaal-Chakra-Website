"use client";

import { useBrowserStorage } from "@/hooks/useBrowserStorage";

/**
 * Remembers the order currently being paid so that if the user closes the tab
 * mid-payment (or the UPI app kills it), the wallet page can resume polling.
 */
export const INFLIGHT_KEY = "wallet:inflight-order";
const MAX_AGE = 24 * 3600_000;

const parse = (raw) => {
  try {
    const v = JSON.parse(raw);
    if (!v?.orderId || Date.now() - v.startedAt > MAX_AGE) return null;
    return v;
  } catch {
    return null;
  }
};

/** @returns {[ { orderId: string, total: number, startedAt: number } | null, (v: object | null) => void ]} */
export function useInflightOrder() {
  const [raw, setRaw] = useBrowserStorage(INFLIGHT_KEY);
  const value = raw ? parse(raw) : null;
  const set = (v) => setRaw(v ? JSON.stringify({ startedAt: Date.now(), ...v }) : null);
  return [value, set];
}
