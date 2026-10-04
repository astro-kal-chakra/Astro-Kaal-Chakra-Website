import { env } from "@/config/site";
import { http, mockDelay, ApiError } from "../http";
import {
  getMockBalance,
  getMockMessages,
  getMockSession,
  mockId,
  saveMockSession,
  updateMockSession,
} from "../mock/session";
import { mockSessionEngine } from "@/features/session/lib/mockSessionEngine";
import { FREE_CHAT_MINUTES, REQUEST_TIMEOUT_SECONDS, minBalanceFor } from "@/features/session/lib/sessionEvents";

const pick = (a) => ({
  id: a.id,
  slug: a.slug,
  name: a.name,
  avatarUrl: a.avatarUrl,
  specialties: a.specialties,
  languages: a.languages,
  rating: a.rating,
  experienceYears: a.experienceYears,
});

/** ₹/min for a mode ("chat" | "call" | "video") — the astrologer's own price per mode. */
export const priceFor = (astrologer, mode) =>
  mode === "chat" ? astrologer.chatPrice : mode === "call" ? astrologer.callPrice : astrologer.videoPrice;

/** Modes this astrologer offers (chat always; call / video when enabled). */
export const modesFor = (astrologer) => [
  "chat",
  ...(astrologer.supportsCall !== false ? ["call"] : []),
  ...(astrologer.supportsVideo ? ["video"] : []),
];

const readMockUser = () => {
  try {
    return JSON.parse(localStorage.getItem("mock_user"));
  } catch {
    return null;
  }
};

const notFound = () => new ApiError("Session not found", { status: 404, code: "SESSION_NOT_FOUND" });

/**
 * Consultation sessions. Actions go over HTTP; live updates (session:start,
 * session:tick, wallet:low, messages, queue:offer) arrive as socket events —
 * see useSessionTransport(). Charging is server-side only: each started minute
 * is held from the wallet, the user pays the exact time by the second and the
 * unused part is returned when the session ends.
 *
 * Start rules (backend settings): a paid session needs max(₹50, 5 minutes of the
 * rate); the astrologer has 30 seconds to accept; the free first chat is 3 minutes,
 * chat only, once per account / device.
 */
export const sessionService = {
  /** Wallet balance + free-chat eligibility for the pre-session screen (GET /user/sessions/precheck). */
  async getPreSession() {
    if (env.useMocks) {
      const user = readMockUser();
      return mockDelay({
        balance: getMockBalance(),
        freeChatAvailable: user?.freeChatAvailable !== false,
        freeMinutes: FREE_CHAT_MINUTES,
      }, 200);
    }
    return http("/sessions/pre-check", { cache: "no-store" });
  },

  /**
   * Send a consultation request to an astrologer.
   * @param {{ astrologer: object, mode: "chat"|"call"|"video", useFreeChat: boolean, idempotencyKey: string, simulate?: string }} p
   * @returns {Promise<{ sessionId: string, status: "pending", expiresInSec: number }>}
   */
  async request({ astrologer, mode, useFreeChat, idempotencyKey, simulate }) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const record = buildMockRecord({ astrologer, mode, useFreeChat });
      if (!record.isFree && getMockBalance() < minBalanceFor(record.ratePerMin)) {
        throw new ApiError("Insufficient balance", { status: 402, code: "INSUFFICIENT_BALANCE" });
      }
      saveMockSession(record);
      const expiresInSec = REQUEST_TIMEOUT_SECONDS;
      mockSessionEngine.simulateRequest(record.id, { outcome: simulate, expiresInSec });
      return { sessionId: record.id, status: "pending", expiresInSec };
    }
    return http("/sessions", {
      method: "POST",
      body: { astrologerId: astrologer.id, mode, useFreeChat },
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  async cancelRequest(sessionId) {
    if (env.useMocks) {
      mockSessionEngine.cancelRequest(sessionId);
      return mockDelay({ ok: true }, 200);
    }
    return http(`/sessions/${sessionId}/cancel`, { method: "POST" });
  },

  /** @returns {Promise<object>} session incl. astrologer, mode, status, startedAt, ratePerMin, isFree, freeMinutes, billedMinutes */
  async get(sessionId) {
    if (env.useMocks) {
      await mockDelay(null, 150);
      const record = getMockSession(sessionId);
      if (!record) throw notFound();
      return record;
    }
    return http(`/sessions/${sessionId}`, { cache: "no-store" });
  },

  async getMessages(sessionId) {
    if (env.useMocks) return mockDelay(getMockMessages(sessionId), 150);
    return http(`/sessions/${sessionId}/messages`, { cache: "no-store" });
  },

  async end(sessionId) {
    if (env.useMocks) {
      await mockDelay(null, 300);
      return mockSessionEngine.end(sessionId, "user");
    }
    return http(`/sessions/${sessionId}/end`, { method: "POST" });
  },

  /** Agora join credentials — token is minted server-side per session. */
  async getRtcCredentials(sessionId) {
    if (env.useMocks) return mockDelay({ appId: "mock", channel: sessionId, token: "mock-token", uid: 1 }, 200);
    return http(`/sessions/${sessionId}/rtc-token`, { method: "POST" });
  },

  /* --------------------------------- Waitlist -------------------------------- */

  /**
   * Join a busy astrologer's waitlist. When it's the user's turn the server sends
   * queue:offer, and they have 60 seconds to accept or decline.
   * @returns {Promise<{ entryId: string, position: number, estimatedWaitSec: number }>}
   */
  async joinQueue({ astrologer, mode, useFreeChat }) {
    if (env.useMocks) {
      await mockDelay(null, 400);
      const entryId = mockId("q");
      const position = Math.max(2, (astrologer.queueCount || 2) + 1);
      mockSessionEngine.startQueue(entryId, { astrologer, mode, useFreeChat, position });
      return { entryId, position, estimatedWaitSec: position * 4 * 60 };
    }
    return http("/queue", { method: "POST", body: { astrologerId: astrologer.id, mode, useFreeChat } });
  },

  async leaveQueue(entryId) {
    if (env.useMocks) {
      mockSessionEngine.leaveQueue(entryId);
      return mockDelay({ ok: true }, 200);
    }
    return http(`/queue/${entryId}`, { method: "DELETE" });
  },

  /** Accept the turn offer — returns the started session. */
  async acceptTurn(entryId, { astrologer, mode, useFreeChat }) {
    if (env.useMocks) {
      await mockDelay(null, 400);
      const record = buildMockRecord({ astrologer, mode, useFreeChat });
      const started = mockSessionEngine.acceptTurn(entryId, record);
      if (!started) throw new ApiError("Turn expired", { status: 410, code: "QUEUE_EXPIRED" });
      if (started.status !== "active") throw new ApiError("Insufficient balance", { status: 402, code: "INSUFFICIENT_BALANCE" });
      return { sessionId: started.id, mode: started.mode };
    }
    return http(`/queue/${entryId}/accept`, { method: "POST" });
  },

  /** Decline the turn offer — the next person in line gets it. */
  async declineTurn(entryId) {
    if (env.useMocks) {
      mockSessionEngine.declineTurn(entryId);
      return mockDelay({ ok: true }, 200);
    }
    return http(`/queue/${entryId}/decline`, { method: "POST" });
  },

  /* --------------------------------- Summary --------------------------------- */

  /** @returns {Promise<{ session: object, review: object|null }>} */
  async getSummary(sessionId) {
    if (env.useMocks) {
      await mockDelay(null, 250);
      const record = getMockSession(sessionId);
      if (!record) throw notFound();
      // The server closes sessions whose tab was abandoned; mimic that here.
      if (record.status === "active") mockSessionEngine.end(sessionId, "user");
      const session = getMockSession(sessionId);
      return { session, review: session.review || null };
    }
    return http(`/sessions/${sessionId}/summary`, { cache: "no-store" });
  },

  async submitReview(sessionId, { rating, text }) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const review = { rating, text, createdAt: Date.now() };
      updateMockSession(sessionId, { review });
      return review;
    }
    return http(`/sessions/${sessionId}/review`, { method: "POST", body: { rating, text } });
  },
};

function buildMockRecord({ astrologer, mode, useFreeChat }) {
  const isFree = Boolean(useFreeChat && mode === "chat"); // the free first chat is chat only
  return {
    id: mockId("s"),
    mode,
    status: "pending",
    astrologer: pick(astrologer),
    ratePerMin: isFree ? 0 : priceFor(astrologer, mode),
    isFree,
    freeMinutes: isFree ? FREE_CHAT_MINUTES : 0,
    createdAt: Date.now(),
    startedAt: null,
    billedMinutes: 0,
    totalHeld: 0,
  };
}
