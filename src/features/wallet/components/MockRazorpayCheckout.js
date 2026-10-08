"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, ChevronRight, Clock, CreditCard, Landmark, QrCode, ShieldCheck, Wallet, XCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { mockCheckoutStore } from "../lib/razorpay";
import { SITE_LOCALE } from "@/config/locale";

/**
 * Dev-only stand-in for Razorpay Checkout, laid out like the real one
 * (merchant + amount header, payment methods, "Secured by Razorpay") with
 * buttons to simulate every gateway outcome. Removed once the real checkout
 * is wired in lib/razorpay.js.
 */
export function MockRazorpayCheckout() {
  const locale = SITE_LOCALE;
  const session = useSyncExternalStore(mockCheckoutStore.subscribe, mockCheckoutStore.get, mockCheckoutStore.getServer);

  const methods = [
    [QrCode, "UPI / QR", "Google Pay, PhonePe, Paytm & more"],
    [CreditCard, "Cards", "Visa, Mastercard, RuPay"],
    [Landmark, "Netbanking", "All major banks"],
    [Wallet, "Wallet", "Paytm, Mobikwik & more"],
  ];
  const choices = [
    { outcome: "success", icon: CheckCircle2, variant: "success", label: "Simulate success" },
    { outcome: "failure", icon: XCircle, variant: "danger", label: "Simulate failure" },
    { outcome: "pending", icon: Clock, variant: "outline", label: "Simulate pending (slow bank)" },
  ];

  return (
    <Modal open={Boolean(session)} onClose={() => mockCheckoutStore.complete("closed")} title="Razorpay checkout">
      {session && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="flex items-center justify-between gap-3 bg-[#072654] p-4 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{siteConfig.name}</p>
                <p className="text-xs text-white/70">Wallet recharge</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold tabular-nums">{formatCurrency(session.total, locale)}</p>
                <p className="tabular-nums text-[10px] text-white/60">{session.orderId}</p>
              </div>
            </div>
            <ul aria-label="Payment methods" className="divide-y divide-line">
              {methods.map(([Icon, label, hint]) => (
                <li key={label} className="flex items-center gap-3 px-4 py-3">
                  <Icon className="size-5 shrink-0 text-[#3395FF]" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block truncate text-xs text-muted">{hint}</span>
                  </span>
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-line p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm text-muted">Simulated checkout — choose how the payment ends:</p>
              <Badge tone="warning">Test mode</Badge>
            </div>
            <div className="grid gap-2">
              {choices.map(({ outcome, icon: Icon, variant, label }) => (
                <Button key={outcome} variant={variant} className="w-full" onClick={() => mockCheckoutStore.complete(outcome)}>
                  <Icon className="size-4" aria-hidden /> {label}
                </Button>
              ))}
              <Button variant="ghost" className="w-full" onClick={() => mockCheckoutStore.complete("closed")}>
                Close without paying
              </Button>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-3.5" aria-hidden /> Secured by Razorpay
          </p>
        </div>
      )}
    </Modal>
  );
}
