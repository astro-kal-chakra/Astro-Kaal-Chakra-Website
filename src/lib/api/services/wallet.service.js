import { env } from "@/config/site";
import { ApiError, http, mockDelay } from "../http";

/**
 * Wallet & payments (Razorpay).
 *
 * Real flow (backend contract):
 *   1. POST /user/wallet/quote    { packId | amount, couponCode } → { amount,
 *                                 totalAmount, packBonus, couponBonus, bonusAmount, creditAmount, coupon }
 *      Coupons are applied here — there is no separate "validate coupon" call.
 *   2. POST /user/payments/order  { packId | amount, couponCode } → { orderId, keyId, amount, currency, breakdown, prefill }
 *   3. Razorpay Checkout (features/wallet/lib/razorpay.js)
 *   4. POST /user/payments/verify { orderId, razorpayPaymentId, signature } → { status, credited, creditAmount, balance }
 *   5. GET  /user/payments/:orderId/status — polled by the status page
 * The wallet is credited ONLY by the backend (on verify, or from the Razorpay
 * webhook if the browser never returns). The browser never credits anything.
 *
 * Backend amounts are in paise; this layer works in rupees.
 * TODO(api): convert at the boundary when wiring the real endpoints.
 *
 * Recharge limits (backend settings): ₹50 – ₹1,00,000 per recharge. GST is set from the dashboard;
 * at 0% (the default) the user pays exactly the recharge amount.
 *
 * Order status values: "created" | "pending" | "success" | "failed"
 * Transaction types: "recharge" | "consultation" | "refund" | "bonus" | "report"
 * Transaction status: "success" | "pending" | "failed"
 */

export const WALLET_CONFIG = { minAmount: 50, maxAmount: 100000, gstRate: 0 }; // GST rate comes from the dashboard (Settings); 0 = none

export const TXN_FILTERS = ["all", "recharge", "consultation", "refund", "bonus"];

// ---------------------------------------------------------------------------
// Mock backend (removed once the API is live). Persists in localStorage so the
// flow survives reloads, and mirrors the balance into the mock auth user so the
// header balance is correct after a refresh.
// ---------------------------------------------------------------------------

export const MOCK_PACKS = [
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
  // Consultations are billed by the second (rate × seconds / 60) — amounts have paise.
  const RATES = [12, 25, 35];
  const SECONDS = [181, 412, 905, 754, 300, 1262];
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
      const rate = RATES[i % 3];
      const durationSec = SECONDS[i % SECONDS.length];
      push({
        type: "consultation",
        amount: -Math.round((rate * durationSec * 100) / 60) / 100,
        status: "success",
        createdAt: at,
        meta: { astrologer: names[i % 4], mode: ["video", "chat", "call"][i % 3], durationSec, ratePerMin: rate },
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

function assertAmount(amount) {
  if (!Number.isInteger(amount) || amount < WALLET_CONFIG.minAmount || amount > WALLET_CONFIG.maxAmount)
    throw new ApiError("Recharge amount must be between ₹50 and ₹1,00,000", { status: 400, code: "INVALID_AMOUNT" });
}

/** Instant preview of a quote (display only) — the backend quote is what gets charged. */
export function quoteRecharge({ amount, packs = MOCK_PACKS, couponBonus: extra = 0, gstRate = WALLET_CONFIG.gstRate }) {
  const pack = packs.find((p) => p.amount === amount);
  const packBonus = pack ? pack.credit - pack.amount : 0;
  const gst = Math.round(amount * (gstRate || 0) * 100) / 100;
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
   * Simulates the Razorpay side of the payment (what the user picked in the mock checkout,
   * or a successful verify). The "webhook" lands a little later — status polling picks it up.
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
      // ← this is what the backend does after /payments/verify or the Razorpay payment.captured webhook.
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
   * POST /user/wallet/quote — amount payable + pack / coupon bonus for a recharge.
   * Coupons are applied here. Throws ApiError code INVALID_COUPON | COUPON_MIN_AMOUNT | INVALID_AMOUNT.
   * @param {{ packId?: string, amount: number, couponCode?: string }} p
   * @returns {Promise<{ amount: number, total: number, packBonus: number, couponBonus: number, bonus: number, credit: number, coupon: { code: string } | null }>}
   */
  async quote({ packId, amount, couponCode }) {
    if (env.useMocks) {
      await mockDelay(null, 350);
      assertAmount(amount);
      const extra = couponCode ? couponBonus(couponCode, amount) : 0;
      const q = quoteRecharge({ amount, couponBonus: extra });
      return { ...q, coupon: couponCode ? { code: couponCode } : null, packId };
    }
    return http("/wallet/quote", { method: "POST", body: { packId, amount, couponCode } });
  },

  /**
   * POST /user/payments/order — creates the Razorpay order for the quoted recharge.
   * `idempotencyKey` is generated once per attempt so double-clicks / retries never create two orders.
   * @returns {Promise<{ orderId: string, keyId: string, currency: "INR", amount: number, credit: number, total: number }>}
   */
  async createOrder({ packId, amount, couponCode, idempotencyKey }) {
    if (env.useMocks) {
      await mockDelay(null, 500);
      const s = readStore();
      const existing = s.idem[idempotencyKey];
      if (existing && s.orders[existing]) return { ...s.orders[existing] };
      assertAmount(amount);
      const extra = couponCode ? couponBonus(couponCode, amount) : 0;
      const q = quoteRecharge({ amount, couponBonus: extra });
      const orderId = `order_mock_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const order = {
        orderId,
        keyId: "rzp_mock",
        currency: "INR",
        packId,
        coupon: couponCode || null,
        ...q,
        status: "created",
        createdAt: Date.now(),
      };
      s.orders[orderId] = order;
      s.idem[idempotencyKey] = orderId;
      writeStore(s);
      return { ...order };
    }
    return http("/payments/order", {
      method: "POST",
      body: { packId, amount, couponCode },
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  /**
   * POST /user/payments/verify — hands Razorpay's signed response to the backend, which
   * checks the signature and credits the wallet. Safe to fail: the webhook still credits it.
   * @param {{ orderId: string, razorpayPaymentId: string, signature: string }} p
   */
  async verifyPayment({ orderId, razorpayPaymentId, signature }) {
    if (env.useMocks) {
      await mockDelay(null, 300);
      __mockWallet.setOutcome(orderId, "success");
      return { status: "pending", credited: false };
    }
    return http("/payments/verify", { method: "POST", body: { orderId, razorpayPaymentId, signature } });
  },

  /** GET /user/payments/:orderId/status — poll after checkout; only the backend marks it success. */
  async getOrderStatus(orderId) {
    if (env.useMocks) {
      await mockDelay(null, 250);
      return toOrderStatus(resolveMockOrder(orderId));
    }
    return http(`/payments/${orderId}/status`, { cache: "no-store" });
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

  /** Payment receipt data for a successful recharge. */
  async getInvoice(transactionId) {
    if (env.useMocks) {
      const s = readStore();
      const t = s.txns.find((x) => x.id === transactionId);
      if (!t) throw new ApiError("Not found", { status: 404 });
      const order = t.meta?.orderId ? s.orders[t.meta.orderId] : null;
      return mockDelay(
        {
          invoiceNo: `INV-${new Date(t.createdAt).getFullYear()}-${transactionId.slice(-6).toUpperCase()}`,
          date: t.createdAt,
          orderId: t.meta?.orderId,
          method: t.meta?.method || "UPI",
          customer: { name: readUser()?.name || "", phone: readUser()?.phone || "" },
          seller: { name: "Nakshatra Astro Services Pvt. Ltd.", address: "Bengaluru, Karnataka, India" },
          lines: [{ description: "wallet_recharge", amount: t.amount }],
          total: t.amount,
          credit: order?.credit ?? t.amount,
        },
        200,
      );
    }
    return http(`/wallet/transactions/${transactionId}/invoice`);
  },
};
