/** Socket.io event names — keep in sync with the backend and the mobile app. */
export const SOCKET_EVENTS = {
  // Presence
  ASTROLOGER_STATUS: "astrologer:status", // { astrologerId, status, queueCount }
  SUBSCRIBE_PRESENCE: "presence:subscribe", // [astrologerId]
  UNSUBSCRIBE_PRESENCE: "presence:unsubscribe",

  // Session lifecycle
  SESSION_REQUEST: "session:request",
  SESSION_ACCEPTED: "session:accepted",
  SESSION_REJECTED: "session:rejected",
  SESSION_TIMEOUT: "session:timeout",
  SESSION_ENDED: "session:ended", // { reason: "user" | "astrologer" | "admin" | "balance" }
  SESSION_BILLING: "session:billing", // server-authoritative { elapsed, balance, lowBalance }

  // Chat
  CHAT_MESSAGE: "chat:message",
  CHAT_TYPING: "chat:typing",
  CHAT_DELIVERED: "chat:delivered",
  CHAT_READ: "chat:read",

  // Queue
  QUEUE_JOIN: "queue:join",
  QUEUE_LEAVE: "queue:leave",
  QUEUE_POSITION: "queue:position",
  QUEUE_YOUR_TURN: "queue:your_turn",
  QUEUE_EXPIRED: "queue:expired",

  // Wallet / notifications
  WALLET_UPDATED: "wallet:updated",
  NOTIFICATION: "notification", // carries an id for dedupe with web push
};
