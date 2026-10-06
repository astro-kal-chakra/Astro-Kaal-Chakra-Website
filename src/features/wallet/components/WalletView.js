"use client";

import { History, Sparkles, Wallet } from "lucide-react";
import { routes } from "@/config/routes";
import { env } from "@/config/site";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { formatCurrency } from "@/lib/utils/format";
import { ButtonLink } from "@/components/ui/Button";
import { MockRazorpayCheckout } from "./MockRazorpayCheckout";
import { PaymentRecoveryBanner } from "./PaymentRecoveryBanner";
import { RechargePanel } from "./RechargePanel";
import { RecentTransactions } from "./RecentTransactions";
import { SITE_LOCALE } from "@/config/locale";

/**
 * Wallet screen: balance, recharge (packs / custom / coupon / GST summary),
 * Razorpay checkout and recent transactions. The wallet is only ever credited by
 * the backend (after payment verify or the Razorpay webhook) — the UI polls order status.
 */
export function WalletView() {
  const locale = SITE_LOCALE;
  const { user } = useAuth();
  const balance = user?.walletBalance ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="sr-only">Wallet</h1>

      <section className="bg-cosmic relative overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8">
        <Sparkles className="absolute -right-4 -top-4 size-32 text-gold-400/10" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-gold-500 text-brand-950 shadow-lg shadow-gold-500/30">
              <Wallet className="size-7" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-brand-200">Wallet balance</p>
              <p className="font-display text-4xl font-bold tabular-nums" aria-live="polite">
                {formatCurrency(balance, locale)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink
              href={routes.walletTransactions}
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <History className="size-4" aria-hidden /> Transaction history
            </ButtonLink>
            <ButtonLink href={routes.astrologers} variant="gold">
              Consult now
            </ButtonLink>
          </div>
        </div>
        <p className="relative mt-4 text-sm text-brand-200">Balance is used for chat, call and video consultations and reports. Unused prepaid session time comes back automatically.</p>
      </section>

      <PaymentRecoveryBanner />

      <RechargePanel />

      <RecentTransactions refreshKey={balance} />

      {/* Mock mode, or the backend's mock gateway in local development (renders nothing otherwise) */}
      <MockRazorpayCheckout />
    </div>
  );
}
