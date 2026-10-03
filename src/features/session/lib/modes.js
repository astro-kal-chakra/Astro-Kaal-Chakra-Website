import { SESSION_MODES } from "./sessionEvents";

const ALL = Object.values(SESSION_MODES);

/** Validate a ?mode= query value, defaulting to chat. */
export const normalizeMode = (value, fallback = SESSION_MODES.CHAT) => (ALL.includes(value) ? value : fallback);
