"use client";

import { env } from "@/config/site";
import { __mockWallet } from "@/lib/api/services/wallet.service";

/**
 * Cashfree checkout integration point — the ONLY file that talks to Cashfree.
 *
 * openCheckout() resolves with { outcome: "success" | "failure" | "pending" | "closed" }.
 * The outcome is a UI hint only: the wallet is credited exclusively by the backend
 * after the verified Cashfree webhook, so callers must ALWAYS poll order status
 * (walletService.getOrderStatus) before showing a final result.
 *
 * TODO(cashfree): real integration once the backend is live:
 *   npm i @cashfreepayments/cashfree-js
 *
 *   import { load } from "@cashfreepayments/cashfree-js";
 *   let cashfreePromise;
 *   const getCashfree = () =>
 *     (cashfreePromise ??= load({ mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox" })); // "production" in prod
 *
 *   async function openRealCheckout({ paymentSessionId }) {
 *     const cashfree = await getCashfree();
 *     const result = await cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" });
 *     if (result.error) return { outcome: result.error.code === "payment_cancelled" ? "closed" : "failure", error: result.error };
 *     if (result.paymentDetails) return { outcome: "pending" }; // verify via polling
 *     return { outcome: "pending" };
 *   }
 *
 *   For UPI intent / redirect flows set `returnUrl` on the order (backend) to
 *   `${siteUrl}/wallet/payment/{order_id}` so the status page resumes polling.
 */

// --- Mock checkout: a tiny external store rendered by <MockCashfreeCheckout /> ---
let current = null; // { orderId, amount, total, resolve }
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
    if (outcome !== "closed") __mockWallet.setOutcome(orderId, outcome);
    current = null;
    emit();
    resolve({ outcome });
  },
};

/**
 * @param {{ orderId: string, paymentSessionId: string, total: number }} order
 * @returns {Promise<{ outcome: "success" | "failure" | "pending" | "closed" }>}
 */
export function openCheckout(order) {
  if (!env.useMocks) {
    // TODO(cashfree): return openRealCheckout(order);
    return Promise.reject(new Error("Cashfree SDK not wired yet — see features/wallet/lib/cashfree.js"));
  }
  return new Promise((resolve) => {
    current = { orderId: order.orderId, total: order.total, resolve };
    emit();
  });
}
