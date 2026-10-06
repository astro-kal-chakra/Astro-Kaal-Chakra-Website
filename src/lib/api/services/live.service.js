import { env } from "@/config/site";
import { getSocket } from "@/lib/socket/client";
import { http, mockDelay } from "../http";
import { MOCK_ASTROLOGERS } from "../mock/astrologers";
import { __mockWallet } from "./wallet.service";
import { MOCK_LIVE_CHAT, MOCK_LIVE_GIFTS, MOCK_LIVE_SESSIONS } from "../mock/live";

/**
 * Live session socket events.
 * TODO(api): move into src/lib/socket/events.js once the backend contract is final.
 */
export const LIVE_EVENTS = {
  JOIN: "live:join", // { sessionId }
  LEAVE: "live:leave",
  MESSAGE: "live:message", // { id, user, text, at, kind: "chat" | "question" | "gift", giftId? }
  VIEWERS: "live:viewers", // { count }
  ENDED: "live:ended",
};

/** Public astrologer info only — never contact details. */
const toAstrologer = (slug) => {
  const a = MOCK_ASTROLOGERS.find((x) => x.slug === slug);
  return a
    ? { id: a.id, slug: a.slug, name: a.name, avatarUrl: a.avatarUrl, specialties: a.specialties, languages: a.languages, rating: a.rating, isVerified: a.isVerified }
    : null;
};

const localize = (s, locale) => {
  const { en, hi, astrologerSlug, startedMinutesAgo, startsInMinutes, ...rest } = s;
  const now = Date.now();
  return {
    ...rest,
    ...((locale === "hi" ? hi : en) || en),
    astrologer: toAstrologer(astrologerSlug),
    startedAt: startedMinutesAgo != null ? new Date(now - startedMinutesAgo * 60_000).toISOString() : null,
    startsAt: startsInMinutes != null ? new Date(now + startsInMinutes * 60_000).toISOString() : null,
  };
};

// Mock mode shares the wallet service's mock store, so balances match across the site.
// The real balance is always server-authoritative (wallet:updated socket event).
const mockCharge = (amount, title = "Live session") => {
  try {
    const balance = __mockWallet.debit({ amount, title, meta: { source: "live" } });
    return mockDelay({ ok: true, charged: amount, balance }, 500);
  } catch (e) {
    return Promise.reject(e);
  }
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const liveService = {
  /** @returns {Promise<{ live: object[], upcoming: object[] }>} */
  async list(locale = "en") {
    if (env.useMocks) {
      const all = MOCK_LIVE_SESSIONS.map((s) => localize(s, locale));
      return mockDelay(
        {
          live: all.filter((s) => s.status === "live").sort((a, b) => b.viewers - a.viewers),
          upcoming: all.filter((s) => s.status === "upcoming").sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
        },
        80
      );
    }
    return http("/live", { query: { locale }, cache: "no-store" });
  },

  async get(id, locale = "en") {
    if (env.useMocks) {
      const s = MOCK_LIVE_SESSIONS.find((x) => x.id === id);
      return s ? localize(s, locale) : null;
    }
    return http(`/live/${id}`, { query: { locale }, cache: "no-store" }).catch((e) => {
      if (e.status === 404) return null;
      throw e;
    });
  },

  async getGifts() {
    if (env.useMocks) return MOCK_LIVE_GIFTS;
    return http("/live/gifts", { next: { revalidate: 3600 } });
  },

  async getBalance() {
    if (env.useMocks) return mockDelay({ balance: __mockWallet.read().balance }, 100);
    return http("/wallet");
  },

  async sendMessage(sessionId, text) {
    if (env.useMocks) return mockDelay({ id: `m_${Date.now()}`, text, at: new Date().toISOString() }, 150);
    return http(`/live/${sessionId}/messages`, { method: "POST", body: { text } });
  },

  /** Paid question — debited from the wallet on the server. */
  async askQuestion(sessionId, { text, price, idempotencyKey }) {
    if (env.useMocks) return mockCharge(price);
    return http(`/live/${sessionId}/questions`, { method: "POST", body: { text }, headers: { "Idempotency-Key": idempotencyKey } });
  },

  async sendGift(sessionId, { giftId, price, idempotencyKey }) {
    if (env.useMocks) return mockCharge(price);
    return http(`/live/${sessionId}/gifts`, { method: "POST", body: { giftId }, headers: { "Idempotency-Key": idempotencyKey } });
  },

  async remind(sessionId) {
    if (env.useMocks) return mockDelay({ reminded: true });
    return http(`/live/${sessionId}/remind`, { method: "POST" });
  },

  /**
   * Subscribe to room events. Calls onEvent({ type: "message" | "viewers", ... }).
   * In mock mode it simulates incoming chat, gifts and viewer count changes.
   * @returns {() => void} unsubscribe
   */
  subscribe(sessionId, { locale = "en", initialViewers = 100 } = {}, onEvent) {
    const socket = getSocket();
    if (socket) {
      const onMessage = (m) => onEvent({ type: "message", message: m });
      const onViewers = ({ count }) => onEvent({ type: "viewers", count });
      const onEnded = () => onEvent({ type: "ended" });
      // Join now and again after every reconnect (the server forgets room membership on disconnect)
      const join = () => socket.emit(LIVE_EVENTS.JOIN, { sessionId });
      if (socket.connected) join();
      socket.on("connect", join);
      socket.on(LIVE_EVENTS.MESSAGE, onMessage);
      socket.on(LIVE_EVENTS.VIEWERS, onViewers);
      socket.on(LIVE_EVENTS.ENDED, onEnded);
      return () => {
        socket.emit(LIVE_EVENTS.LEAVE, { sessionId });
        socket.off("connect", join);
        socket.off(LIVE_EVENTS.MESSAGE, onMessage);
        socket.off(LIVE_EVENTS.VIEWERS, onViewers);
        socket.off(LIVE_EVENTS.ENDED, onEnded);
      };
    }
    if (!env.useMocks) return () => {};

    const texts = MOCK_LIVE_CHAT[locale] || MOCK_LIVE_CHAT.en;
    let viewers = initialViewers;
    let timer;
    const tick = () => {
      const roll = Math.random();
      const base = { id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, user: pick(MOCK_LIVE_CHAT.users), at: new Date().toISOString() };
      if (roll < 0.12) onEvent({ type: "message", message: { ...base, kind: "gift", giftId: pick(MOCK_LIVE_GIFTS).id } });
      else onEvent({ type: "message", message: { ...base, kind: "chat", text: pick(texts) } });
      if (roll > 0.6) {
        viewers = Math.max(1, viewers + Math.round((Math.random() - 0.4) * 25));
        onEvent({ type: "viewers", count: viewers });
      }
      timer = setTimeout(tick, 1500 + Math.random() * 2500);
    };
    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  },
};
