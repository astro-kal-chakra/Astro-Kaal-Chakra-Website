/**
 * Session-specific constants shared by the UI, the service and the mock engine.
 * Event names come from src/lib/socket/events.js (SOCKET_EVENTS / CLIENT_EVENTS).
 * Defaults mirror the backend settings; the server's values always win.
 */

/** Why a session ended — UI codes (see normalizeEndReason for the backend values). */
export const END_REASONS = {
  USER: "user",
  ASTROLOGER: "astrologer",
  ADMIN: "admin",
  BALANCE: "balance",
  FREE_OVER: "free_over",
};

/** Backend endReason → UI code (e.g. "ended_by_user" → "user", "balance_over" → "balance"). */
const BACKEND_END_REASONS = {
  ended_by_user: END_REASONS.USER,
  user_disconnected: END_REASONS.USER,
  ended_by_astrologer: END_REASONS.ASTROLOGER,
  astrologer_disconnected: END_REASONS.ASTROLOGER,
  ended_by_support: END_REASONS.ADMIN,
  user_blocked: END_REASONS.ADMIN,
  astrologer_block: END_REASONS.ADMIN,
  balance_over: END_REASONS.BALANCE,
  bonus_expired: END_REASONS.BALANCE,
  free_over: END_REASONS.FREE_OVER,
};
export const normalizeEndReason = (reason) => BACKEND_END_REASONS[reason] || reason;

/** Backend modes: voice calls are "call". */
export const SESSION_MODES = { CHAT: "chat", CALL: "call", VIDEO: "video" };

/** Paid sessions need max(₹50, 5 minutes of the rate) in the wallet (backend minWalletBalance / minSessionMinutes). */
export const MIN_BALANCE_MINUTES = 5;
export const MIN_WALLET_BALANCE = 50;
export const minBalanceFor = (ratePerMin) => Math.max(MIN_WALLET_BALANCE, ratePerMin * MIN_BALANCE_MINUTES);
/** The backend warns (wallet:low) when fewer than this many prepaid minutes are left. */
export const LOW_BALANCE_MINUTES = 2;
/** The astrologer has this long to accept a request (backend requestTimeoutSeconds). */
export const REQUEST_TIMEOUT_SECONDS = 30;
/** Window the user has to accept or decline when their waitlist turn comes (backend queue.offerSeconds). */
export const QUEUE_ACCEPT_SECONDS = 60;
/** Free first chat: chat only, once per account and device (backend freeChat.minutes). */
export const FREE_CHAT_MINUTES = 3;
export const MESSAGE_MAX_LENGTH = 1000;
export const REVIEW_MAX_LENGTH = 500;

/** System message codes rendered (and translated) by the client. */
export const SYSTEM_MESSAGES = {
  STARTED: "session_started",
  FREE_STARTED: "free_started",
  FREE_ENDED: "free_ended",
  RECONNECTED: "reconnected",
};
