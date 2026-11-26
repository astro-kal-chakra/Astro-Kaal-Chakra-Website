import { env } from "@/config/site";
import { hasLabel, label as t } from "@/lib/labels";
import { ApiError, http, mockDelay, mockPage } from "../http";
import { MOCK_ASTROLOGERS } from "../mock/astrologers";
import { mockStore } from "../mock/account";
import {
  MOCK_REPORT_REQUESTS,
  MOCK_REPORT_REQUEST_SETTINGS,
  mockAstroRow,
  mockProduct,
  mockReportAstroCard,
} from "../mock/reportRequests";
import { reportService } from "./report.service";
import { userService } from "./user.service";
import { __mockWallet } from "./wallet.service";

/**
 * "Get a report from an astrologer": the user orders a report product (price set on the dashboard), picks an
 * astrologer or "Any expert" (our team assigns one), pays from the wallet, and the astrologer writes the
 * report (text + optional PDF) before `dueAt`, or the user is refunded automatically.
 * Website API: /web/report-requests (cookie auth, money in rupees). Everything is hidden while
 * `config.enabled` is false (switched on from the dashboard).
 *
 * Statuses: unassigned (team will choose) | pending (with the astrologer) | delivered | declined | expired |
 * cancelled | refunded.
 */

export const REPORT_QUESTION_MAX = 1000;
export const REPORT_REVIEW_MAX = 500;

/** List tabs: open = being written, done = delivered or closed. */
export const REPORT_REQUEST_TABS = ["open", "done"];
export const REPORT_REQUEST_OPEN = ["unassigned", "pending"];

// --- Mock store ------------------------------------------------------------
const HOUR = 3600_000;
const store = mockStore("report_requests", MOCK_REPORT_REQUESTS);
const idemStore = mockStore("report_requests_idem", () => ({}));

const withFlags = (r) => {
  const { openedAt, ...out } = r;
  return { ...out, canCancel: REPORT_REQUEST_OPEN.includes(r.status) && !openedAt, canRate: r.status === "delivered" && !r.rating };
};

const mockFind = (id) => {
  const r = store.get().find((x) => x.id === id);
  if (!r) throw new ApiError("Report not found", { status: 404, code: "NOT_FOUND" });
  return r;
};

const mockSave = (id, patch) => {
  let saved;
  store.update((list) => list.map((x) => (x.id === id ? (saved = { ...x, ...patch }) : x)));
  return saved;
};

async function mockProducts() {
  const catalog = await reportService.list();
  return catalog.map((r) => {
    const key = `wallet.reports.catalog.${r.slug}.title`;
    return mockProduct({ ...r, title: r.title || (hasLabel(key) ? t(key) : r.slug) });
  });
}

// ---------------------------------------------------------------------------

export const reportRequestService = {
  /**
   * Is ordering reports from astrologers on? Public.
   * @returns {{ enabled: boolean, allowAnyExpert: boolean, products: object[] }}
   */
  async getConfig() {
    if (env.useMocks) return mockDelay({ ...MOCK_REPORT_REQUEST_SETTINGS, products: await mockProducts() }, 200);
    return http("/report-requests/config", { cache: "no-store" });
  },

  /** Astrologers taking report requests, best rated first: { items, total, page, pageSize, hasMore }. Public. */
  async listAstrologers({ q = "", page = 1, pageSize = 10 } = {}) {
    if (env.useMocks) {
      const term = q.trim().toLowerCase();
      const rows = MOCK_ASTROLOGERS.filter((a) => !term || a.name.toLowerCase().includes(term))
        .sort((a, b) => b.rating - a.rating)
        .map(mockAstroRow);
      return mockDelay(mockPage(rows, page, pageSize), 250);
    }
    const r = await http("/report-requests/astrologers", { query: { q: q.trim() || undefined, page, limit: pageSize }, cache: "no-store" });
    const rows = r?.rows || [];
    const total = r?.total ?? rows.length;
    const limit = r?.limit || pageSize;
    return { items: rows, total, page: r?.page || page, pageSize: limit, hasMore: (r?.page || page) * limit < total };
  },

  /**
   * Order and pay. `astrologerId` empty = "Any expert". `profileIds` empty = the user's own details.
   * `idempotencyKey` is reused when retrying the same attempt, so the user is never charged twice.
   * Errors (ApiError.code): INSUFFICIENT_BALANCE (402, data.balance / data.minRequired), REPORTS_OFF (403),
   * NOT_ACCEPTING / ASTRO_BUSY / TOO_MANY_PENDING (409), PROFILES_REQUIRED / BIRTH_DETAILS_REQUIRED /
   * PROFILE_NOT_FOUND / ASTROLOGER_REQUIRED (400).
   * @returns {{ request: object, balance?: number }}
   */
  async create({ productId, astrologerId, profileIds, question, language, idempotencyKey }) {
    if (env.useMocks) {
      await mockDelay(null, 700);
      const idem = idemStore.get();
      if (idem[idempotencyKey]) return { request: withFlags(mockFind(idem[idempotencyKey])) };
      // Dev helper: put "[mock:CODE]" in the question to see how an error code is handled.
      const forced = /\[mock:([A-Z_]+)\]/.exec(question || "")?.[1];
      if (forced) {
        const status = { REPORTS_OFF: 403, NOT_ACCEPTING: 409, ASTRO_BUSY: 409, TOO_MANY_PENDING: 409 }[forced] || 400;
        throw new ApiError(`Mock error ${forced}`, { status, code: forced });
      }
      const product = (await mockProducts()).find((p) => p.id === productId);
      if (!product) throw new ApiError("This report is not available", { status: 404, code: "NOT_FOUND" });
      const a = astrologerId ? MOCK_ASTROLOGERS.find((x) => x.id === astrologerId) : null;
      if (astrologerId && !a) throw new ApiError("Astrologer not found", { status: 404, code: "NOT_FOUND" });
      const saved = await userService.listBirthProfiles();
      const people = profileIds?.length ? profileIds.map((id) => saved.find((p) => p.id === id)) : [{ name: "You", dob: "1994-08-14" }];
      if (people.some((p) => !p)) throw new ApiError("Birth profile not found", { status: 400, code: "PROFILE_NOT_FOUND" });
      if (people.length !== product.profilesRequired)
        throw new ApiError(product.profilesRequired === 2 ? "This report needs two people. Choose both." : "Choose one person for this report", { status: 400, code: "PROFILES_REQUIRED" });
      const id = `rr_${Date.now().toString(36)}`;
      let balance;
      try {
        balance = __mockWallet.debit({ amount: product.price, title: `Report: ${product.title}`, meta: { source: "report", reportRequestId: id } });
      } catch (e) {
        if (e?.code === "INSUFFICIENT_BALANCE") e.data = { ...e.data, minRequired: product.price };
        throw e;
      }
      const now = Date.now();
      const request = {
        id,
        code: `RR5${String(store.get().length + 1).padStart(5, "0")}`,
        status: a ? "pending" : "unassigned",
        product: { id: product.id, title: product.title, slug: product.slug },
        astrologer: mockReportAstroCard(a),
        chosenBy: a ? "user" : "team",
        forNames: people.map((p) => p.name),
        question: question?.trim() || null,
        language: language || "en",
        price: product.price,
        createdAt: new Date(now).toISOString(),
        dueAt: new Date(now + product.deliveryHours * HOUR).toISOString(),
        deliveredAt: null,
        report: null,
        declineReason: null,
        refund: null,
        rating: null,
        review: null,
        unread: false,
        openedAt: null,
      };
      store.update((list) => [request, ...list]);
      idemStore.update((m) => ({ ...m, [idempotencyKey]: id }));
      return { request: withFlags(request), balance };
    }
    return http("/report-requests", {
      method: "POST",
      body: {
        productId,
        astrologerId: astrologerId || null,
        profileIds: profileIds?.length ? profileIds : undefined,
        question: question?.trim() || undefined,
        language: language || undefined,
        clientKey: idempotencyKey,
      },
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  /**
   * One page of the user's report requests, newest first: { items, total, page, pageSize, hasMore, unread }.
   * @param {{ status?: "all" | "open" | "done", page?: number, pageSize?: number }} opts
   */
  async list({ status = "all", page = 1, pageSize = 10 } = {}) {
    if (env.useMocks) {
      const all = store.get();
      const rows = all
        .filter((r) => status === "all" || (status === "open") === REPORT_REQUEST_OPEN.includes(r.status))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(withFlags);
      return mockDelay({ ...mockPage(rows, page, pageSize), unread: all.filter((r) => r.unread).length });
    }
    const r = await http("/report-requests", { query: { status, page, limit: pageSize }, cache: "no-store" });
    const rows = r?.rows || [];
    const total = r?.total ?? rows.length;
    const limit = r?.limit || pageSize;
    return { items: rows, total, page: r?.page || page, pageSize: limit, hasMore: (r?.page || page) * limit < total, unread: r?.unread || 0 };
  },

  /** One request (opening it marks it read). */
  async get(id) {
    if (env.useMocks) {
      mockFind(id);
      return mockDelay(withFlags(mockSave(id, { unread: false })));
    }
    return http(`/report-requests/${encodeURIComponent(id)}`, { cache: "no-store" });
  },

  /**
   * Address of the delivered PDF. The backend streams it with the login cookie, so a normal link works.
   * Mock mode: a small text file so the download button can be tried.
   */
  pdfUrl(r) {
    if (env.useMocks) {
      const text = `Mock report PDF\n\n${r.product?.title || "Report"}\nFor: ${(r.forNames || []).join(" & ")}\nFrom: ${r.astrologer?.name || ""}\n\n${r.report?.text || ""}`;
      return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
    }
    return `${env.apiUrl}/report-requests/${encodeURIComponent(r.id)}/pdf`;
  },

  /** Cancel while the astrologer hasn't opened it (canCancel). 409 CANNOT_CANCEL otherwise. Refunded in full. */
  async cancel(id) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const r = mockFind(id);
      if (!REPORT_REQUEST_OPEN.includes(r.status) || r.openedAt)
        throw new ApiError("The astrologer has already started on this report, so it can no longer be cancelled", { status: 409, code: "CANNOT_CANCEL" });
      const s = __mockWallet.read();
      s.balance = Math.round((s.balance + r.price) * 100) / 100;
      s.txns.push({ id: `txn_${crypto.randomUUID().slice(0, 8)}`, type: "refund", amount: r.price, status: "success", createdAt: Date.now(), meta: { reason: `Report refund (${r.code})` } });
      __mockWallet.write(s);
      return withFlags(mockSave(id, { status: "cancelled", refund: { amount: r.price, at: new Date().toISOString(), by: "user" } }));
    }
    return http(`/report-requests/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  },

  /** Rate 1-5 once, with an optional review (canRate). 409 CANNOT_RATE. */
  async rate(id, { rating, review }) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const r = mockFind(id);
      if (r.status !== "delivered" || r.rating) throw new ApiError("This report can no longer be rated", { status: 409, code: "CANNOT_RATE" });
      return withFlags(mockSave(id, { rating, review: review || null }));
    }
    return http(`/report-requests/${encodeURIComponent(id)}/rate`, { method: "POST", body: { rating, review: review || undefined } });
  },
};
