import { SESSION_MODES } from "./sessionEvents";

const ALL = Object.values(SESSION_MODES);

/** Validate a ?mode= query value (chat | call | video), defaulting to chat. Old "voice" links mean "call". */
export const normalizeMode = (value, fallback = SESSION_MODES.CHAT) =>
  value === "voice" ? SESSION_MODES.CALL : ALL.includes(value) ? value : fallback;
