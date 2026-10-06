"use client";

import { CheckCircle2, Gift, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { SITE_LOCALE } from "@/config/locale";
import { Spinner } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { rewardWhen } from "../lib/terms";

/** Optional "Have a referral code?" field on the login form. `referral` = useReferralCode(). */
export function ReferralCodeField({ referral }) {
  const locale = SITE_LOCALE;
  const { code, setCode, open, setOpen, status, terms } = referral;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
        <Gift className="size-4" aria-hidden /> Have a referral code?
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor="referral" className="flex items-center justify-between text-sm font-medium">
        <span>
          Referral code <span className="font-normal text-muted">(optional)</span>
        </span>
        {code && (
          <button type="button" className="text-xs font-normal text-muted underline" onClick={() => setCode("")}>
            Remove
          </button>
        )}
      </label>
      <Input
        id="referral"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your friend's code"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={24}
        className="font-mono tracking-widest"
        aria-invalid={status === "invalid" || undefined}
        aria-describedby="referral-status"
      />
      <div id="referral-status" aria-live="polite" className="min-h-5 text-xs">
        {status === "checking" && (
          <span className="flex items-center gap-1.5 text-muted">
            <Spinner className="size-3.5 border" /> Checking code…
          </span>
        )}
        {status === "valid" && (
          <span className="flex items-start gap-1.5 text-green-700 dark:text-green-400">
            <CheckCircle2 className="mt-px size-3.5 shrink-0" aria-hidden />
            {terms?.refereeReward > 0
              ? `Code applied. You'll get ${formatCurrency(terms.refereeReward, locale)} bonus credit ${rewardWhen(terms, locale)}. New accounts only.`
              : "Code applied. Rewards apply to new accounts only."}
          </span>
        )}
        {status === "invalid" && (
          <span className="flex items-center gap-1.5 text-red-600">
            <XCircle className="size-3.5 shrink-0" aria-hidden /> This code isn&apos;t valid. Check it or remove it.
          </span>
        )}
        {status === "disabled" && <span className="text-muted">Referral rewards are paused right now. You can still continue.</span>}
        {status === "error" && <span className="text-muted">Couldn&apos;t check the code right now. We&apos;ll apply it if it&apos;s valid.</span>}
      </div>
    </div>
  );
}
