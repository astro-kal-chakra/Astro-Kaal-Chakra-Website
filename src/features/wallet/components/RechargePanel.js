"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, Gift, Landmark, Lock, ShieldCheck, Smartphone, Tag, X } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { OFFER_ENDED_CODE, WALLET_CONFIG, quoteRecharge, walletService } from "@/lib/api/services/wallet.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { openCheckout } from "../lib/razorpay";
import { useInflightOrder } from "../lib/inflight";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const COUPON_ERRORS ={ INVALID_COUPON: "wallet.couponInvalid", COUPON_MIN_AMOUNT: "wallet.couponMinAmount" };

const HOUR = 3600_000;

/** GST rate from /wallet/config as a percentage label: 0.18 -> "18%". */
const gstPercent = (rate) => `${Math.round((rate || 0) * 10000) / 100}%`;

/** "Ends 25 Oct" (IST), or "Ends in 5h" / "Ends in 40m" within the last 24 hours. */
function endsLabel(endsAt, now, locale) {
  const left = endsAt - now;
  if (left <= 0) return "Offer ended";
  if (left < HOUR) return `Ends in ${Math.max(1, Math.ceil(left / 60_000))}m`;
  if (left < 24 * HOUR) return `Ends in ${Math.ceil(left / HOUR)}h`;
  return `Ends ${formatDate(endsAt, locale, { day: "numeric", month: "short" })}`;
}

export function RechargePanel() {
  const locale = SITE_LOCALE;
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setInflight] = useInflightOrder();

  const [packs, setPacks] = useState(null);
  const [config, setConfig] = useState(WALLET_CONFIG);
  // ?amount=… pre-fills (retry after failure, "insufficient balance → recharge").
  const [choice, setChoice] = useState(() => {
    const a = Number(searchParams.get("amount"));
    return { packId: null, custom: Number.isFinite(a) && a > 0 ? String(Math.ceil(a)) : "" };
  });
  const { packId: selected, custom } = choice;
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState({ status: "idle" }); // idle | checking | applied | invalid
  const [paying, setPaying] = useState(false);

  // One idempotency key per attempt (same amount + coupon). Reset when the order changes.
  const idemKey = useRef(null);
  const busy = useRef(false);
  const couponReq = useRef(0); // ignore out-of-order coupon responses
  const [now, setNow] = useState(() => Date.now()); // drives the "Ends in…" countdowns

  // Packs and config both come from the backend (packs already filtered for this user, in display order).
  const loadPacks = useCallback(
    () =>
      Promise.all([walletService.getPacks(), walletService.getConfig()]).then(([p, cfg]) => {
        setPacks(p);
        setConfig(cfg);
        setNow(Date.now());
        setChoice((cur) => {
          if (cur.packId && p.some((x) => x.id === cur.packId)) return cur;
          const match = cur.custom && p.find((x) => x.amount === Number(cur.custom));
          if (match) return { packId: match.id, custom: "" };
          if (cur.custom) return cur;
          return { packId: p.find((x) => x.tag === "popular")?.id ?? p[0]?.id, custom: "" };
        });
      }),
    [],
  );

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // A festival offer that runs out while the page is open drops off; the backend has the final say (OFFER_ENDED).
  const visiblePacks = packs?.filter((p) => !p.endsAt || p.endsAt > now);
  const hasFirstOffer = visiblePacks?.some((p) => p.offer === "first");

  const pack = !custom && visiblePacks?.find((p) => p.id === selected);
  const amount = custom ? Number(custom) : pack?.amount || 0;

  let amountError = null;
  if (custom) {
    if (!Number.isInteger(amount)) amountError = "Enter a whole amount in rupees";
    else if (amount < config.minAmount) amountError = `Minimum recharge is ${formatCurrency(config.minAmount, locale)}`;
    else if (amount > config.maxAmount) amountError = `Maximum recharge is ${formatCurrency(config.maxAmount, locale)}`;
  }
  const valid = amount > 0 && !amountError;

  const quote = quoteRecharge({
    amount,
    packId: pack?.id,
    packs: visiblePacks || [],
    couponBonus: coupon.status === "applied" ? coupon.bonus : 0,
    gstRate: config.gstRate,
  });

  /** The pack's offer ended (OFFER_ENDED): say so, start a fresh attempt and reload the packs. */
  const offerEnded = () => {
    idemKey.current = null;
    couponReq.current++;
    setCoupon({ status: "idle" });
    setChoice({ packId: null, custom: "" });
    toast({ type: "info", title: "This offer has ended", message: "We've refreshed the packs. Please pick another one." });
    loadPacks().catch(() => {});
  };

  /** Coupons are applied through the quote step (POST /user/wallet/quote with couponCode). */
  const applyCoupon = (code, forAmount, forPackId = pack?.id) => {
    if (!code) return;
    const req = ++couponReq.current;
    setCoupon({ status: "checking", code });
    walletService
      .quote({ packId: forPackId, amount: forAmount, couponCode: code })
      .then((q) => req === couponReq.current && setCoupon({ status: "applied", code: q.coupon?.code || code, bonus: q.couponBonus }))
      .catch((e) => {
        if (req !== couponReq.current) return;
        if (e?.code === OFFER_ENDED_CODE) offerEnded();
        else
          setCoupon({
            status: "invalid",
            code,
            error: t(COUPON_ERRORS[e?.code] || "wallet.couponInvalid", { amount: formatCurrency(e?.data?.minAmount ?? 0, locale) }),
          });
      });
  };

  /** Any change to what's being bought starts a new attempt (new idempotency key) and re-checks the coupon. */
  const onOrderChange = (nextAmount, nextPackId) => {
    idemKey.current = null;
    if (coupon.status !== "idle") {
      if (nextAmount > 0) applyCoupon(coupon.code, nextAmount, nextPackId);
      else {
        couponReq.current++;
        setCoupon({ status: "idle" });
      }
    }
  };

  const selectPack = (p) => {
    setChoice({ packId: p.id, custom: "" });
    onOrderChange(p.amount, p.id);
  };

  const changeCustom = (value) => {
    const v = value.replace(/[^\d]/g, "").slice(0, 6);
    setChoice((c) => ({ ...c, custom: v }));
    onOrderChange(Number(v));
  };

  const removeCoupon = () => {
    idemKey.current = null;
    couponReq.current++;
    setCoupon({ status: "idle" });
    setCouponInput("");
  };

  const pay = async () => {
    if (busy.current || !valid) return;
    busy.current = true;
    setPaying(true);
    idemKey.current ??= crypto.randomUUID();
    try {
      const order = await walletService.createOrder({
        packId: pack?.id,
        amount,
        couponCode: coupon.status === "applied" ? coupon.code : undefined,
        idempotencyKey: idemKey.current,
      });
      setInflight({ orderId: order.orderId, total: order.total });
      const { outcome, payment } = await openCheckout(order);

      if (outcome === "success" && payment) {
        // The backend checks Razorpay's signature and credits the wallet. If this call fails
        // the Razorpay webhook still credits it — the status page polls either way.
        await walletService
          .verifyPayment({ orderId: order.orderId, razorpayPaymentId: payment.razorpay_payment_id, signature: payment.razorpay_signature })
          .catch(() => {});
      }

      if (outcome === "closed") {
        // The user may still have paid (e.g. UPI app) — confirm with the backend before giving up.
        const status = await walletService.getOrderStatus(order.orderId).catch(() => null);
        if (status && status.status !== "created") {
          router.push(`${routes.paymentStatus(order.orderId)}`);
          return;
        }
        setInflight(null);
        toast({ type: "info", title: "Payment cancelled", message: "No money was deducted. You can try again anytime." });
        busy.current = false;
        setPaying(false);
        return;
      }
      idemKey.current = null;
      router.push(`${routes.paymentStatus(order.orderId)}`);
    } catch (e) {
      if (e?.code === OFFER_ENDED_CODE) {
        busy.current = false;
        setPaying(false);
        offerEnded();
        return;
      }
      toast({ type: "error", title: "Couldn't start the payment", message: e?.message || "Please check your connection and try again." });
      busy.current = false;
      setPaying(false);
    }
  };

  const packSelected = (p) => selected === p.id && !custom;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-6">
        <section aria-labelledby="packs-heading">
          <h2 id="packs-heading" className="mb-1 text-lg font-semibold">
            Recharge packs
          </h2>
          <p className="mb-4 text-sm text-muted">Bigger packs come with extra bonus credit.</p>
          {hasFirstOffer && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm dark:border-brand-700 dark:bg-brand-800/30" data-first-offer-banner>
              <Gift className="size-5 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden />
              <p>
                <strong className="font-semibold text-brand-700 dark:text-brand-200">Your first recharge offer</strong>
                <span className="text-muted"> — extra bonus on your first recharge</span>
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visiblePacks
              ? visiblePacks.map((p) => {
                  const bonus = p.credit - p.amount;
                  // Offer ribbon first; otherwise the pack's tag (popular / best value).
                  const ribbon =
                    p.offer === "first"
                      ? { tone: "brand", text: "First recharge offer" }
                      : p.offer === "festival"
                        ? { tone: "warning", text: p.label || "Festival offer" }
                        : p.tag
                          ? { tone: p.tag === "popular" ? "brand" : "gold", text: t(`wallet.tag.${p.tag}`) }
                          : null;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPack(p)}
                      aria-pressed={packSelected(p)}
                      className={cn(
                        "relative rounded-2xl border-2 p-4 pt-5 text-left transition focus-visible:outline-offset-4",
                        packSelected(p)
                          ? "border-gold-500 bg-gold-100/70 shadow-md shadow-gold-500/10 dark:bg-gold-700/20"
                          : p.offer
                            ? "border-brand-300 bg-brand-50/60 hover:border-brand-400 dark:border-brand-700 dark:bg-brand-800/20 dark:hover:border-brand-500"
                            : "border-line bg-surface hover:border-brand-300 dark:hover:border-brand-500",
                      )}
                    >
                      {ribbon && (
                        <Badge
                          tone={ribbon.tone}
                          className="absolute -top-2.5 left-3 max-w-[calc(100%-1.5rem)] truncate shadow-sm"
                          data-pack-offer={p.offer || undefined}
                        >
                          {ribbon.text}
                        </Badge>
                      )}
                      {packSelected(p) && (
                        <CheckCircle2 className="absolute right-3 top-3 size-4 text-gold-600 dark:text-gold-400" aria-hidden />
                      )}
                      <p className="text-xs text-muted">Pay</p>
                      <p className="font-display text-2xl font-bold">{formatCurrency(p.amount, locale)}</p>
                      {/* What the wallet gets for every pack (credit and bonus come from /wallet/packs, set in the dashboard) */}
                      {bonus > 0 ? (
                        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-semibold text-green-700 dark:text-green-400" data-pack-reward>
                          {`Get ${formatCurrency(p.credit, locale)}`}
                          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-semibold dark:bg-green-900/40">
                            {`+${formatCurrency(bonus, locale)} bonus`}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted">{`Get ${formatCurrency(p.credit, locale)}`}</p>
                      )}
                      {config.gstRate > 0 && <p className="mt-1 text-xs text-muted">{`+ ${gstPercent(config.gstRate)} GST`}</p>}
                      {p.offer === "festival" && p.endsAt && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <Clock className="size-3.5" aria-hidden />
                          {endsLabel(p.endsAt, now, locale)}
                        </p>
                      )}
                    </button>
                  );
                })
              : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </section>

        <Card className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          <Field
            label="Custom amount"
            htmlFor="custom-amount"
            error={amountError}
            hint={`Between ${formatCurrency(config.minAmount, locale)} and ${formatCurrency(config.maxAmount, locale)}`}
          >
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted" aria-hidden>
                ₹
              </span>
              <Input
                id="custom-amount"
                inputMode="numeric"
                autoComplete="off"
                className="pl-7"
                value={custom}
                onChange={(e) => changeCustom(e.target.value)}
                placeholder="Enter amount"
                aria-invalid={Boolean(amountError)}
              />
            </div>
          </Field>

          <Field
            label="Coupon code"
            htmlFor="coupon"
            error={coupon.status === "invalid" ? coupon.error : null}
            hint={coupon.status === "applied" ? null : "Have a coupon code? Enter it here."}
          >
            {coupon.status === "applied" ? (
              <div className="flex h-11 items-center gap-2 rounded-xl border border-green-500/40 bg-green-50 px-3 dark:bg-green-900/20">
                <Tag className="size-4 text-green-600 dark:text-green-400" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm">
                  <strong className="tabular-nums">{coupon.code}</strong>{" "}
                  <span className="text-green-700 dark:text-green-400">
                    {`applied · +${formatCurrency(coupon.bonus, locale)} extra`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="rounded-full p-1 text-muted hover:bg-surface-muted"
                  aria-label="Remove coupon"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (valid) applyCoupon(couponInput.trim(), amount);
                }}
              >
                <Input
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase().replace(/\s/g, ""));
                    if (coupon.status === "invalid") setCoupon({ status: "idle" });
                  }}
                  placeholder="Enter code"
                  autoComplete="off"
                  className="tabular-nums uppercase"
                  aria-invalid={coupon.status === "invalid"}
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="h-11 shrink-0"
                  loading={coupon.status === "checking"}
                  disabled={!couponInput.trim() || !valid}
                >
                  Apply
                </Button>
              </form>
            )}
          </Field>
        </Card>

        <PaymentMethodsNote />
      </div>

      <Card className="space-y-4 p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <dl className="space-y-2.5 text-sm">
          <Row label="Recharge amount" value={formatCurrency(valid ? quote.amount : 0, locale)} />
          {/* GST (rate from the dashboard) is added on top on its own row, never folded silently into the total */}
          {valid && quote.gst > 0 && <Row label={`GST (${gstPercent(config.gstRate)})`} value={`+${formatCurrency(quote.gst, locale)}`} />}
          <div className="border-t border-dashed border-line pt-2.5">
            <Row label="Total to pay" value={formatCurrency(valid ? quote.total : 0, locale)} strong />
          </div>
        </dl>
        <div className="space-y-1.5 rounded-xl bg-green-50 px-3 py-2.5 text-sm dark:bg-green-900/20">
          <div className="flex items-center justify-between gap-4">
            <span className="text-green-800 dark:text-green-300">
              {valid && quote.bonus > 0 ? "You get in wallet (incl. bonus)" : "You get in wallet"}
            </span>
            <span className="font-bold tabular-nums text-green-700 dark:text-green-400">{formatCurrency(valid ? quote.credit : 0, locale)}</span>
          </div>
          {valid && quote.bonus > 0 && (
            <ul className="space-y-0.5 text-xs text-green-800/80 dark:text-green-300/80">
              <li className="flex justify-between gap-4">
                <span>Recharge</span>
                <span className="tabular-nums">{formatCurrency(quote.amount, locale)}</span>
              </li>
              {quote.packBonus > 0 && (
                <li className="flex justify-between gap-4">
                  <span>
                    {pack?.offer === "first"
                      ? "First recharge bonus"
                      : pack?.offer === "festival"
                        ? `${pack.label || "Offer"} bonus`
                        : "Pack bonus"}
                  </span>
                  <span className="tabular-nums">{`+${formatCurrency(quote.packBonus, locale)}`}</span>
                </li>
              )}
              {quote.couponBonus > 0 && (
                <li className="flex justify-between gap-4">
                  <span>{`Coupon bonus (${coupon.code})`}</span>
                  <span className="tabular-nums">{`+${formatCurrency(quote.couponBonus, locale)}`}</span>
                </li>
              )}
            </ul>
          )}
        </div>

        <Button
          size="lg"
          variant="gold"
          className="w-full"
          disabled={!valid || coupon.status === "checking"}
          loading={paying}
          onClick={() => requireAuth(pay, "recharge")}
        >
          <Lock className="size-4" aria-hidden />
          {valid ? `Pay ${formatCurrency(quote.total, locale)}` : "Add money"}
        </Button>
      </Card>
    </div>
  );
}

function Row({ label, value, positive, strong }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={cn(strong ? "font-semibold text-fg" : "text-muted")}>{label}</dt>
      <dd className={cn("tabular-nums", strong && "text-base font-bold", positive && "font-medium text-green-700 dark:text-green-400")}>
        {value}
      </dd>
    </div>
  );
}

function PaymentMethodsNote() {
  const methods = [
    [Smartphone, "UPI"],
    [CreditCard, "Cards"],
    [Landmark, "Net banking"],
  ];
  return (
    <div className="rounded-2xl border border-line bg-surface-muted/60 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="size-4 text-green-600 dark:text-green-400" aria-hidden /> 100% secure payments via Razorpay
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {methods.map(([Icon, label]) => (
          <li key={label} className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium">
            <Icon className="size-3.5 text-brand-500 dark:text-brand-300" aria-hidden /> {label}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Pay with any UPI app (GPay, PhonePe, Paytm), debit/credit cards or net banking. Your wallet is credited as soon as Razorpay confirms the payment.</p>
    </div>
  );
}
