/**
 * Session-specific constants shared by the UI, the service and the mock engine.
 * Server → client event names come from SOCKET_EVENTS (src/lib/socket/events.js).
 */

/**
 * Client → server events that are not (yet) in SOCKET_EVENTS.
 * TODO(backend): confirm names and move them into src/lib/socket/events.js.
 */
export const SESSION_CLIENT_EVENTS = {
  JOIN: "session:join", // { sessionId } — (re)join the room after load / reconnect
  LEAVE: "session:leave", // { sessionId }
};

/** Reasons carried by SOCKET_EVENTS.SESSION_ENDED. */
export const END_REASONS = {
  USER: "user",
  ASTROLOGER: "astrologer",
  ADMIN: "admin",
  BALANCE: "balance",
};

export const SESSION_MODES = { CHAT: "chat", VIDEO: "video", VOICE: "voice" };

/** Minimum balance needed to start a paid session, in minutes of the per-minute rate. */
export const MIN_BALANCE_MINUTES = 5;
/** Show the low-balance warning when this many seconds (or fewer) remain. */
export const LOW_BALANCE_SECONDS = 120;
/** Window the user has to accept when their waitlist turn comes. */
export const QUEUE_ACCEPT_SECONDS = 30;
export const MESSAGE_MAX_LENGTH = 1000;
export const REVIEW_MAX_LENGTH = 500;

/** System message codes rendered (and translated) by the client. */
export const SYSTEM_MESSAGES = {
  STARTED: "session_started",
  FREE_STARTED: "free_started",
  FREE_ENDED: "free_ended",
  RECONNECTED: "reconnected",
};
