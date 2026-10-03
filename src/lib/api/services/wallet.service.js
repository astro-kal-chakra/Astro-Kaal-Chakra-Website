import { env } from "@/config/site";
import { ApiError, http, mockDelay } from "../http";

/**
 * Wallet & payments.
 *
 * The wallet is credited ONLY by the backend after Cashfree's verified webhook.
 * The browser just: creates an order → opens Cashfree checkout → polls order status.
 *
 * Order status values (backend contract): "created" | "pending" | "success" | "failed"
 * Transaction types: "recharge" | "consultation" | "refund" | "bonus" | "report"
 * Transaction status: "success" | "pending" | "failed"
 */

export const WALLET_CONFIG = { minAmount: 50, maxAmount: 50000, gstRate: 0.18 };

export const TXN_FILTERS = ["all", "recharge", "consultation", "refund", "bonus"];

// ---------------------------------------------------------------------------
// Mock backend (removed once the API is live). Persists in localStorage so the
// flow survives reloads, and mirrors the balance into the mock auth user so the
// header balance is correct after a refresh.
// ---------------------------------------------------------------------------

const MOCK_PACKS = [
  { id: "p50", amount: 50, credit: 50 },
  { id: "p100", amount: 100, credit: 120, tag: "popular" },
  { id: "p200", amount: 200, credit: 250 },
  { id: "p500", amount: 500, credit: 650, tag: "bestValue" },
  { id: "p1000", amount: 1000, credit: 1350 },
  { id: "p2000", amount: 2000, credit: 2800 },
];

/** Mock coupons: extra wallet credit on top of the pack bonus. */
const MOCK_COUPONS = {
  WELCOME50: { type: "percent", value: 50, maxBonus: 100, minAmount: 100 },
  FIRST100: { type: "flat", value: 100, minAmount: 200 },
  ASTRO10: { type: "percent", value: 10, maxBonus: 500, minAmount: 50 },
};

const WALLET_KEY = "mock_wallet";
const MOCK_DEMO_BALANCE = 300;
const USER_KEY = "mock_user";
const HOUR = 3600_000;

const seedTransactions = () => {
  const now = Date.now();
  const names = ["Acharya Raghav Sharma", "Tarot Meera Kapoor", "Pandit Vinod Joshi", "Dr. Anjali Rao"];
  const items = [];
  let n = 0;
  const push = (t) => items.push({ id: `txn_seed_${++n}`, ...t });
  push({ type: "bonus", amount: 50, status: "success", createdAt: now - 26 * 24 * HOUR, meta: { reason: "welcome" } });
  for (let i = 0; i < 18; i++) {
    const at = now - (24 - i) * 24 * HOUR - i * 3 * HOUR;
    if (i % 4 === 0) {
      const amount = [200, 500, 100, 1000][(i / 4) % 4];
      push({
        type: "recharge",
        amount,
        status: i === 8 ? "failed" : "success",
        createdAt: at,
        meta: { orderId: `ord_seed_${i}`, method: "UPI" },
      });
    } else if (i % 7 === 0) {
      push({ type: "refund", amount: 45, status: "success", createdAt: at, meta: { astrologer: names[i % 4], reason: "dropped" } });
    } else {
      const mins = 5 + ((i * 7) % 20);
      push({
        type: "consultation",
        amount: -mins * (15 + (i % 3) * 10),
        status: "success",
        createdAt: at,
        meta: { astrologer: names[i % 4], mode: i % 3 === 0 ? "video" : "chat", minutes: mins },
      });
    }
  }
  return items;
};

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

function readStore() {
  if (typeof window === "undefined") return { balance: 0, orders: {}, idem: {}, txns: [] };
  try {
    const s = JSON.parse(localStorage.getItem(WALLET_KEY));
    if (s) return s;
  } catch {}
  // Demo balance so paid chat/call/live flows can be tried without a recharge first.
  return { balance: readUser()?.walletBalance || MOCK_DEMO_BALANCE, orders: {}, idem: {}, txns: seedTransactions() };
}

function writeStore(s) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(s));
    const u = readUser();
    if (u) localStorage.setItem(USER_KEY, JSON.stringify({ ...u, walletBalance: s.balance }));
  } catch {}
}

function couponBonus(code, amount) {
  const c = MOCK_COUPONS[code];
  if (!c) throw new ApiError("Invalid coupon", { status: 400, code: "INVALID_COUPON" });
  if (amount < c.minAmount)
    throw new ApiError("Minimum amount not met", { status: 400, code: "COUPON_MIN_AMOUNT", data: { minAmount: c.minAmount } });
  return c.type === "flat" ? c.value : Math.min(Math.round((amount * c.value) / 100), c.maxBonus);
}

/** Quote = what the user pays and what lands in the wallet. Mirrors backend maths for display only. */
export function quoteRecharge({ amount, packs = MOCK_PACKS, couponBonus: extra = 0, gstRate = WALLET_CONFIG.gstRate }) {
  const pack = packs.find((p) => p.amount === amount);
  const packBonus = pack ? pack.credit - pack.amount : 0;
  const gst = Math.round(amount * gstRate * 100) / 100;
  return {
    amount,
    packBonus,
    couponBonus: extra,
    bonus: packBonus + extra,
    credit: amount + packBonus + extra,
    gst,
    total: Math.round((amount + gst) * 100) / 100,
  };
}

/** Internal mock helpers shared with report.service (wallet debits). */
export const __mockWallet = {
  read: readStore,
  write: writeStore,
  /** Debit the wallet (used by mocked report purchases). */
  debit({ amount, title, meta }) {
    const s = readStore();
    if (s.balance < amount)
      throw new ApiError("Insufficient balance", { status: 402, code: "INSUFFICIENT_BALANCE", data: { balance: s.balance } });
    s.balance = Math.round((s.balance - amount) * 100) / 100;
    s.txns.push({
      id: `txn_${crypto.randomUUID().slice(0, 8)}`,
      type: "report",
      amount: -amount,
      status: "success",
      createdAt: Date.now(),
      meta: { title, ...meta },
    });
    writeStore(s);
    return s.balance;
  },
  /**
   * Simulates the Cashfree side of the payment (what the user picked in the mock checkout).
   * The "webhook" lands a little later — status polling picks it up.
   */
  setOutcome(orderId, outcome) {
    const s = readStore();
    const o = s.orders[orderId];
    if (!o) return;
    const now = Date.now();
    if (outcome === "success") Object.assign(o, { status: "pending", resolveAt: now + 2500, resolveTo: "success" });
    else if (outcome === "failure")
      Object.assign(o, { status: "pending", resolveAt: now + 1500, resolveTo: "failed", failureReason: "declined" });
    else if (outcome === "pending") Object.assign(o, { status: "pending", resolveAt: now + 12000, resolveTo: "success" });
    // "closed" → user dismissed checkout without paying: order stays "created".
    writeStore(s);
  },
};

function resolveMockOrder(orderId) {
  const s = readStore();
  const o = s.orders[orderId];
  if (!o) throw new ApiError("Order not found", { status: 404, code: "ORDER_NOT_FOUND" });
  if (o.status === "pending" && o.resolveAt && Date.now() >= o.resolveAt) {
    o.status = o.resolveTo;
    if (o.status === "success") {
      // ← this is what the backend does on the verified PAYMENT_SUCCESS webhook.
      s.balance = Math.round((s.balance + o.credit) * 100) / 100;
      s.txns.push({
        id: `txn_${orderId}`,
        type: "recharge",
        amount: o.amount,
        status: "success",
        createdAt: Date.now(),
        meta: { orderId, method: "UPI" },
      });
      if (o.bonus > 0)
        s.txns.push({
          id: `txn_${orderId}_b`,
          type: "bonus",
          amount: o.bonus,
          status: "success",
          createdAt: Date.now() + 1,
          meta: { reason: o.coupon ? "coupon" : "pack", coupon: o.coupon },
        });
    } else {
      s.txns.push({
        id: `txn_${orderId}`,
        type: "recharge",
        amount: o.amount,
        status: "failed",
        createdAt: Date.now(),
        meta: { orderId, method: "UPI" },
      });
    }
    writeStore(s);
  }
  return { ...o, balance: s.balance };
}

const toOrderStatus = (o) => ({
  orderId: o.orderId,
  status: o.status,
  amount: o.amount,
  credit: o.credit,
  bonus: o.bonus,
  total: o.total,
  balance: o.status === "success" ? o.balance : undefined,
  failureReason: o.status === "failed" ? o.failureReason || "declined" : undefined,
  createdAt: o.createdAt,
});

// ---------------------------------------------------------------------------

export const walletService = {
  async getPacks() {
    if (env.useMocks) return mockDelay(MOCK_PACKS, 100);
    return http("/wallet/packs");
  },

  /** @returns {{ minAmount: number, maxAmount: number, gstRate: number }} */
  async getConfig() {
    if (env.useMocks) return WALLET_CONFIG;
    return http("/wallet/config");
  },

  async getBalance() {
    if (env.useMocks) return mockDelay({ balance: readStore().balance }, 100);
    return http("/wallet", { cache: "no-store" });
  },

  /**
   * Validate a coupon for an amount. Throws ApiError code INVALID_COUPON | COUPON_MIN_AMOUNT.
   * @returns {{ code: string, bonus: number }}
   */
  async validateCoupon({ code, amount }) {
    if (env.useMocks) {
      await mockDelay(null, 350);
      return { code, bonus: couponBonus(code, amount) };
    }
    return http("/wallet/coupons/validate", { method: "POST", body: { code, amount } });
  },

  /**
   * Create a Cashfree order on the backend. `idempotencyKey` is generated once per
   * attempt so double-clicks / retries never create two orders.
   * @returns {{ orderId: string, paymentSessionId: string, amount: number, credit: number, total: number }}
   */
  async createOrder({ packId, amount, coupon, idempotencyKey }) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const s = readStore();
      const existing = s.idem[idempotencyKey];
      if (existing && s.orders[existing]) return { ...s.orders[existing] };
      const extra = coupon ? couponBonus(coupon, amount) : 0;
      const q = quoteRecharge({ amount, couponBonus: extra });
      const orderId = `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const order = {
        orderId,
        paymentSessionId: `session_mock_${orderId}`,
        packId,
        coupon: coupon || null,
        ...q,
        status: "created",
        createdAt: Date.now(),
      };
      s.orders[orderId] = order;
      s.idem[idempotencyKey] = orderId;
      writeStore(s);
      return { ...order };
    }
    return http("/wallet/orders", {
      method: "POST",
      body: { packId, amount, coupon },
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  /** Poll this after checkout — the backend flips it to success only after the verified webhook. */
  async getOrderStatus(orderId) {
    if (env.useMocks) {
      await mockDelay(null, 250);
      return toOrderStatus(resolveMockOrder(orderId));
    }
    return http(`/wallet/orders/${orderId}`, { cache: "no-store" });
  },

  /** @returns {{ items: object[], total: number, page: number, pageSize: number, hasMore: boolean }} */
  async getTransactions({ page = 1, pageSize = 10, type = "all" } = {}) {
    if (env.useMocks) {
      const all = readStore()
        .txns.filter((t) => type === "all" || t.type === type || (type === "consultation" && t.type === "report"))
        .sort((a, b) => b.createdAt - a.createdAt);
      const items = all.slice((page - 1) * pageSize, page * pageSize);
      return mockDelay({ items, total: all.length, page, pageSize, hasMore: page * pageSize < all.length }, 300);
    }
    return http("/wallet/transactions", { query: { page, pageSize, type: type === "all" ? undefined : type }, cache: "no-store" });
  },

  /** GST invoice data for a successful recharge. */
  async getInvoice(transactionId) {
    if (env.useMocks) {
      const s = readStore();
      const t = s.txns.find((x) => x.id === transactionId);
      if (!t) throw new ApiError("Not found", { status: 404 });
      const order = t.meta?.orderId ? s.orders[t.meta.orderId] : null;
      const taxable = t.amount;
      const gst = Math.round(taxable * WALLET_CONFIG.gstRate * 100) / 100;
      return mockDelay(
        {
          invoiceNo: `INV-${new Date(t.createdAt).getFullYear()}-${transactionId.slice(-6).toUpperCase()}`,
          date: t.createdAt,
          orderId: t.meta?.orderId,
          method: t.meta?.method || "UPI",
          customer: { name: readUser()?.name || "", phone: readUser()?.phone || "" },
          seller: { name: "Nakshatra Astro Services Pvt. Ltd.", gstin: "29ABCDE1234F1Z5", address: "Bengaluru, Karnataka, India" },
          lines: [{ description: "wallet_recharge", amount: taxable }],
          taxable,
          cgst: gst / 2,
          sgst: gst / 2,
          total: Math.round((taxable + gst) * 100) / 100,
          credit: order?.credit ?? taxable,
        },
        200,
      );
    }
    return http(`/wallet/transactions/${transactionId}/invoice`);
  },
};
