"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { SESSION_CLIENT_EVENTS } from "../lib/sessionEvents";
import { useSessionTransport, useTransportConnected, useTransportEvent } from "./useSessionTransport";

/* A 1-second clock shared by every timer on the page (display only). */
const clockSubscribe = (cb) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const clockSnapshot = () => Math.floor(Date.now() / 1000);
export const useClockSeconds = () => useSyncExternalStore(clockSubscribe, clockSnapshot, () => 0);

/**
 * Joins the live session room and tracks server-authoritative state:
 * billing ticks (balance, low balance, free time) and the end event.
 * The visible timer is derived locally from startedAt — display only.
 */
export function useLiveSession(session) {
  const transport = useSessionTransport();
  const connected = useTransportConnected(transport);
  const [billing, setBilling] = useState(null);
  const [endedEvent, setEndedEvent] = useState(null);
  const nowSec = useClockSeconds();

  const sessionId = session?.id;
  const isActive = session?.status === "active";

  // (Re)join on load and after every reconnect so missed events are replayed.
  useEffect(() => {
    if (!sessionId || !isActive || !connected) return;
    transport.emit(SESSION_CLIENT_EVENTS.JOIN, { sessionId });
    return () => transport.emit(SESSION_CLIENT_EVENTS.LEAVE, { sessionId });
  }, [transport, sessionId, isActive, connected]);

  useTransportEvent(transport, SOCKET_EVENTS.SESSION_BILLING, (p) => {
    if (p.sessionId === sessionId) setBilling(p);
  });
  useTransportEvent(transport, SOCKET_EVENTS.SESSION_ENDED, (p) => {
    if (p.sessionId === sessionId) setEndedEvent(p);
  });

  const ended =
    endedEvent ||
    (session?.status === "ended"
      ? { reason: session.endReason, duration: session.duration, charged: session.charged, balance: session.endBalance }
      : null);

  const startedSec = session?.startedAt ? Math.floor(session.startedAt / 1000) : null;
  const elapsed = ended ? ended.duration || 0 : startedSec && nowSec ? Math.max(0, nowSec - startedSec) : billing?.elapsed || 0;
  // Smooth local countdown, but the server decides when free time is over.
  const freeRemaining =
    session?.isFree && !(billing && billing.freeRemaining === 0) && !ended
      ? Math.max(0, (session.freeSeconds || 0) - elapsed)
      : 0;

  return {
    transport,
    connected,
    elapsed,
    freeRemaining,
    balance: ended?.balance ?? billing?.balance ?? null,
    secondsLeft: billing?.secondsLeft ?? null,
    lowBalance: !ended && Boolean(billing?.lowBalance),
    ended,
  };
}
