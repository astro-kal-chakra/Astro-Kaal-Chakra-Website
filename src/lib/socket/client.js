"use client";

import { io } from "socket.io-client";
import { env } from "@/config/site";

let socket = null;

/**
 * Lazily create one shared Socket.io connection for the whole tab.
 * Auth is carried by the httpOnly cookie (withCredentials). Returns null in
 * mock mode so callers can fall back gracefully.
 */
export function getSocket() {
  if (typeof window === "undefined" || !env.socketUrl) return null;
  if (!socket) {
    socket = io(env.socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
