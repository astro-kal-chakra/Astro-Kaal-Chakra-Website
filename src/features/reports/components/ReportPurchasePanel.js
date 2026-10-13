"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Clock, Plus, ShieldCheck, Wallet } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { reportService } from "@/lib/api/services/report.service";
import { WALLET_CONFIG } from "@/lib/api/services/wallet.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Select } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";
import { reportCopy } from "../lib/copy";

/** Price card + purchase sheet (pick birth profile(s) → pay from wallet / recharge). */
export function ReportPurchasePanel({ report }) {
  const locale = SITE_LOCALE;
  const { requireAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [profiles, setProfiles] = useState(null);
  const off = Math.round((1 - report.price / report.originalPrice) * 100);

  const start = () =>
    requireAuth(() => {
      setSheetKey((k) => k + 1); // fresh sheet state (+ new idempotency key) per attempt
      setOpen(true);
      reportService
        .getBirthProfiles()
        .then(setProfiles)
        .catch(() => setProfiles([]));
    }, "report");

  return (
    <>
      <Card className="space-y-4 p-5 lg:sticky lg:top-24">
        <div className="flex items-end gap-3">
          <p className="font-display text-3xl font-bold">{formatCurrency(report.price, locale)}</p>
          <p className="pb-1 text-sm text-muted line-through">{formatCurrency(report.originalPrice, locale)}</p>
          {off > 0 && (
            <Badge tone="gold" className="mb-1.5">
              {`${off}% off`}
            </Badge>
          )}
        </div>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-brand-500 dark:text-brand-300" aria-hidden />
            {`Ready in about ${report.deliveryHours} hours`}
          </li>
          <li className="flex items-center gap-2">
            <Wallet className="size-4 text-brand-500 dark:text-brand-300" aria-hidden />
            Paid from your wallet balance
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand-500 dark:text-brand-300" aria-hidden />
            Private &amp; secure — only you can see it
          </li>
        </ul>
        <Button variant="gold" size="lg" className="w-full" onClick={start}>
          Buy report
        </Button>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={reportCopy(report).title}>
        <PurchaseSheet key={sheetKey} report={report} profiles={profiles} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function PurchaseSheet({ report, profiles, onClose }) {
  const locale = SITE_LOCALE;
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [pickedState, setPicked] = useState(null);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const idemKey = useRef(null);
  // Default to the first N saved profiles until the user picks.
  const picked = pickedState ?? (profiles || []).slice(0, report.profilesRequired).map((p) => p.id);

  const balance = user?.walletBalance ?? 0;
  const shortfall = Math.max(0, report.price - balance);
  const rechargeAmount = Math.max(Math.ceil(shortfall), WALLET_CONFIG.minAmount);
  const ready = picked.length === report.profilesRequired && picked.every(Boolean) && new Set(picked).size === picked.length;

  const pay = async () => {
    if (paying || !ready) return;
    setPaying(true);
    idemKey.current ??= crypto.randomUUID();
    try {
      const r = await reportService.purchase({ slug: report.slug, profileIds: picked, idempotencyKey: idemKey.current });
      setUser((u) => (u ? { ...u, walletBalance: r.balance } : u));
      setDone(true);
    } catch (e) {
      if (e?.code === "INSUFFICIENT_BALANCE" && e.data?.balance != null) {
        setUser((u) => (u ? { ...u, walletBalance: e.data.balance } : u));
      } else {
        toast({ type: "error", title: "Couldn't complete the purchase", message: e?.message });
      }
    } finally {
      setPaying(false);
    }
  };

  if (done) {
    return (
      <div className="py-4 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h3 className="mt-4 text-lg font-semibold">Report purchased!</h3>
        <p className="mt-1 text-sm text-muted">{`We're preparing your report. It will be ready in about ${report.deliveryHours} hours in My Reports.`}</p>
        <div className="mt-6 grid gap-2">
          <ButtonLink href={routes.myReports} variant="gold">
            Go to My Reports
          </ButtonLink>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const profileLabel = (p) => `${p.name} · ${formatDate(p.dob, locale, { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">
          {report.profilesRequired === 2 ? "Select both partners" : "Generate this report for"}
        </p>
        {profiles === null ? (
          <div className="space-y-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        ) : profiles.length === 0 ? (
          <p className="rounded-xl bg-surface-muted p-3 text-sm text-muted">{"You don't have any saved birth profiles yet."}</p>
        ) : report.profilesRequired === 1 ? (
          <div role="radiogroup" aria-label="Generate this report for" className="space-y-2">
            {profiles.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition",
                  picked[0] === p.id
                    ? "border-brand-500 bg-brand-50 dark:border-gold-500 dark:bg-brand-800/40"
                    : "border-line hover:bg-surface-muted",
                )}
              >
                <input
                  type="radio"
                  name="profile"
                  className="size-4 accent-brand-600"
                  checked={picked[0] === p.id}
                  onChange={() => setPicked([p.id])}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {p.name} <span className="text-xs font-normal text-muted">· {t(`wallet.reports.relation.${p.relation}`)}</span>
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {formatDate(p.dob, locale)} · {p.tob} · {p.place}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Field key={i} label={(i === 0 ? "Person 1" : "Person 2")} htmlFor={`profile-${i}`}>
                <Select
                  id={`profile-${i}`}
                  value={picked[i] || ""}
                  onChange={(e) => setPicked(Object.assign([...picked], { [i]: e.target.value }))}
                >
                  <option value="" disabled>
                    Choose a profile
                  </option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id} disabled={picked[1 - i] === p.id}>
                      {profileLabel(p)}
                    </option>
                  ))}
                </Select>
              </Field>
            ))}
          </div>
        )}
        <LocaleLink
          href={routes.birthProfiles}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-gold-400"
        >
          <Plus className="size-4" aria-hidden /> Add a new birth profile
        </LocaleLink>
      </div>

      <dl className="space-y-2 rounded-2xl bg-surface-muted p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Report price</dt>
          <dd className="font-semibold">{formatCurrency(report.price, locale)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Wallet balance</dt>
          <dd className={cn("font-semibold", shortfall > 0 && "text-red-600 dark:text-red-400")}>{formatCurrency(balance, locale)}</dd>
        </div>
        {shortfall > 0 && (
          <div className="flex justify-between border-t border-line pt-2">
            <dt className="font-medium">Amount needed</dt>
            <dd className="font-bold text-red-600 dark:text-red-400">{formatCurrency(shortfall, locale)}</dd>
          </div>
        )}
      </dl>

      {shortfall > 0 ? (
        <div className="space-y-2">
          <p className="text-center text-sm text-muted" role="alert">
            {"You don't have enough balance for this report."}
          </p>
          <ButtonLink href={`${routes.wallet}?amount=${rechargeAmount}`} variant="gold" size="lg" className="w-full">
            {`Recharge ${formatCurrency(rechargeAmount, locale)}`}
          </ButtonLink>
        </div>
      ) : (
        <Button variant="gold" size="lg" className="w-full" disabled={!ready} loading={paying} onClick={pay}>
          {`Pay ${formatCurrency(report.price, locale)} from wallet`}
        </Button>
      )}
    </div>
  );
}
