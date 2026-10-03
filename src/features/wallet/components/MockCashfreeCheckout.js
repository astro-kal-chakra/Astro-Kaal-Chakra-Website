"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, Clock, CreditCard, Landmark, ShieldCheck, Smartphone, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { mockCheckoutStore } from "../lib/cashfree";
import { SITE_LOCALE } from "@/config/locale";

/**
 * Dev-only stand-in for the Cashfree drop-in checkout. Lets you simulate every
 * gateway outcome. Removed once the real SDK is wired in lib/cashfree.js.
 */
export function MockCashfreeCheckout() {
  const locale = SITE_LOCALE;
  const session = useSyncExternalStore(mockCheckoutStore.subscribe, mockCheckoutStore.get, mockCheckoutStore.getServer);

  const choices = [
    { outcome: "success", icon: CheckCircle2, variant: "success", label: "Simulate success" },
    { outcome: "failure", icon: XCircle, variant: "danger", label: "Simulate failure" },
    { outcome: "pending", icon: Clock, variant: "outline", label: "Simulate pending (slow bank)" },
  ];

  return (
    <Modal open={Boolean(session)} onClose={() => mockCheckoutStore.complete("closed")} title="Cashfree checkout">
      {session && (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-surface-muted p-4">
            <div>
              <p className="text-xs text-muted">Amount payable</p>
              <p className="text-2xl font-bold">{formatCurrency(session.total, locale)}</p>
              <p className="mt-0.5 font-mono text-xs text-muted">{session.orderId}</p>
            </div>
            <Badge tone="warning">Test mode</Badge>
          </div>

          <ul className="grid grid-cols-3 gap-2 text-center text-xs text-muted" aria-label="100% secure payments via Cashfree">
            {[
              [Smartphone, "UPI"],
              [CreditCard, "Cards"],
              [Landmark, "Net banking"],
            ].map(([Icon, label]) => (
              <li key={label} className="flex flex-col items-center gap-1 rounded-xl border border-line p-2">
                <Icon className="size-5 text-brand-500 dark:text-brand-300" aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          <p className="text-sm text-muted">This is a simulated checkout for development. Choose how the payment should end:</p>

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

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-3.5" aria-hidden /> Secured by Cashfree Payments
          </p>
        </div>
      )}
    </Modal>
  );
}
