"use client";

import { useCallback, useEffect, useEffectEvent, useSyncExternalStore } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { mockSessionEngine } from "../lib/mockSessionEngine";

/**
 * The real-time channel for sessions. Uses the shared Socket.io client when a
 * socket URL is configured, otherwise the in-tab mock engine — both expose
 * on / off / emit / connected, and push the same SOCKET_EVENTS payloads.
 */
export function useSessionTransport() {
  const { socket } = useSocket();
  return socket || mockSessionEngine;
}

/** Live connection flag of the transport ("connect" / "disconnect"). */
export function useTransportConnected(transport) {
  const subscribe = useCallback(
    (cb) => {
      transport.on("connect", cb);
      transport.on("disconnect", cb);
      return () => {
        transport.off("connect", cb);
        transport.off("disconnect", cb);
      };
    },
    [transport]
  );
  return useSyncExternalStore(subscribe, () => Boolean(transport.connected), () => true);
}

/** Subscribe to one transport event; the handler always sees fresh props/state. */
export function useTransportEvent(transport, event, handler) {
  const onEvent = useEffectEvent(handler);
  useEffect(() => {
    const cb = (payload) => onEvent(payload);
    transport.on(event, cb);
    return () => transport.off(event, cb);
  }, [transport, event]);
}
