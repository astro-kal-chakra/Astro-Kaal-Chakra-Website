"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useSocket } from "@/providers/SocketProvider";

/** Current time, updated every `ms` (deadline countdowns). Null until mounted, so server and client render the same. */
export function useNow(ms = 30_000) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, ms);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [ms]);
  return now;
}

/**
 * Runs `onUpdate(remedyId)` when a remedy notification arrives over the socket
 * (remedy_delivered, remedy_answer, remedy_refunded), so open screens refresh themselves.
 */
export function useRemedyUpdates(onUpdate) {
  const { socket } = useSocket();
  const handle = useEffectEvent((n) => {
    if (n?.type === "remedy") onUpdate(n.data?.remedyId || null);
  });
  useEffect(() => {
    if (!socket) return;
    const onNew = (n) => handle(n);
    socket.on(SOCKET_EVENTS.NOTIFICATION, onNew);
    return () => socket.off(SOCKET_EVENTS.NOTIFICATION, onNew);
  }, [socket]);
}
