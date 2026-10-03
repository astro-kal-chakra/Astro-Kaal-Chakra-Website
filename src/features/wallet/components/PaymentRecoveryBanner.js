"use client";

import { useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Spinner } from "@/components/ui/Skeleton";
import { useOrderStatus } from "../hooks/useOrderStatus";
import { useInflightOrder } from "../lib/inflight";
import { SITE_LOCALE } from "@/config/locale";

/**
 * "We're checking your last payment" — resumes polling an order the user left
 * mid-payment (closed tab, UPI app switch, crash). Cleared when dismissed.
 */
export function PaymentRecoveryBanner() {
  const locale = SITE_LOCALE;
  const { setUser } = useAuth();
  const [stored, setInflight] = useInflightOrder();
  // Orders started after this page mounted are being paid right now in this tab — not a recovery case.
  const [mountedAt] = useState(() => Date.now());
  const inflight = stored && stored.startedAt < mountedAt ? stored : null;
  const { status, order } = useOrderStatus(inflight?.orderId, {
    enabled: Boolean(inflight),
    onDone: (o) => {
      if (o.status === "success" && o.balance != null) setUser((u) => (u ? { ...u, walletBalance: o.balance } : u));
    },
  });

  if (!inflight) return null;

  const amount = formatCurrency(order?.total ?? inflight.total ?? 0, locale);
  const dismiss = () => setInflight(null);

  const view = {
    success: {
      icon: CheckCircle2,
      tone: "border-green-500/30 bg-green-50 dark:bg-green-900/20",
      iconTone: "text-green-600 dark:text-green-400",
      title: "Your last payment was successful",
      text: `${formatCurrency(order?.credit ?? 0, locale)} has been added to your wallet.`,
    },
    failed: {
      icon: XCircle,
      tone: "border-red-500/30 bg-red-50 dark:bg-red-900/20",
      iconTone: "text-red-600 dark:text-red-400",
      title: "Your last payment failed",
      text: `The payment of ${amount} didn't go through. If money was debited, it will be refunded automatically.`,
    },
    created: {
      icon: Info,
      tone: "border-line bg-surface-muted",
      iconTone: "text-muted",
      title: "Your last payment wasn't completed",
      text: `The payment of ${amount} was not completed. No money was deducted.`,
    },
    notFound: {
      icon: Info,
      tone: "border-line bg-surface-muted",
      iconTone: "text-muted",
      title: "Your last payment wasn't completed",
      text: `The payment of ${amount} was not completed. No money was deducted.`,
    },
  }[status];

  const done = Boolean(view);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-start gap-3 rounded-2xl border p-4", view?.tone || "border-gold-400/40 bg-gold-100/60 dark:bg-gold-700/15")}
    >
      {done ? (
        <view.icon className={cn("mt-0.5 size-5 shrink-0", view.iconTone)} aria-hidden />
      ) : (
        <Spinner className="mt-0.5 size-5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{done ? view.title : "We're checking your last payment"}</p>
        <p className="text-sm text-muted">{done ? view.text : `Your payment of ${amount} is being confirmed with the bank. This usually takes a few seconds.`}</p>
        {status !== "notFound" && (
          <LocaleLink
            href={routes.paymentStatus(inflight.orderId)}
            className="mt-1 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-gold-400"
          >
            View details
          </LocaleLink>
        )}
      </div>
      {done && (
        <button onClick={dismiss} className="-m-1 rounded-full p-1 text-muted hover:bg-surface-muted" aria-label="Dismiss">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
