import { env } from "@/config/site";
import { http, mockDelay } from "../http";
import { MOCK_SESSIONS, mockStore, mockTranscript } from "../mock/account";

const sessionsStore = mockStore("sessions", MOCK_SESSIONS);

/** Past consultations of the logged-in user. Billing amounts always come from the backend. */
export const sessionHistoryService = {
  /** @param {{ type?: "all" | "chat" | "call", page?: number, pageSize?: number }} opts */
  async list({ type = "all", page = 1, pageSize = 20 } = {}) {
    if (env.useMocks) {
      const all = sessionsStore
        .get()
        .filter((s) => type === "all" || s.type === type)
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
      return mockDelay({ items: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize });
    }
    return http("/me/sessions", { query: { type: type === "all" ? undefined : type, page, pageSize } });
  },

  async getTranscript(sessionId) {
    if (env.useMocks) {
      const session = sessionsStore.get().find((s) => s.id === sessionId);
      return mockDelay(session ? mockTranscript(session) : [], 350);
    }
    return http(`/me/sessions/${sessionId}/transcript`);
  },
};
