"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, Plus, ShieldCheck } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { AccountTextarea } from "@/features/account/components/AccountControls";
import { formatBirthDate } from "@/features/account/lib/format";
import { getCurrentLanguage } from "@/features/translate/lib/googleTranslate";
import { REMEDY_QUESTION_MAX, REMEDY_QUESTION_MIN, remedyService } from "@/lib/api/services/remedy.service";
import { WALLET_CONFIG } from "@/lib/api/services/wallet.service";
import { userService } from "@/lib/api/services/user.service";
import { categoryLabel, label as t } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { invalidateRemedyConfig } from "../hooks/useRemedyConfig";
import { remedyErrorText } from "../lib/remedies";

const SELF = "self";

/** Ask for a remedy: whose chart, category, question, then pay from the wallet (or recharge). */
export function RemedyRequestForm({ astrologer, config, onClose, onUnavailable }) {
  const locale = SITE_LOCALE;
  const { user, setUser } = useAuth();
  const [profiles, setProfiles] = useState(null); // null = loading
  const [whose, setWhose] = useState(SELF);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null); // { code, text }
  const [blocked, setBlocked] = useState(false); // feature off / astrologer not accepting
  const [done, setDone] = useState(null); // the created remedy
  // One key per submit attempt, reused when retrying after a dropped connection (never charged twice)
  const idemKey = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    let alive = true;
    userService
      .listBirthProfiles()
      .then((list) => alive && setProfiles(Array.isArray(list) ? list : []))
      .catch(() => alive && setProfiles([]));
    return () => {
      alive = false;
    };
  }, []);

  // The form is long on phones: bring a new error into view
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [error]);

  const q = question.trim();
  const qError = q.length < REMEDY_QUESTION_MIN ? `Write at least ${REMEDY_QUESTION_MIN} characters` : q.length > REMEDY_QUESTION_MAX ? `Keep it under ${REMEDY_QUESTION_MAX} characters` : null;
  const categories = config.categories?.length ? config.categories : ["other"];
  const ready = Boolean(category) && !qError && !blocked;

  const balance = user?.walletBalance ?? 0;
  const shortfall = Math.max(0, config.price - balance);
  const rechargeAmount = Math.max(Math.ceil(shortfall), WALLET_CONFIG.minAmount);

  // Editing clears the last error. The key is kept after a dropped connection: that request may have gone through.
  const edit = (fn) => (value) => {
    setError(null);
    fn(value);
  };

  const submit = async () => {
    setTouched(true);
    if (sending || !ready) return;
    setSending(true);
    setError(null);
    idemKey.current ??= crypto.randomUUID();
    try {
      const res = await remedyService.create({
        astrologerId: astrologer.id,
        profileId: whose === SELF ? undefined : whose,
        category,
        question: q,
        language: getCurrentLanguage(),
        idempotencyKey: idemKey.current,
      });
      if (typeof res?.balance === "number") setUser((u) => (u ? { ...u, walletBalance: res.balance } : u));
      setDone(res?.remedy || {});
    } catch (e) {
      // A definite answer from the server means nothing was charged: the next try is a new attempt
      if (e?.status) idemKey.current = null;
      const code = e?.status ? e.code : "NETWORK";
      if (code === "INSUFFICIENT_BALANCE" && e.data?.balance != null) setUser((u) => (u ? { ...u, walletBalance: e.data.balance } : u));
      if (code === "REMEDIES_OFF" || code === "NOT_ACCEPTING") {
        invalidateRemedyConfig();
        setBlocked(true);
        onUnavailable?.();
      }
      if (code === "PROFILE_NOT_FOUND") {
        setWhose(SELF);
        userService.listBirthProfiles().then(setProfiles).catch(() => {});
      }
      setError({ code, text: remedyErrorText(e) });
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="py-4 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h3 className="mt-4 text-lg font-semibold">Request sent</h3>
        <p className="mt-1 text-sm text-muted">
          {`${astrologer.name} will reply within ${config.deliveryHours} hours. We'll notify you when your remedy is ready. If there is no reply in time, the full amount comes back to your wallet.`}
        </p>
        <div className="mt-6 grid gap-2">
          {done.id ? (
            <ButtonLink href={routes.remedy(done.id)} variant="gold">
              View my request
            </ButtonLink>
          ) : (
            <ButtonLink href={routes.myRemedies} variant="gold">
              Go to My remedies
            </ButtonLink>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const options = [
    { id: SELF, name: user?.name || "Myself", sub: user?.dob ? `You · ${formatBirthDate(user.dob, locale)}` : "You · your profile details" },
    ...(profiles || []).map((p) => ({
      id: p.id,
      name: p.name,
      sub: [t(`account.birthProfiles.relations.${p.relation}`), p.dob && formatBirthDate(p.dob, locale)].filter(Boolean).join(" · "),
    })),
  ];

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Whose remedy is it?</legend>
        <div className="space-y-2">
          {options.map((o) => (
            <label
              key={o.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition",
                whose === o.id ? "border-brand-500 bg-brand-50 dark:border-gold-500 dark:bg-brand-800/40" : "border-line hover:bg-surface-muted"
              )}
            >
              <input type="radio" name="remedy-whose" className="size-4 accent-brand-600" checked={whose === o.id} onChange={() => edit(setWhose)(o.id)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{o.name}</span>
                <span className="block truncate text-xs text-muted">{o.sub}</span>
              </span>
            </label>
          ))}
          {profiles === null && <Skeleton className="h-14 rounded-xl" />}
        </div>
        <LocaleLink
          href={routes.birthProfiles}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-gold-400"
        >
          <Plus className="size-4" aria-hidden /> Add a family member
        </LocaleLink>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">What is it about?</legend>
        <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => edit(setCategory)(c)}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-600 bg-brand-600 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-brand-950"
                    : "border-line bg-surface text-muted hover:text-fg"
                )}
              >
                {categoryLabel(c)}
              </button>
            );
          })}
        </div>
        {touched && !category && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
            Choose a category
          </p>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="remedy-question" className="block text-sm font-medium">
          Your question
        </label>
        <AccountTextarea
          id="remedy-question"
          value={question}
          maxLength={REMEDY_QUESTION_MAX}
          onChange={(e) => edit(setQuestion)(e.target.value)}
          placeholder="Describe your problem in a few lines. For example: I keep facing delays in my job change. What can I do?"
          aria-invalid={touched && Boolean(qError)}
          aria-describedby="remedy-question-help"
        />
        <div id="remedy-question-help" className="flex items-start justify-between gap-3 text-xs">
          <span className={cn(touched && qError ? "text-red-600 dark:text-red-400" : "text-muted")}>
            {touched && qError ? qError : `At least ${REMEDY_QUESTION_MIN} characters`}
          </span>
          <span className={cn("shrink-0 tabular-nums", q.length > REMEDY_QUESTION_MAX ? "text-red-600" : "text-muted")}>
            {`${question.length}/${REMEDY_QUESTION_MAX}`}
          </span>
        </div>
      </div>

      <dl className="space-y-2 rounded-2xl bg-surface-muted p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Remedy price</dt>
          <dd className="font-semibold">{formatCurrency(config.price, locale)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Wallet balance</dt>
          <dd className={cn("font-semibold", shortfall > 0 && "text-red-600 dark:text-red-400")}>{formatCurrency(balance, locale)}</dd>
        </div>
        {shortfall > 0 && (
          <div className="flex justify-between gap-3 border-t border-line pt-2">
            <dt className="font-medium">Amount needed</dt>
            <dd className="font-bold text-red-600 dark:text-red-400">{formatCurrency(shortfall, locale)}</dd>
          </div>
        )}
      </dl>

      <p className="flex gap-2 text-xs text-muted">
        <ShieldCheck className="size-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
        {`If ${astrologer.name} doesn't reply within ${config.deliveryHours} hours, or declines, the full amount goes back to your wallet automatically. You can cancel until the astrologer opens your request.`}
      </p>

      {error && (
        <div ref={errorRef} role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p>{error.text}</p>
            {error.code === "BIRTH_DETAILS_REQUIRED" && (
              <LocaleLink href={routes.profile} className="mt-1 inline-block font-semibold underline">
                Add birth details
              </LocaleLink>
            )}
            {error.code === "TOO_MANY_PENDING" && (
              <LocaleLink href={routes.myRemedies} className="mt-1 inline-block font-semibold underline">
                See my remedies
              </LocaleLink>
            )}
            {error.code === "ASTRO_BUSY" && (
              <LocaleLink href={routes.astrologers} className="mt-1 inline-block font-semibold underline">
                Choose another astrologer
              </LocaleLink>
            )}
          </div>
        </div>
      )}

      {blocked ? (
        <Button variant="outline" size="lg" className="w-full" onClick={onClose}>
          Close
        </Button>
      ) : shortfall > 0 ? (
        <div className="space-y-2">
          <p className="text-center text-sm text-muted">{"You don't have enough balance for this remedy."}</p>
          <ButtonLink href={`${routes.wallet}?amount=${rechargeAmount}`} variant="gold" size="lg" className="w-full">
            {`Recharge ${formatCurrency(rechargeAmount, locale)}`}
          </ButtonLink>
        </div>
      ) : (
        <Button type="submit" variant="gold" size="lg" className="w-full" loading={sending}>
          {sending ? "Sending..." : `Pay ${formatCurrency(config.price, locale)} and send`}
        </Button>
      )}
    </form>
  );
}
