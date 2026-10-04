/**
 * Socket.io event names — keep in sync with the backend (src/constants/index.js
 * SOCKET_EVENTS and src/sockets/handlers/*.js) and the mobile app.
 */

/** Server → client. */
export const SOCKET_EVENTS = {
  // Presence
  ASTRO_STATUS: "astro:status", // { astrologerId, status, queueCount, ... }
  ASTROLOGER_STATUS: "astro:status", // alias of ASTRO_STATUS (used by features/astrologers)
  SUBSCRIBE_PRESENCE: "presence:subscribe", // client → server: join the listing presence room
  UNSUBSCRIBE_PRESENCE: "presence:unsubscribe", // client → server

  // Session lifecycle
  SESSION_REQUEST: "session:request", // astrologer app only (incoming request) — not used by the website
  SESSION_START: "session:start", // accepted, now live { sessionId, mode, startedAt, ratePerMin, isFree, freeMinutes, balance }
  SESSION_REJECTED: "session:rejected", // { sessionId, reason, suggestions }
  SESSION_MISSED: "session:missed", // not answered in time { sessionId, reason, suggestions }
  SESSION_END: "session:end", // { sessionId, reason, durationSec, billedMinutes, totalCharged, unusedReturned, isFree, balance }
  SESSION_TICK: "session:tick", // billing { sessionId, elapsedSec, billedMinutes, totalCharged, balance, minutesLeft }

  // Chat
  CHAT_MESSAGE: "chat:message",
  CHAT_TYPING: "chat:typing", // { sessionId, role, isTyping }
  CHAT_DELIVERED: "chat:delivered",
  CHAT_READ: "chat:read",

  // Waitlist
  QUEUE_JOINED: "queue:joined",
  QUEUE_POSITION: "queue:position", // { entryId, position, total, estimatedWaitSec }
  QUEUE_OFFER: "queue:offer", // your turn { entryId, mode, expiresAt, seconds, astrologer }
  QUEUE_ACCEPTED: "queue:accepted", // { entryId, sessionId, status }
  QUEUE_SKIPPED: "queue:skipped", // offer expired / declined / not possible { entryId, reason, suggestions }
  QUEUE_CLEARED: "queue:cleared", // the astrologer cleared the list or went offline { entryId, reason, suggestions }

  // Wallet / notifications / account
  WALLET_LOW: "wallet:low", // { sessionId, balance, minutesLeft, ratePerMin, endsInSeconds } or { freeSession: true, minutesLeft }
  WALLET_UPDATED: "wallet:updated", // { balance }
  NOTIFICATION: "notification:new", // carries an id for dedupe with web push
  AUTH_SIGNED_OUT: "auth:signed_out", // { reason: "signed_in_elsewhere" } — the socket is disconnected right after
};

/** Client → server (acknowledged: `ack({ ok, data | error })`). */
export const CLIENT_EVENTS = {
  CHAT_SEND: "chat:send", // { sessionId, clientMsgId, text }
  CHAT_TYPING: "chat:typing", // { sessionId, isTyping }
  CHAT_READ: "chat:read", // { sessionId, messageIds }
  SESSION_JOIN: "session:join", // { sessionId } — (re)join the room after load / reconnect
  SESSION_END: "session:end", // { sessionId }
  SESSION_CANCEL: "session:cancel", // { sessionId } — cancel a pending request
  QUEUE_ACCEPT: "queue:accept", // { entryId }
  QUEUE_DECLINE: "queue:decline", // { entryId }
  QUEUE_LEAVE: "queue:leave", // { entryId }
  PRESENCE_HEARTBEAT: "presence:heartbeat", // every ~30s while connected
};

/** Reason carried by AUTH_SIGNED_OUT (and the HTTP 401 code SIGNED_IN_ELSEWHERE): one signed-in device per account. */
export const SIGNED_IN_ELSEWHERE = "signed_in_elsewhere";
