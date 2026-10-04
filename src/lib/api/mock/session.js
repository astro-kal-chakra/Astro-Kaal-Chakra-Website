/**
 * Mock persistence for consultation sessions (removed once the backend is live).
 * Records live in localStorage so a page reload mid-session behaves like the
 * real app (the server keeps the session; the browser just re-joins).
 *
 * Shape of a session record mirrors what GET /user/sessions/:id should return
 * (mode chat | call | video, status pending | active | completed | rejected | missed |
 * cancelled | failed, durationSec, billedMinutes, totalCharged, unusedReturned).
 */

import { __mockWallet } from "../services/wallet.service";

const SESSIONS_KEY = "mock_sessions";
const MESSAGES_KEY = "mock_session_messages";
const USER_KEY = "mock_user";

const canUseStorage = () => typeof window !== "undefined";

const readJson = (key, fallback) => {
  if (!canUseStorage()) return fallback;
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const mockId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* ---------------------------------- Sessions --------------------------------- */

export function getMockSession(id) {
  return readJson(SESSIONS_KEY, {})[id] || null;
}

export function saveMockSession(record) {
  const all = readJson(SESSIONS_KEY, {});
  all[record.id] = record;
  writeJson(SESSIONS_KEY, all);
  return record;
}

export function updateMockSession(id, patch) {
  const current = getMockSession(id);
  if (!current) return null;
  return saveMockSession({ ...current, ...patch });
}

/* ---------------------------------- Messages --------------------------------- */

export function getMockMessages(sessionId) {
  return readJson(MESSAGES_KEY, {})[sessionId] || [];
}

export function upsertMockMessage(sessionId, message) {
  const all = readJson(MESSAGES_KEY, {});
  const list = all[sessionId] || [];
  const i = list.findIndex((m) => m.id === message.id);
  if (i >= 0) list[i] = { ...list[i], ...message };
  else list.push(message);
  all[sessionId] = list;
  writeJson(MESSAGES_KEY, all);
  return message;
}

export function markMockMessages(sessionId, ids, status) {
  const all = readJson(MESSAGES_KEY, {});
  all[sessionId] = (all[sessionId] || []).map((m) => (ids.includes(m.id) ? { ...m, status } : m));
  writeJson(MESSAGES_KEY, all);
}

/* ------------------------------- Wallet / user ------------------------------- */

/** Shares the wallet service's mock store so balances match across wallet, header, live and sessions. */
export function getMockBalance() {
  return __mockWallet.read().balance;
}

export function setMockBalance(value) {
  const store = __mockWallet.read();
  store.balance = Math.max(0, Math.round(value * 100) / 100);
  __mockWallet.write(store);
}

/**
 * Wallet history line for a finished paid session: the exact amount used (billed by
 * the second). The held-then-returned part never shows as a charge.
 */
export function recordMockConsultation(record) {
  if (record.isFree || !(record.totalCharged > 0)) return;
  const store = __mockWallet.read();
  store.txns.push({
    id: `txn_${record.id}`,
    type: "consultation",
    amount: -record.totalCharged,
    status: "success",
    createdAt: record.endedAt || Date.now(),
    meta: {
      astrologer: record.astrologer?.name,
      mode: record.mode,
      durationSec: record.durationSec,
      ratePerMin: record.ratePerMin,
      unusedReturned: record.unusedReturned,
    },
  });
  __mockWallet.write(store);
}

/** The free first chat is one per account / device — persist it on the mock user. */
export function consumeMockFreeChat() {
  const user = readJson(USER_KEY, null);
  if (user) writeJson(USER_KEY, { ...user, freeChatAvailable: false });
}
