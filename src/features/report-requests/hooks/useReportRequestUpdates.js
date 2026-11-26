"use client";

import { useEffect, useEffectEvent } from "react";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useSocket } from "@/providers/SocketProvider";

/**
 * Runs `onUpdate(reportRequestId)` when a report notification arrives over the socket (delivered,
 * refunded, ...), and when the tab comes back into view, so open screens refresh themselves.
 */
export function useReportRequestUpdates(onUpdate) {
  const { socket } = useSocket();
  const handle = useEffectEvent((n) => {
    if (n?.type === "report") onUpdate(n.data?.reportRequestId || null);
  });
  const onVisible = useEffectEvent(() => onUpdate(null));

  useEffect(() => {
    if (!socket) return;
    const onNew = (n) => handle(n);
    socket.on(SOCKET_EVENTS.NOTIFICATION, onNew);
    return () => socket.off(SOCKET_EVENTS.NOTIFICATION, onNew);
  }, [socket]);

  useEffect(() => {
    const onChange = () => document.visibilityState === "visible" && onVisible();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
}
