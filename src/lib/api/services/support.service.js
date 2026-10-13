import { env } from "@/config/site";
import { http, mockDelay, mockPage } from "../http";
import { mockId, mockStore } from "../mock/account";
import { MOCK_TICKETS } from "../mock/account-support";

const ticketsStore = mockStore("tickets", MOCK_TICKETS);

export const SUPPORT_CATEGORIES = ["payment", "refund", "session", "technical", "account", "other"];
export const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"];
export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

/** Strip File objects to metadata in mock mode (real mode uploads first via a signed URL). */
const toMeta = (files = []) => files.map((f) => ({ name: f.name, size: f.size }));

export const supportService = {
  /** One page of the user's tickets, most recently updated first: { items, total, page, pageSize, hasMore }. */
  async listTickets({ page = 1, pageSize = 10 } = {}) {
    if (env.useMocks) {
      const list = ticketsStore.get().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      // List endpoint returns a summary without the full thread.
      return mockDelay(mockPage(list.map(({ messages, ...t }) => ({ ...t, messageCount: messages.length })), page, pageSize));
    }
    return http("/support/tickets", { query: { page, pageSize } });
  },

  async getTicket(id) {
    if (env.useMocks) return mockDelay(ticketsStore.get().find((t) => t.id === id) || null);
    return http(`/support/tickets/${id}`).catch((e) => {
      if (e.status === 404) return null;
      throw e;
    });
  },

  /**
   * @param {{ category: string, sessionId?: string, subject: string, message: string, attachments?: File[] }} input
   * TODO(api): upload attachments to a signed URL and send their ids.
   */
  async createTicket({ category, sessionId, subject, message, attachments = [] }) {
    if (env.useMocks) {
      const now = new Date().toISOString();
      const ticket = {
        id: `TCK-${20600 + Math.floor(Math.random() * 300)}`,
        category,
        sessionId: sessionId || null,
        subject,
        status: "open",
        createdAt: now,
        updatedAt: now,
        messages: [{ id: mockId("tm"), from: "user", text: message, at: now, attachments: toMeta(attachments) }],
      };
      ticketsStore.update((list) => [ticket, ...list]);
      return mockDelay(ticket, 600);
    }
    return http("/support/tickets", { method: "POST", body: { category, sessionId, subject, message } });
  },

  async reply(ticketId, { message, attachments = [] }) {
    if (env.useMocks) {
      const now = new Date().toISOString();
      const msg = { id: mockId("tm"), from: "user", text: message, at: now, attachments: toMeta(attachments) };
      const list = ticketsStore.update((all) =>
        all.map((t) =>
          t.id === ticketId
            ? { ...t, status: t.status === "resolved" ? "open" : t.status, updatedAt: now, messages: [...t.messages, msg] }
            : t
        )
      );
      return mockDelay(list.find((t) => t.id === ticketId), 400);
    }
    return http(`/support/tickets/${ticketId}/messages`, { method: "POST", body: { message } });
  },
};
