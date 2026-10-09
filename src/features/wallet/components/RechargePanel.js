"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Landmark, Lock, ShieldCheck, Smartphone, Tag, X } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { WALLET_CONFIG, quoteRecharge, walletService } from "@/lib/api/services/wallet.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
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

/** "Get ₹120 +20%" line on the recharge pack cards — hidden for now; set to true to show it again. */
const SHOW_PACK_BONUS = false;

const COUPON_ERRORS ={ INVALID_COUPON: "wallet.couponInvalid", COUPON_MIN_AMOUNT: "wallet.couponMinAmount" };

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

  useEffect(() => {
    Promise.all([walletService.getPacks(), walletService.getConfig()]).then(([p, cfg]) => {
      setPacks(p);
      setConfig(cfg);
      setChoice((cur) => {
        const match = cur.custom && p.find((x) => x.amount === Number(cur.custom));
        if (match) return { packId: match.id, custom: "" };
        if (cur.custom) return cur;
        return { packId: p.find((x) => x.tag === "popular")?.id ?? p[0]?.id, custom: "" };
      });
    });
  }, []);

  const pack = !custom && packs?.find((p) => p.id === selected);
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
    packs: packs || [],
    couponBonus: coupon.status === "applied" ? coupon.bonus : 0,
    gstRate: config.gstRate,
  });

  /** Coupons are applied through the quote step (POST /user/wallet/quote with couponCode). */
  const applyCoupon = (code, forAmount, forPackId = pack?.id) => {
    if (!code) return;
    const req = ++couponReq.current;
    setCoupon({ status: "checking", code });
    walletService
      .quote({ packId: forPackId, amount: forAmount, couponCode: code })
      .then((q) => req === couponReq.current && setCoupon({ status: "applied", code: q.coupon?.code || code, bonus: q.couponBonus }))
      .catch(
        (e) =>
          req === couponReq.current &&
          setCoupon({
            status: "invalid",
            code,
            error: t(COUPON_ERRORS[e?.code] || "wallet.couponInvalid", { amount: formatCurrency(e?.data?.minAmount ?? 0, locale) }),
          }),
      );
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {packs
              ? packs.map((p) => {
                  const bonus = p.credit - p.amount;
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
                          : "border-line bg-surface hover:border-brand-300 dark:hover:border-brand-500",
                      )}
                    >
                      {p.tag && (
                        <Badge tone={p.tag === "popular" ? "brand" : "gold"} className="absolute -top-2.5 left-3 shadow-sm">
                          {t(`wallet.tag.${p.tag}`)}
                        </Badge>
                      )}
                      {packSelected(p) && (
                        <CheckCircle2 className="absolute right-3 top-3 size-4 text-gold-600 dark:text-gold-400" aria-hidden />
                      )}
                      <p className="text-xs text-muted">Pay</p>
                      <p className="font-display text-2xl font-bold">{formatCurrency(p.amount, locale)}</p>
                      {SHOW_PACK_BONUS &&
                        (bonus > 0 ? (
                          <p className="mt-1 text-sm font-semibold text-green-700 dark:text-green-400">
                            {`Get ${formatCurrency(p.credit, locale)}`}
                            <span className="ml-1 text-xs font-medium opacity-80">
                              {`+${Math.round((bonus / p.amount) * 100)}%`}
                            </span>
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-muted">{`Get ${formatCurrency(p.credit, locale)}`}</p>
                        ))}
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
            hint={coupon.status === "applied" ? null : "Have a code? Try WELCOME50"}
          >
            {coupon.status === "applied" ? (
              <div className="flex h-11 items-center gap-2 rounded-xl border border-green-500/40 bg-green-50 px-3 dark:bg-green-900/20">
                <Tag className="size-4 text-green-600 dark:text-green-400" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm">
                  <strong className="font-mono">{coupon.code}</strong>{" "}
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
                  placeholder="WELCOME50"
                  autoComplete="off"
                  className="font-mono uppercase"
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
          {valid && quote.packBonus > 0 && (
            <Row label="Pack bonus" value={`+${formatCurrency(quote.packBonus, locale)}`} positive />
          )}
          {valid && quote.couponBonus > 0 && (
            <Row
              label={`Coupon bonus (${coupon.code})`}
              value={`+${formatCurrency(quote.couponBonus, locale)}`}
              positive
            />
          )}
          {/* GST only when the dashboard turns it on: never folded silently into the total */}
          {valid && quote.gst > 0 && <Row label={`GST (${Math.round((config.gstRate || 0) * 100)}%)`} value={`+${formatCurrency(quote.gst, locale)}`} />}
          <div className="border-t border-dashed border-line pt-2.5">
            <Row label="Total payable" value={formatCurrency(valid ? quote.total : 0, locale)} strong />
          </div>
        </dl>
        <div className="flex items-center justify-between rounded-xl bg-green-50 px-3 py-2.5 text-sm dark:bg-green-900/20">
          <span className="text-green-800 dark:text-green-300">{"You'll get in wallet"}</span>
          <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(valid ? quote.credit : 0, locale)}</span>
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
