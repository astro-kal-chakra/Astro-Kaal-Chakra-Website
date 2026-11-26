"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, Plus, ShieldCheck } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { AccountTextarea } from "@/features/account/components/AccountControls";
import { formatBirthDate } from "@/features/account/lib/format";
import { reportCopy } from "@/features/reports/lib/copy";
import { getCurrentLanguage } from "@/features/translate/lib/googleTranslate";
import { REPORT_QUESTION_MAX, reportRequestService } from "@/lib/api/services/reportRequest.service";
import { WALLET_CONFIG } from "@/lib/api/services/wallet.service";
import { userService } from "@/lib/api/services/user.service";
import { hasLabel, label as t } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { invalidateReportRequestConfig } from "../hooks/useReportRequestConfig";
import { deliveryText, reportRequestErrorText } from "../lib/reportRequests";
import { ANY_EXPERT, AstrologerChooser, AstrologerLine } from "./AstrologerChooser";

const SELF = "self";

const optionClass = (active) =>
  cn(
    "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition",
    active ? "border-brand-500 bg-brand-50 dark:border-gold-500 dark:bg-brand-800/40" : "border-line hover:bg-surface-muted"
  );

const relationText = (r) => (r && hasLabel(`account.birthProfiles.relations.${r}`) ? t(`account.birthProfiles.relations.${r}`) : "");

const Legend = ({ step, children }) => (
  <legend className="mb-2 flex items-center gap-2 text-sm font-semibold">
    <span className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-[11px] text-white dark:bg-gold-500 dark:text-brand-950">{step}</span>
    {children}
  </legend>
);

/**
 * Order a report from an astrologer: which report (unless fixed), who writes it ("Any expert" or an astrologer,
 * unless fixed), who it is for, an optional question, then pay from the wallet (or recharge).
 * `product` / `astrologer` fix that choice (report page / astrologer profile).
 */
export function ReportOrderForm({ config, product: fixedProduct, astrologer: fixedAstrologer, onClose, onUnavailable }) {
  const locale = SITE_LOCALE;
  const { user, setUser } = useAuth();
  const products = config?.products || [];
  const allowAny = config?.allowAnyExpert !== false;

  const [productId, setProductId] = useState(fixedProduct?.id || (products.length === 1 ? products[0].id : ""));
  const [choice, setChoice] = useState(fixedAstrologer || (allowAny ? ANY_EXPERT : null));
  const [profiles, setProfiles] = useState(null); // null = loading
  const [whose, setWhose] = useState(SELF);
  const [pairState, setPair] = useState(null);
  const [question, setQuestion] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null); // { code, text }
  const [blocked, setBlocked] = useState(false);
  const [done, setDone] = useState(null);
  // One key per order attempt, reused when retrying after a dropped connection (never charged twice)
  const idemKey = useRef(null);
  const errorRef = useRef(null);

  const loadProfiles = () =>
    userService
      .listBirthProfiles()
      .then((list) => setProfiles(Array.isArray(list) ? list : []))
      .catch(() => setProfiles([]));

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

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [error]);

  const product = fixedProduct || products.find((p) => p.id === productId) || null;
  const two = product?.profilesRequired === 2;
  // Couples: the first two saved profiles until the user picks
  const pair = pairState ?? (profiles || []).slice(0, 2).map((p) => p.id);
  const pairOk = pair.length === 2 && pair.every(Boolean) && pair[0] !== pair[1];

  const price = product?.price ?? 0;
  const balance = user?.walletBalance ?? 0;
  const shortfall = product ? Math.max(0, price - balance) : 0;
  const rechargeAmount = Math.max(Math.ceil(shortfall), WALLET_CONFIG.minAmount);
  const astroName = choice && choice !== ANY_EXPERT ? choice.name : null;

  const problems = {
    product: !product && "Choose a report",
    astrologer: !choice && "Choose an astrologer",
    people: product && two && !pairOk && "Choose two different people",
    question: question.trim().length > REPORT_QUESTION_MAX && `Keep it under ${REPORT_QUESTION_MAX} characters`,
  };
  const ready = !Object.values(problems).some(Boolean) && !blocked;

  // Editing clears the last error. The key is kept after a dropped connection: that order may have gone through.
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
      const res = await reportRequestService.create({
        productId: product.id,
        astrologerId: choice === ANY_EXPERT ? null : choice.id,
        profileIds: two ? pair : whose === SELF ? undefined : [whose],
        question: question.trim() || undefined,
        language: getCurrentLanguage(),
        idempotencyKey: idemKey.current,
      });
      if (typeof res?.balance === "number") setUser((u) => (u ? { ...u, walletBalance: res.balance } : u));
      setDone(res?.request || {});
    } catch (e) {
      // A definite answer from the server means nothing was charged: the next try is a new attempt
      if (e?.status) idemKey.current = null;
      const code = e?.status ? e.code : "NETWORK";
      if (code === "INSUFFICIENT_BALANCE" && e.data?.balance != null) setUser((u) => (u ? { ...u, walletBalance: e.data.balance } : u));
      if (code === "REPORTS_OFF") {
        invalidateReportRequestConfig();
        setBlocked(true);
        onUnavailable?.();
      }
      if (code === "PROFILE_NOT_FOUND") {
        setWhose(SELF);
        setPair(null);
        loadProfiles();
      }
      setError({ code, text: reportRequestErrorText(e) });
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const team = done.chosenBy === "team" || !astroName;
    return (
      <div className="py-4 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h3 className="mt-4 text-lg font-semibold">Report ordered</h3>
        <p className="mt-1 text-sm text-muted">
          {team
            ? `Our team will choose an astrologer for you. Your report will be ready within ${deliveryText(product?.deliveryHours)}. We'll notify you when it is ready.`
            : `${astroName} will write your report within ${deliveryText(product?.deliveryHours)}. We'll notify you when it is ready.`}
        </p>
        <p className="mt-2 text-xs text-muted">If it isn&apos;t delivered in time, the full amount comes back to your wallet automatically.</p>
        <div className="mt-6 grid gap-2">
          <ButtonLink href={done.id ? routes.reportRequest(done.id) : routes.myReportRequests} variant="gold">
            View my report request
          </ButtonLink>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const selfOption = {
    id: SELF,
    name: user?.name || "Myself",
    sub: user?.dob ? `You · ${formatBirthDate(user.dob, locale)}` : "You · your profile details",
  };
  const profileOptions = (profiles || []).map((p) => ({
    id: p.id,
    name: p.name,
    sub: [relationText(p.relation), p.dob && formatBirthDate(p.dob, locale)].filter(Boolean).join(" · "),
  }));
  const fieldError = (msg) =>
    touched && msg ? (
      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
        {msg}
      </p>
    ) : null;

  let step = 0;
  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {!fixedProduct && (
        <fieldset>
          <Legend step={++step}>Choose a report</Legend>
          {products.length === 0 ? (
            <p className="rounded-xl bg-surface-muted p-3 text-sm text-muted">No reports are available right now.</p>
          ) : (
            <div role="radiogroup" aria-label="Report" className="space-y-2">
              {products.map((p) => (
                <label key={p.id} className={optionClass(productId === p.id)}>
                  <input type="radio" name="report-product" className="size-4 accent-brand-600" checked={productId === p.id} onChange={() => edit(setProductId)(p.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{reportCopy(p).title}</span>
                    <span className="block text-xs text-muted">
                      {[`Within ${deliveryText(p.deliveryHours)}`, p.profilesRequired === 2 ? "For two people" : null].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span translate="no" className="notranslate shrink-0 text-sm font-semibold">
                    {formatCurrency(p.price, locale)}
                  </span>
                </label>
              ))}
            </div>
          )}
          {fieldError(problems.product)}
        </fieldset>
      )}

      <fieldset>
        <Legend step={++step}>Who writes it?</Legend>
        {fixedAstrologer ? (
          <div className={optionClass(true)}>
            <AstrologerLine astrologer={fixedAstrologer} />
          </div>
        ) : (
          <AstrologerChooser value={choice} onChange={edit(setChoice)} allowAnyExpert={allowAny} />
        )}
        {fieldError(problems.astrologer)}
      </fieldset>

      <fieldset>
        <Legend step={++step}>{two ? "Who is it for? (two people)" : "Who is it for?"}</Legend>
        {two ? (
          profiles === null ? (
            <Skeleton className="h-11 rounded-xl" />
          ) : profiles.length < 2 ? (
            <p className="rounded-xl bg-surface-muted p-3 text-sm text-muted">This report needs the birth details of two people. Please save both as birth profiles first.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <Field key={i} label={i === 0 ? "Person 1" : "Person 2"} htmlFor={`rr-person-${i}`}>
                  <Select id={`rr-person-${i}`} value={pair[i] || ""} onChange={(e) => edit(setPair)(Object.assign([...pair], { [i]: e.target.value }))}>
                    <option value="" disabled>
                      Choose a profile
                    </option>
                    {profileOptions.map((p) => (
                      <option key={p.id} value={p.id} disabled={pair[1 - i] === p.id}>
                        {[p.name, p.sub].filter(Boolean).join(" · ")}
                      </option>
                    ))}
                  </Select>
                </Field>
              ))}
            </div>
          )
        ) : (
          <div role="radiogroup" aria-label="Who is it for?" className="space-y-2">
            {[selfOption, ...profileOptions].map((o) => (
              <label key={o.id} className={optionClass(whose === o.id)}>
                <input type="radio" name="report-whose" className="size-4 accent-brand-600" checked={whose === o.id} onChange={() => edit(setWhose)(o.id)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{o.name}</span>
                  <span className="block truncate text-xs text-muted">{o.sub}</span>
                </span>
              </label>
            ))}
            {profiles === null && <Skeleton className="h-14 rounded-xl" />}
          </div>
        )}
        {fieldError(problems.people)}
        <LocaleLink href={routes.birthProfiles} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-gold-400">
          <Plus className="size-4" aria-hidden /> Add a birth profile
        </LocaleLink>
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="rr-question" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-[11px] text-white dark:bg-gold-500 dark:text-brand-950">{++step}</span>
          Anything the astrologer should focus on? <span className="font-normal text-muted">(optional)</span>
        </label>
        <AccountTextarea
          id="rr-question"
          value={question}
          maxLength={REPORT_QUESTION_MAX}
          onChange={(e) => edit(setQuestion)(e.target.value)}
          placeholder="For example: Please focus on my career and the right time to change jobs."
          className="min-h-24"
        />
        <div className="text-right text-xs tabular-nums text-muted">{`${question.length}/${REPORT_QUESTION_MAX}`}</div>
      </div>

      <dl className="space-y-2 rounded-2xl bg-surface-muted p-4 text-sm">
        {product && (
          <div className="flex justify-between gap-3">
            <dt className="min-w-0 truncate text-muted">{reportCopy(product).title}</dt>
            <dd className="shrink-0 font-semibold">{formatCurrency(price, locale)}</dd>
          </div>
        )}
        {product && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Delivery</dt>
            <dd className="font-medium">{`Within ${deliveryText(product.deliveryHours)}`}</dd>
          </div>
        )}
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
        {`If the report isn't delivered in time, or the astrologer declines, the full amount goes back to your wallet automatically. You can cancel until the astrologer opens your request.`}
      </p>

      {error && (
        <div ref={errorRef} role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p>{error.text}</p>
            {error.code === "BIRTH_DETAILS_REQUIRED" && (
              <LocaleLink href={whose === SELF && !two ? routes.profile : routes.birthProfiles} className="mt-1 inline-block font-semibold underline">
                Add birth details
              </LocaleLink>
            )}
            {error.code === "PROFILES_REQUIRED" && (
              <LocaleLink href={routes.birthProfiles} className="mt-1 inline-block font-semibold underline">
                Manage birth profiles
              </LocaleLink>
            )}
            {error.code === "TOO_MANY_PENDING" && (
              <LocaleLink href={routes.myReportRequests} className="mt-1 inline-block font-semibold underline">
                See my reports
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
          <p className="text-center text-sm text-muted">{"You don't have enough balance for this report."}</p>
          <ButtonLink href={`${routes.wallet}?amount=${rechargeAmount}`} variant="gold" size="lg" className="w-full">
            {`Recharge ${formatCurrency(rechargeAmount, locale)}`}
          </ButtonLink>
        </div>
      ) : (
        <Button type="submit" variant="gold" size="lg" className="w-full" loading={sending}>
          {sending ? "Placing order..." : product ? `Pay ${formatCurrency(price, locale)} and order` : "Order report"}
        </Button>
      )}
    </form>
  );
}
