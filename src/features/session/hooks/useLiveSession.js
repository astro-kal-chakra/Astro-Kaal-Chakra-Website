"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CLIENT_EVENTS, SOCKET_EVENTS } from "@/lib/socket/events";
import { normalizeEndReason } from "../lib/sessionEvents";
import { useSessionTransport, useTransportConnected, useTransportEvent } from "./useSessionTransport";

/* A 1-second clock shared by every timer on the page (display only). */
const clockSubscribe = (cb) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const clockSnapshot = () => Math.floor(Date.now() / 1000);
export const useClockSeconds = () => useSyncExternalStore(clockSubscribe, clockSnapshot, () => 0);

/** session:end payload (or a finished session record) → what the UI shows. */
const toEnded = (p) => ({
  reason: normalizeEndReason(p.reason ?? p.endReason),
  durationSec: p.durationSec || 0,
  totalCharged: p.totalCharged || 0,
  unusedReturned: p.unusedReturned || 0,
  balance: p.balance ?? p.endBalance,
});

/**
 * Joins the live session room and tracks server-authoritative state:
 * billing ticks (session:tick — balance after holding the current minute and the
 * cost so far, by the second), the low-balance warning (wallet:low) and session:end.
 * The visible timer is derived locally from startedAt — display only.
 */
export function useLiveSession(session) {
  const transport = useSessionTransport();
  const connected = useTransportConnected(transport);
  const [tick, setTick] = useState(null);
  const [low, setLow] = useState(null); // { endsAt } from wallet:low
  const [endedEvent, setEndedEvent] = useState(null);
  const nowSec = useClockSeconds();

  const sessionId = session?.id;
  const isActive = session?.status === "active";

  // (Re)join on load and after every reconnect so missed events are replayed.
  useEffect(() => {
    if (!sessionId || !isActive || !connected) return;
    transport.emit(CLIENT_EVENTS.SESSION_JOIN, { sessionId });
  }, [transport, sessionId, isActive, connected]);

  useTransportEvent(transport, SOCKET_EVENTS.SESSION_TICK, (p) => {
    if (p.sessionId === sessionId) setTick(p);
  });
  useTransportEvent(transport, SOCKET_EVENTS.WALLET_LOW, (p) => {
    // Free chats show their own countdown; this is for paid time running out.
    if (p.sessionId === sessionId && !p.freeSession) setLow({ endsAt: Date.now() + (p.endsInSeconds ?? 60) * 1000 });
  });
  useTransportEvent(transport, SOCKET_EVENTS.SESSION_END, (p) => {
    if (p.sessionId === sessionId) setEndedEvent(toEnded(p));
  });

  const ended = endedEvent || (session?.status === "completed" ? toEnded(session) : null);

  const startedSec = session?.startedAt ? Math.floor(session.startedAt / 1000) : null;
  const elapsed = ended ? ended.durationSec : startedSec && nowSec ? Math.max(0, nowSec - startedSec) : tick?.elapsedSec || 0;
  // Smooth local countdown; the server ends the free chat when its minutes are over.
  const freeRemaining = session?.isFree && !ended ? Math.max(0, (session.freeMinutes || 0) * 60 - elapsed) : 0;
  const secondsLeft = low && nowSec ? Math.max(0, Math.ceil(low.endsAt / 1000) - nowSec) : null;

  return {
    transport,
    connected,
    elapsed,
    freeRemaining,
    balance: ended?.balance ?? tick?.balance ?? null,
    totalCharged: ended?.totalCharged ?? tick?.totalCharged ?? 0,
    secondsLeft,
    lowBalance: !ended && !session?.isFree && Boolean(low),
    ended,
  };
}
