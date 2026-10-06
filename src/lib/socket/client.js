"use client";

import { io } from "socket.io-client";
import { env } from "@/config/site";

let socket = null;

/**
 * The backend sends money in paise and times as ISO strings over the socket;
 * the website works in rupees and epoch ms (like its HTTP API). Converted here, once.
 */
const PAISE_KEYS = new Set(["balance", "totalCharged", "unusedReturned", "ratePerMin", "earnings", "amount", "charged", "price", "minRequired", "shortfall", "endBalance", "creditAmount"]);
const TIME_KEYS = new Set(["startedAt", "endedAt"]);

function normalize(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const out = { ...payload };
  for (const [k, v] of Object.entries(out)) {
    if (PAISE_KEYS.has(k) && typeof v === "number") out[k] = Math.round(v) / 100;
    else if (TIME_KEYS.has(k) && typeof v === "string") out[k] = new Date(v).getTime();
  }
  return out;
}

/** chat:message carries the stored message; the website wants { sessionId, message } in its own shape. */
const toChatMessage = (m) => ({
  sessionId: String(m.session),
  message: {
    id: String(m._id),
    clientId: m.clientMsgId || null,
    from: m.senderRole,
    type: m.type,
    text: m.text || "",
    mediaUrl: m.mediaUrl || null,
    createdAt: new Date(m.createdAt).getTime(),
    status: m.status || "sent",
  },
});
const EVENT_SHAPES = { "chat:message": (p) => (p && p.senderRole ? toChatMessage(p) : p) };

/** Wrap on/off so every handler receives normalised payloads (off() still finds the wrapped handler). */
function withNormalizedEvents(s) {
  const wrapped = new WeakMap();
  const on = s.on.bind(s);
  const off = s.off.bind(s);
  s.on = (event, handler) => {
    if (typeof handler !== "function" || event === "connect" || event === "disconnect" || event === "connect_error") return on(event, handler);
    let w = wrapped.get(handler);
    if (!w) {
      const shape = EVENT_SHAPES[event];
      w = (payload, ...rest) => handler(shape ? shape(payload) : normalize(payload), ...rest);
      wrapped.set(handler, w);
    }
    return on(event, w);
  };
  s.off = (event, handler) => off(event, handler ? wrapped.get(handler) || handler : undefined);
  // chat:send's acknowledgement carries the stored message too: same shape as incoming messages
  const emit = s.emit.bind(s);
  s.emit = (event, ...args) => {
    const ack = args[args.length - 1];
    if (event === "chat:send" && typeof ack === "function") {
      args[args.length - 1] = (res) => ack(res?.ok && res.data?.senderRole ? { ...res, data: toChatMessage(res.data).message } : res);
    }
    return emit(event, ...args);
  };
  return s;
}

/**
 * Lazily create one shared Socket.io connection for the whole tab.
 * Signed in: the httpOnly cookie authenticates it (withCredentials). Signed out: it
 * connects as a watch-only guest (live status, live rooms). Returns null in mock mode.
 */
export function getSocket() {
  if (typeof window === "undefined" || !env.socketUrl) return null;
  if (!socket) {
    socket = withNormalizedEvents(
      io(env.socketUrl, {
        withCredentials: true,
        auth: { guest: true }, // ignored by the server when the login cookie is present
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        autoConnect: true,
      })
    );
  }
  return socket;
}

/** Reconnect after login / logout so the socket picks up (or drops) the login cookie. */
export function reconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket.connect();
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
