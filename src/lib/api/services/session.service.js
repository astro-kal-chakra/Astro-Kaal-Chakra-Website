import { env } from "@/config/site";
import { http, mockDelay, ApiError } from "../http";
import {
  MOCK_FREE_CHAT_SECONDS,
  getMockBalance,
  getMockMessages,
  getMockSession,
  mockId,
  saveMockSession,
  updateMockSession,
} from "../mock/session";
import { mockSessionEngine } from "@/features/session/lib/mockSessionEngine";

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

/** Voice calls use the video rate unless the backend sends a separate voice price. */
export const priceFor = (astrologer, mode) =>
  mode === "chat" ? astrologer.chatPrice : mode === "voice" ? (astrologer.voicePrice ?? astrologer.videoPrice) : astrologer.videoPrice;

const readMockUser = () => {
  try {
    return JSON.parse(localStorage.getItem("mock_user"));
  } catch {
    return null;
  }
};

const notFound = () => new ApiError("Session not found", { status: 404, code: "SESSION_NOT_FOUND" });

/**
 * Consultation sessions. Actions go over HTTP; live updates (accept, billing,
 * messages, queue position) arrive as socket events — see useSessionTransport().
 * Charging is server-side only: nothing here computes what the user pays.
 */
export const sessionService = {
  /** Wallet balance + free-chat eligibility for the pre-session screen. */
  async getPreSession() {
    if (env.useMocks) {
      const user = readMockUser();
      return mockDelay({
        balance: getMockBalance(),
        freeChatAvailable: user?.freeChatAvailable !== false,
        freeChatSeconds: MOCK_FREE_CHAT_SECONDS,
      }, 200);
    }
    return http("/sessions/pre-check", { cache: "no-store" });
  },

  /**
   * Send a consultation request to an astrologer.
   * @param {{ astrologer: object, mode: "chat"|"video"|"voice", useFreeChat: boolean, idempotencyKey: string, simulate?: string }} p
   * @returns {Promise<{ sessionId: string, status: "pending", expiresInSec: number }>}
   */
  async request({ astrologer, mode, useFreeChat, idempotencyKey, simulate }) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const record = buildMockRecord({ astrologer, mode, useFreeChat });
      saveMockSession(record);
      const expiresInSec = 20;
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

  /** @returns {Promise<object>} session incl. astrologer, mode, status, startedAt, ratePerMin, isFree, freeSeconds */
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

  /** @returns {Promise<{ queueId: string, position: number, estimatedWaitSec: number }>} */
  async joinQueue({ astrologer, mode, useFreeChat }) {
    if (env.useMocks) {
      await mockDelay(null, 400);
      const queueId = mockId("q");
      const position = Math.max(2, (astrologer.queueCount || 2) + 1);
      mockSessionEngine.startQueue(queueId, { astrologer, mode, useFreeChat, position });
      return { queueId, position, estimatedWaitSec: position * 4 * 60 };
    }
    return http("/queue", { method: "POST", body: { astrologerId: astrologer.id, mode, useFreeChat } });
  },

  async leaveQueue(queueId) {
    if (env.useMocks) {
      mockSessionEngine.leaveQueue(queueId);
      return mockDelay({ ok: true }, 200);
    }
    return http(`/queue/${queueId}`, { method: "DELETE" });
  },

  /** Accept "your turn" — returns the started session. */
  async acceptTurn(queueId, { astrologer, mode, useFreeChat }) {
    if (env.useMocks) {
      await mockDelay(null, 400);
      const record = buildMockRecord({ astrologer, mode, useFreeChat });
      const started = mockSessionEngine.acceptTurn(queueId, record);
      if (!started) throw new ApiError("Turn expired", { status: 410, code: "QUEUE_EXPIRED" });
      return { sessionId: started.id, mode: started.mode };
    }
    return http(`/queue/${queueId}/accept`, { method: "POST" });
  },

  /* --------------------------------- Summary --------------------------------- */

  /** @returns {Promise<{ session: object, review: object|null }>} */
  async getSummary(sessionId) {
    if (env.useMocks) {
      await mockDelay(null, 250);
      const record = getMockSession(sessionId);
      if (!record) throw notFound();
      // The server closes sessions whose tab was abandoned; mimic that here.
      if (record.status !== "ended") mockSessionEngine.end(sessionId, "user");
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
  const isFree = Boolean(useFreeChat && mode === "chat");
  return {
    id: mockId("s"),
    mode,
    status: "pending",
    astrologer: pick(astrologer),
    ratePerMin: priceFor(astrologer, mode),
    isFree,
    freeSeconds: isFree ? MOCK_FREE_CHAT_SECONDS : 0,
    createdAt: Date.now(),
    startedAt: null,
  };
}
