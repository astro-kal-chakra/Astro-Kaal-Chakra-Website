"use client";

import { env } from "@/config/site";
import { __mockWallet } from "@/lib/api/services/wallet.service";

/**
 * Razorpay checkout integration point — the ONLY file that talks to Razorpay.
 *
 * Flow (backend contract):
 *   1. POST /user/wallet/quote    { packId | amount, couponCode } → GST breakdown + bonus (walletService.quote)
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
 * TODO(razorpay): real integration once the backend is live:
 *
 *   const loadScript = () =>
 *     (scriptPromise ??= new Promise((resolve, reject) => {
 *       const s = document.createElement("script");
 *       s.src = "https://checkout.razorpay.com/v1/checkout.js";
 *       s.onload = resolve;
 *       s.onerror = reject;
 *       document.body.appendChild(s);
 *     }));
 *
 *   async function openRealCheckout(order) {
 *     await loadScript();
 *     return new Promise((resolve) => {
 *       const rzp = new window.Razorpay({
 *         key: order.keyId,
 *         order_id: order.orderId,
 *         amount: order.amount, // paise, from the backend
 *         currency: order.currency,
 *         name: siteConfig.name,
 *         description: "Wallet recharge",
 *         prefill: order.prefill,
 *         handler: (payment) => resolve({ outcome: "success", payment }),
 *         modal: { ondismiss: () => resolve({ outcome: "closed" }) },
 *       });
 *       rzp.on("payment.failed", () => resolve({ outcome: "failure" }));
 *       rzp.open();
 *     });
 *   }
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
    if (outcome === "failure" || outcome === "pending") __mockWallet.setOutcome(orderId, outcome);
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
  if (!env.useMocks) {
    // TODO(razorpay): return openRealCheckout(order);
    return Promise.reject(new Error("Razorpay checkout not wired yet — see features/wallet/lib/razorpay.js"));
  }
  return new Promise((resolve) => {
    current = { orderId: order.orderId, total: order.total, resolve };
    emit();
  });
}
