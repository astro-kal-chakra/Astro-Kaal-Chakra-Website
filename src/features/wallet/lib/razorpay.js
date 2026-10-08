"use client";

import { env, siteConfig } from "@/config/site";
import { __mockWallet } from "@/lib/api/services/wallet.service";

/**
 * Razorpay checkout integration point — the ONLY file that talks to Razorpay.
 *
 * Flow (backend contract):
 *   1. POST /user/wallet/quote    { packId | amount, couponCode } → amount payable + bonus (walletService.quote)
 *   2. POST /user/payments/order  { packId | amount, couponCode } → { orderId, keyId, amount, currency, breakdown, prefill }
 *   3. openCheckout(order)        → Razorpay Checkout; on success it hands back
 *                                   { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *   4. POST /user/payments/verify { orderId, razorpayPaymentId, signature } (walletService.verifyPayment)
 *
 * openCheckout() resolves with { outcome: "success" | "failure" | "pending" | "closed", payment? }.
 * The outcome is a UI hint only: the wallet is credited exclusively by the backend
 * (after verify, or from the Razorpay webhook if the browser never comes back),
 * so callers must ALWAYS poll order status (walletService.getOrderStatus) before
 * showing a final result.
 *
 * Local development: the backend's mock gateway marks orders `mock: true` (keyId "rzp_mock"); those
 * open the same simulated checkout as mock mode, and verify succeeds with signature "mock_signature".
 */

// --- Mock checkout: a tiny external store rendered by <MockRazorpayCheckout /> ---
let current = null; // { orderId, total, resolve }
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const mockCheckoutStore = {
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  get: () => current,
  getServer: () => null,
  /** Called by the mock modal with the user's simulated choice. */
  complete(outcome) {
    if (!current) return;
    const { orderId, resolve } = current;
    // Failure / slow bank are decided on the "gateway" side; success is confirmed via verify.
    // (Website mock mode only — the backend's mock gateway decides its own outcomes.)
    if (env.useMocks && (outcome === "failure" || outcome === "pending")) __mockWallet.setOutcome(orderId, outcome);
    current = null;
    emit();
    const payment =
      outcome === "success"
        ? { razorpay_payment_id: `pay_mock_${Date.now().toString(36)}`, razorpay_order_id: orderId, razorpay_signature: "mock_signature" }
        : undefined;
    resolve({ outcome, payment });
  },
};

/**
 * @param {{ orderId: string, keyId: string, total: number }} order
 * @returns {Promise<{ outcome: "success" | "failure" | "pending" | "closed", payment?: { razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string } }>}
 */
export function openCheckout(order) {
  if (!env.useMocks && !order.mock) return openRealCheckout(order);
  return new Promise((resolve) => {
    current = { orderId: order.orderId, total: order.total, resolve };
    emit();
  });
}

// --- Real Razorpay Checkout ---
let scriptPromise = null;
const loadScript = () =>
  (scriptPromise ??= new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = "https://checkout.razorpay.com/v1/checkout.js";
    el.onload = resolve;
    el.onerror = () => {
      scriptPromise = null;
      reject(new Error("Couldn't load Razorpay. Check your connection and try again."));
    };
    document.body.appendChild(el);
  }));

async function openRealCheckout(order) {
  await loadScript();
  return new Promise((resolve) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amountPaise, // Razorpay works in paise; the website shows rupees
      currency: order.currency || "INR",
      name: order.name || siteConfig.name,
      description: "Wallet recharge",
      prefill: order.prefill,
      theme: { color: "#c2410c" },
      handler: (payment) => resolve({ outcome: "success", payment }),
      modal: { ondismiss: () => resolve({ outcome: "closed" }) },
    });
    rzp.on("payment.failed", () => resolve({ outcome: "failure" }));
    rzp.open();
  });
}
