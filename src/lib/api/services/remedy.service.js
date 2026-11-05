import { env } from "@/config/site";
import { ApiError, http, mockDelay, mockPage } from "../http";
import { MOCK_ASTROLOGERS } from "../mock/astrologers";
import { mockStore } from "../mock/account";
import { MOCK_REMEDIES, MOCK_REMEDY_CONFIG, mockAstroCard } from "../mock/remedies";
import { __mockWallet } from "./wallet.service";

/**
 * Paid remedies ("Get a remedy"): the user pays one fixed price from the wallet and the chosen astrologer
 * replies with a written remedy within `deliveryHours`, or the user is refunded automatically.
 * Website API: /web/remedies (cookie auth, money in rupees). The whole feature is hidden while
 * `config.enabled` is false (switched on from the dashboard).
 *
 * Statuses: pending | delivered | declined | expired | cancelled | refunded.
 */

export const REMEDY_QUESTION_MIN = 10;
export const REMEDY_QUESTION_MAX = 1000;
export const REMEDY_FOLLOW_UP_MIN = 3;
export const REMEDY_FOLLOW_UP_MAX = 500;
export const REMEDY_REVIEW_MAX = 500;

/** List tabs: open = waiting for the astrologer, done = answered or closed. */
export const REMEDY_TABS = ["all", "open", "done"];

// --- Mock store ------------------------------------------------------------
const HOUR = 3600_000;
const DAY = 24 * HOUR;
const remediesStore = mockStore("remedies", MOCK_REMEDIES);
const idemStore = mockStore("remedies_idem", () => ({}));

/** The flags the backend computes for the user view. */
const withFlags = (r) => {
  const delivered = r.status === "delivered";
  const { openedAt, ...out } = r;
  return {
    ...out,
    canCancel: r.status === "pending" && !openedAt,
    canFollowUp: delivered && !r.followUp && Date.now() - new Date(r.deliveredAt).getTime() <= MOCK_REMEDY_CONFIG.followUpDays * DAY,
    canRate: delivered && !r.rating,
  };
};

const mockFind = (id) => {
  const r = remediesStore.get().find((x) => x.id === id);
  if (!r) throw new ApiError("Remedy not found", { status: 404, code: "NOT_FOUND" });
  return r;
};

const mockSave = (id, patch) => {
  let saved;
  remediesStore.update((list) => list.map((x) => (x.id === id ? (saved = { ...x, ...patch }) : x)));
  return saved;
};

/** Credit the price back to the mock wallet (cancelled / refunded), shown as a normal refund. */
function mockRefund(r) {
  const s = __mockWallet.read();
  s.balance = Math.round((s.balance + r.price) * 100) / 100;
  s.txns.push({
    id: `txn_${crypto.randomUUID().slice(0, 8)}`,
    type: "refund",
    amount: r.price,
    status: "success",
    createdAt: Date.now(),
    meta: { reason: `Remedy refund (${r.code})` },
  });
  __mockWallet.write(s);
  return s.balance;
}

// ---------------------------------------------------------------------------

export const remedyService = {
  /**
   * Is "Get a remedy" on, and is this astrologer taking requests?
   * @returns {{ enabled, available, price, deliveryHours, followUpDays, categories: string[], itemTypes: string[] }}
   */
  async getConfig(astrologerId) {
    if (env.useMocks) return mockDelay({ ...MOCK_REMEDY_CONFIG }, 200);
    return http("/remedies/config", { query: { astrologerId }, cache: "no-store" });
  },

  /**
   * Ask for a remedy and pay for it. `idempotencyKey` is reused when retrying the same attempt, so a
   * double tap or a retry after a dropped connection is never charged twice.
   * Errors (ApiError.code): INSUFFICIENT_BALANCE (402, data.balance / data.minRequired), REMEDIES_OFF (403),
   * NOT_ACCEPTING / ASTRO_BUSY / TOO_MANY_PENDING (409), BIRTH_DETAILS_REQUIRED / PROFILE_NOT_FOUND (400),
   * VALIDATION_ERROR (422).
   * @returns {{ remedy: object, balance?: number }}
   */
  async create({ astrologerId, profileId, category, question, language, idempotencyKey }) {
    if (env.useMocks) {
      await mockDelay(null, 700);
      const idem = idemStore.get();
      if (idem[idempotencyKey]) return { remedy: withFlags(mockFind(idem[idempotencyKey])) };
      // Dev helper: put "[mock:CODE]" in the question to see how an error code is handled.
      const forced = /\[mock:([A-Z_]+)\]/.exec(question || "")?.[1];
      if (forced) {
        const status = { REMEDIES_OFF: 403, NOT_ACCEPTING: 409, ASTRO_BUSY: 409, TOO_MANY_PENDING: 409, BIRTH_DETAILS_REQUIRED: 400, PROFILE_NOT_FOUND: 400, VALIDATION_ERROR: 422 }[forced] || 400;
        throw new ApiError(`Mock error ${forced}`, { status, code: forced });
      }
      const a = MOCK_ASTROLOGERS.find((x) => x.id === astrologerId);
      if (!a) throw new ApiError("Astrologer not found", { status: 404, code: "NOT_FOUND" });
      const q = String(question || "").trim();
      if (q.length < REMEDY_QUESTION_MIN || q.length > REMEDY_QUESTION_MAX) throw new ApiError("Please describe your problem in a few words", { status: 422, code: "VALIDATION_ERROR" });
      const id = `rm_${Date.now().toString(36)}`;
      const price = MOCK_REMEDY_CONFIG.price;
      let balance;
      try {
        balance = __mockWallet.debit({ amount: price, title: `Remedy from ${a.name}`, meta: { source: "remedy", kind: "remedy", remedyId: id } });
      } catch (e) {
        if (e?.code === "INSUFFICIENT_BALANCE") e.data = { ...e.data, minRequired: price };
        throw e;
      }
      const now = Date.now();
      const remedy = {
        id,
        code: `RM5${String(remediesStore.get().length + 1).padStart(5, "0")}`,
        status: "pending",
        category,
        question: q,
        language: language || "en",
        astrologer: mockAstroCard(a),
        forName: profileId ? "Saved profile" : "You",
        price,
        createdAt: new Date(now).toISOString(),
        dueAt: new Date(now + MOCK_REMEDY_CONFIG.deliveryHours * HOUR).toISOString(),
        deliveredAt: null,
        remedy: null,
        declineReason: null,
        refund: null,
        followUp: null,
        rating: null,
        review: null,
        unread: false,
        openedAt: null,
      };
      remediesStore.update((list) => [remedy, ...list]);
      idemStore.update((m) => ({ ...m, [idempotencyKey]: id }));
      return { remedy: withFlags(remedy), balance };
    }
    return http("/remedies", {
      method: "POST",
      body: { astrologerId, profileId: profileId || undefined, category, question, language: language || undefined },
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  /**
   * One page of the user's remedies, newest first: { items, total, page, pageSize, hasMore, unread }.
   * @param {{ status?: "all" | "open" | "done", page?: number, pageSize?: number }} opts
   */
  async list({ status = "all", page = 1, pageSize = 10 } = {}) {
    if (env.useMocks) {
      const all = remediesStore.get();
      const rows = all
        .filter((r) => status === "all" || (status === "open" ? r.status === "pending" : r.status !== "pending"))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(withFlags);
      return mockDelay({ ...mockPage(rows, page, pageSize), unread: all.filter((r) => r.unread).length });
    }
    const r = await http("/remedies", { query: { status, page, limit: pageSize }, cache: "no-store" });
    const rows = r?.rows || [];
    const total = r?.total ?? rows.length;
    const limit = r?.limit || pageSize;
    return { items: rows, total, page: r?.page || page, pageSize: limit, hasMore: (r?.page || page) * limit < total, unread: r?.unread || 0 };
  },

  /** One remedy (opening it marks it read). */
  async get(id) {
    if (env.useMocks) {
      mockFind(id);
      return mockDelay(withFlags(mockSave(id, { unread: false })));
    }
    return http(`/remedies/${id}`, { cache: "no-store" });
  },

  /** Cancel while the astrologer hasn't opened it (canCancel). 409 CANNOT_CANCEL otherwise. Refunded in full. */
  async cancel(id) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const r = mockFind(id);
      if (r.status !== "pending" || r.openedAt) throw new ApiError("The astrologer has already started on this remedy", { status: 409, code: "CANNOT_CANCEL" });
      mockRefund(r);
      return withFlags(mockSave(id, { status: "cancelled", refund: { amount: r.price, at: new Date().toISOString(), by: "user" } }));
    }
    return http(`/remedies/${id}/cancel`, { method: "POST" });
  },

  /** One free follow-up question after delivery (canFollowUp). 409 FOLLOW_UP_USED | FOLLOW_UP_CLOSED | NOT_DELIVERED. */
  async askFollowUp(id, question) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const r = mockFind(id);
      if (r.status !== "delivered") throw new ApiError("Not delivered yet", { status: 409, code: "NOT_DELIVERED" });
      if (r.followUp) throw new ApiError("Follow-up already used", { status: 409, code: "FOLLOW_UP_USED" });
      return withFlags(mockSave(id, { followUp: { question, askedAt: new Date().toISOString(), answer: null, answeredAt: null } }));
    }
    return http(`/remedies/${id}/follow-up`, { method: "POST", body: { question } });
  },

  /** Rate 1-5 once, with an optional review (canRate). 409 CANNOT_RATE. */
  async rate(id, { rating, review }) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const r = mockFind(id);
      if (r.status !== "delivered" || r.rating) throw new ApiError("Cannot rate", { status: 409, code: "CANNOT_RATE" });
      return withFlags(mockSave(id, { rating, review: review || null }));
    }
    return http(`/remedies/${id}/rate`, { method: "POST", body: { rating, review: review || undefined } });
  },
};
