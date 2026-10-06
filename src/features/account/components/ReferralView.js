"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, Copy, Gift, MessageCircle, Share2, UserPlus, Wallet } from "lucide-react";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { referralService } from "@/lib/api/services/referral.service";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAccountResource } from "../hooks/useAccountResource";
import { formatShortDate } from "../lib/format";
import { AccountShell } from "./AccountShell";
import { AccountEmptyCard, AccountErrorState } from "./AccountStates";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";
import { rewardWhen } from "@/features/referral/lib/terms";

const STEPS = [
  { icon: Share2, n: 1 },
  { icon: UserPlus, n: 2 },
  { icon: Wallet, n: 3 },
];
const TERMS = ["t1", "t2", "t3", "t4", "t5"];
const FRIEND = { who: "your friend", whose: "your friend's" };

function ReferralCodeCard({ referral }) {
  const locale = SITE_LOCALE;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const link = `${siteConfig.url}${routes.login}?ref=${referral.code}`;
  const message = `I use ${siteConfig.name} to talk to verified astrologers. Sign up with my code ${referral.code} and get ${formatCurrency(referral.friendReward, locale)} wallet credit: ${link}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referral.code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ type: "error", title: "Couldn't copy. Please copy it manually." });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Talk to an astrologer", text: message, url: link });
      } catch {
        // user cancelled the share sheet
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      toast({ id: "referral-copied", type: "success", title: "Copied!" });
    } catch {
      toast({ type: "error", title: "Couldn't copy. Please copy it manually." });
    }
  };

  return (
    <Card className="bg-cosmic overflow-hidden border-0 p-5 text-white sm:p-6">
      <div className="flex items-start gap-4">
        <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 sm:flex">
          <Gift className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold">
            {`Give ${formatCurrency(referral.friendReward, locale)}, get ${formatCurrency(referral.rewardPerReferral, locale)}`}
          </h2>
          <p className="mt-1 text-sm text-white/90">
            {`Your friend signs up with your code. You get ${formatCurrency(referral.rewardPerReferral, locale)} and they get ${formatCurrency(referral.friendReward, locale)} bonus credit ${rewardWhen(referral, locale, FRIEND)}.`}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-white/90">Your referral code</p>
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-white/70 bg-white/10 p-2 pl-4">
          <span className="flex-1 font-mono text-xl font-bold tracking-[0.2em] text-white">{referral.code}</span>
          <Button size="sm" variant="light" onClick={copy} aria-live="polite">
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "success", className: "flex-1" })}
        >
          <MessageCircle className="size-4" aria-hidden /> Share on WhatsApp
        </a>
        <Button variant="outline" className="flex-1 border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={shareNative}>
          <Share2 className="size-4" aria-hidden /> More options
        </Button>
      </div>
    </Card>
  );
}

function RewardsList({ referral }) {
  const locale = SITE_LOCALE;
  const credited = referral.rewards.filter((r) => r.status === "credited").reduce((sum, r) => sum + r.amount, 0);

  return (
    <section aria-labelledby="rewards-title">
      <h2 id="rewards-title" className="mb-3 text-lg font-semibold">
        Rewards earned
      </h2>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted">Total earned</p>
          <p className="font-display text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(credited, locale)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Friends joined</p>
          <p className="font-display text-2xl font-bold">{referral.rewards.length}</p>
        </Card>
      </div>
      {referral.rewards.length === 0 ? (
        <AccountEmptyCard icon={Gift} title="No rewards yet" description="Invite your first friend to start earning." />
      ) : (
        <Card as="ul" className="divide-y divide-line">
          {referral.rewards.map((r) => (
            <li key={r.id} className="flex items-center gap-3 p-4">
              <Avatar name={r.friendName} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.friendName}</p>
                <p className="text-xs text-muted">{`Joined ${formatShortDate(r.joinedAt, locale)}`}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(r.amount, locale)}</p>
                <Badge tone={r.status === "credited" ? "success" : "warning"}>{t(`account.referral.rewardStatus.${r.status}`)}</Badge>
              </div>
            </li>
          ))}
        </Card>
      )}
    </section>
  );
}

export function ReferralView() {
  const { data, status, reload } = useAccountResource(() => referralService.get());

  return (
    <AccountShell title="Refer & earn" subtitle="Share the guidance. Get rewarded.">
      <div className="space-y-8">
        {status === "loading" && (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        )}
        {status === "error" && <AccountErrorState onRetry={reload} />}
        {status === "success" && <ReferralCodeCard referral={data} />}

        <section aria-labelledby="how-title">
          <h2 id="how-title" className="mb-3 text-lg font-semibold">
            How it works
          </h2>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, n }) => (
              <Card as="li" key={n} className="p-4">
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-800 dark:text-gold-400">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="font-semibold">
                  {n}. {t(`account.referral.how${n}Title`)}
                </p>
                <p className="mt-1 text-sm text-muted">{t(`account.referral.how${n}Text`)}</p>
              </Card>
            ))}
          </ol>
        </section>

        {status === "success" && <RewardsList referral={data} />}

        <details className="group overflow-hidden rounded-2xl border border-line bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold [&::-webkit-details-marker]:hidden">
            Terms &amp; conditions
            <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <ul className="list-disc space-y-1.5 px-4 pb-4 pl-9 text-sm leading-relaxed text-muted">
            {TERMS.map((k) => (
              <li key={k}>{k === "t3" && data ? `Rewards are credited ${rewardWhen(data, SITE_LOCALE, FRIEND)}.` : t(`account.referral.terms.${k}`)}</li>
            ))}
          </ul>
        </details>
      </div>
    </AccountShell>
  );
}
