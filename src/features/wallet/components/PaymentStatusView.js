"use client";

import { CheckCircle2, Clock, HelpCircle, RotateCcw, ShieldAlert, XCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { formatCurrency } from "@/lib/utils/format";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Skeleton";
import { useOrderStatus } from "../hooks/useOrderStatus";
import { useInflightOrder } from "../lib/inflight";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

/**
 * /wallet/payment/[orderId] — the single source of truth for a payment's outcome.
 * Polls the backend (which only credits after verifying the Razorpay payment).
 */
export function PaymentStatusView({ orderId }) {
  const locale = SITE_LOCALE;
  const { setUser } = useAuth();
  const [inflight, setInflight] = useInflightOrder();

  const { status, order, slow, stopped, recheck } = useOrderStatus(orderId, {
    onDone: (o) => {
      if (o.status === "success" && o.balance != null) setUser((u) => (u ? { ...u, walletBalance: o.balance } : u));
      // Terminal: nothing left to recover on the wallet page.
      if (inflight?.orderId === orderId || !inflight) setInflight(null);
    },
  });

  const money = (n) => formatCurrency(n ?? 0, locale);

  if (status === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-10">
          <Spinner className="size-10" />
          <p className="mt-4 text-muted">Loading…</p>
        </div>
      </Shell>
    );
  }

  if (status === "notFound" || status === "error") {
    return (
      <Shell>
        <StatusIcon icon={HelpCircle} tone="bg-surface-muted text-muted" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Payment not found</h1>
        <p className="mt-2 text-muted">{"We couldn't find this payment. It may have expired."}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {status === "error" && (
            <Button variant="outline" onClick={recheck}>
              <RotateCcw className="size-4" aria-hidden /> Try again
            </Button>
          )}
          <ButtonLink href={routes.wallet}>Back to wallet</ButtonLink>
        </div>
      </Shell>
    );
  }

  if (status === "success") {
    return (
      <Shell>
        <StatusIcon icon={CheckCircle2} tone="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" pulse />
        <h1 className="mt-4 font-display text-2xl font-semibold">Payment successful!</h1>
        <p className="mt-2 text-muted">{`${money(order.credit)} has been added to your wallet.`}</p>
        <dl className="mx-auto mt-6 max-w-xs space-y-2 rounded-2xl bg-surface-muted p-4 text-left text-sm">
          <Line label="Amount paid" value={money(order.total)} />
          <Line label="Credited to wallet" value={`+${money(order.credit)}`} positive />
          {order.bonus > 0 && <Line label="Includes bonus" value={money(order.bonus)} />}
          <div className="border-t border-line pt-2">
            <Line label="New balance" value={money(order.balance)} strong />
          </div>
        </dl>
        <OrderRef orderId={orderId} />
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <ButtonLink href={routes.astrologers} variant="gold" size="lg">
            Talk to an astrologer
          </ButtonLink>
          <ButtonLink href={routes.walletTransactions} variant="outline" size="lg">
            Transaction history
          </ButtonLink>
        </div>
      </Shell>
    );
  }

  if (status === "failed") {
    return (
      <Shell>
        <StatusIcon icon={XCircle} tone="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Payment failed</h1>
        <p className="mt-2 text-muted">{t(`wallet.failureReason.${order?.failureReason || "declined"}`)}</p>
        <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm text-muted">If any money was debited from your account, it will be refunded automatically within 5–7 working days.</p>
        <OrderRef orderId={orderId} />
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <ButtonLink href={`${routes.wallet}?amount=${order?.amount ?? ""}`} variant="gold" size="lg">
            <RotateCcw className="size-4" aria-hidden /> Try again
          </ButtonLink>
          <ButtonLink href={routes.support} variant="outline" size="lg">
            Contact support
          </ButtonLink>
        </div>
      </Shell>
    );
  }

  if (status === "created") {
    return (
      <Shell>
        <StatusIcon icon={ShieldAlert} tone="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Payment not completed</h1>
        <p className="mt-2 text-muted">{"We haven't received a payment for this order yet. If you completed the payment in your UPI app, check again in a moment."}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={recheck}>
            <RotateCcw className="size-4" aria-hidden /> Check again
          </Button>
          <ButtonLink href={routes.wallet}>Back to wallet</ButtonLink>
        </div>
      </Shell>
    );
  }

  // pending
  return (
    <Shell>
      <div className="relative mx-auto flex size-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-gold-400/20" aria-hidden />
        <span className="relative flex size-20 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-300">
          {stopped ? <Clock className="size-9" aria-hidden /> : <Spinner className="size-9 border-gold-300 border-t-gold-600" />}
        </span>
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold" aria-live="polite">
        Confirming your payment…
      </h1>
      <p className="mt-2 text-muted">{`We're waiting for the bank to confirm your payment of ${money(order?.total)}.`}</p>
      <p className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        <ShieldAlert className="size-4 shrink-0" aria-hidden /> {"Please don't close this page or press back."}
      </p>
      {(slow || stopped) && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-muted">This is taking longer than usual. If money was debited, it will be credited to your wallet automatically or refunded to your account within 5–7 working days.</p>
          {stopped && (
            <Button variant="outline" onClick={recheck}>
              <RotateCcw className="size-4" aria-hidden /> Check again
            </Button>
          )}
        </div>
      )}
      <OrderRef orderId={orderId} />
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="mx-auto max-w-lg">
      <Card className="p-6 text-center sm:p-10">{children}</Card>
    </div>
  );
}

function StatusIcon({ icon: Icon, tone, pulse }) {
  return (
    <div className={`mx-auto flex size-20 items-center justify-center rounded-full ${tone}`}>
      <Icon className={`size-10 ${pulse ? "motion-safe:animate-[pulse_1.2s_ease-in-out_2]" : ""}`} aria-hidden />
    </div>
  );
}

function Line({ label, value, positive, strong }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={strong ? "font-semibold" : "text-muted"}>{label}</dt>
      <dd className={`tabular-nums ${strong ? "font-bold" : ""} ${positive ? "font-semibold text-green-700 dark:text-green-400" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function OrderRef({ orderId }) {
  return (
    <p className="mt-4 text-xs text-muted">
      Order ID: <span className="font-mono">{orderId}</span>
    </p>
  );
}
