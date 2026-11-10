"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Lock, MapPin, QrCode, ShieldCheck } from "lucide-react";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Spinner } from "@/components/ui/Skeleton";
import { checkout, useCheckout, useHydrated } from "../cart";
import { CheckoutSteps, money, OrderSummary, WithCart } from "./CheckoutParts";

const UPI_APPS = ["Google Pay", "PhonePe", "Paytm", "BHIM"];

const digits = (v) => v.replace(/\D/g, "");
const cardBrand = (n) => (/^4/.test(n) ? "Visa" : /^(5[1-5]|2[2-7])/.test(n) ? "Mastercard" : /^(60|65|81|82|508)/.test(n) ? "RuPay" : null);
const luhnSum = (n) =>
  [...n].reverse().reduce((sum, d, i) => {
    const x = Number(d) * (i % 2 ? 2 : 1);
    return sum + (x > 9 ? x - 9 : x);
  }, 0);
const luhn = (n) => luhnSum(n) % 10 === 0;
const expired = (mmyy) => {
  const [mm, yy] = mmyy.split("/").map(Number);
  return new Date(2000 + yy, mm) <= new Date(); // valid through the end of that month
};

function validate(method, upi, card) {
  const err = {};
  if (method === "upi") {
    if (!upi.app && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.id)) err.upi = "Pick a UPI app or enter a valid UPI ID (e.g. name@okaxis)";
  } else {
    const n = digits(card.number);
    if (n.length < 15 || !luhn(n)) err.number = "Enter a valid card number";
    if (card.name.trim().length < 2) err.name = "Enter the name on the card";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) err.expiry = "Use MM/YY";
    else if (expired(card.expiry)) err.expiry = "This card has expired";
    if (!/^\d{3,4}$/.test(card.cvv)) err.cvv = "3 or 4 digits";
  }
  return err;
}

/**
 * /store/payment — step 3: pay by UPI or card, then the order is placed.
 * DEMO: no money moves until the backend takes store orders through Razorpay (see wallet/lib/razorpay.js).
 */
export function CheckoutPayment() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { address } = useCheckout();
  const [paying, setPaying] = useState(null); // the order being paid

  useEffect(() => {
    if (hydrated && !address) router.replace(routes.storeCheckout);
  }, [hydrated, address, router]);

  useEffect(() => {
    if (!paying) return;
    const t = setTimeout(() => {
      checkout.placeOrder(paying);
      router.replace(routes.storeOrderSuccess);
    }, 1800);
    return () => clearTimeout(t);
  }, [paying, router]);

  // While paying the whole step is replaced, so emptying the cart never flashes "cart is empty".
  if (paying) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-24 text-center motion-safe:animate-[banner-in_0.3s_ease-out]" role="status" aria-live="polite">
        <Spinner className="size-12" />
        <p className="font-display text-2xl">{`Paying ${money(paying.total)}…`}</p>
        <p className="text-sm text-muted">{"Confirming with your bank. Please don't close this page."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <CheckoutSteps current={2} />
      {address ? (
        <WithCart>
          {(cart) => (
            <PaymentForm
              cart={cart}
              address={address}
              onPay={(method) =>
                setPaying({
                  method,
                  address,
                  items: cart.items.map(({ product: p, qty }) => ({ slug: p.slug, name: p.name, price: p.price, qty })),
                  subtotal: cart.subtotal,
                  shipping: cart.shipping,
                  total: cart.total,
                })
              }
            />
          )}
        </WithCart>
      ) : (
        <Spinner className="mx-auto my-24 size-10" />
      )}
    </div>
  );
}

function PaymentForm({ cart, address, onPay }) {
  const [method, setMethod] = useState("upi");
  const [upi, setUpi] = useState({ app: "", id: "" });
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});
  const brand = cardBrand(digits(card.number));

  const pay = (e) => {
    e.preventDefault();
    const err = validate(method, upi, card);
    setErrors(err);
    if (Object.keys(err).length) return;
    onPay(method === "upi" ? `UPI · ${upi.app || upi.id}` : `${brand || "Card"} ···· ${digits(card.number).slice(-4)}`);
  };

  const setCardField = (k, v) => setCard((c) => ({ ...c, [k]: v }));

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 motion-safe:animate-[banner-in_0.4s_ease-out] lg:grid-cols-[1fr_380px]">
      <form id="payment-form" onSubmit={pay} noValidate className="space-y-5">
        <div className="flex items-start gap-3 rounded-3xl border border-line bg-surface p-5">
          <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-gold-400" aria-hidden />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{`Delivering to ${address.name} · ${address.phone}`}</p>
            <p className="text-muted">{`${address.line}, ${address.city}, ${address.state} – ${address.pincode}`}</p>
          </div>
          <LocaleLink href={routes.storeCheckout} className="shrink-0 text-sm font-semibold text-accent hover:underline">
            Change
          </LocaleLink>
        </div>

        <section className="rounded-3xl border border-line bg-surface p-6">
          <LocaleLink href={routes.storeCheckout} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden /> Back to address
          </LocaleLink>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl">Payment method</h1>

          <div role="tablist" aria-label="Payment method" className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-surface-muted p-1.5">
            {[
              ["upi", QrCode, "UPI"],
              ["card", CreditCard, "Debit / Credit card"],
            ].map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={method === id}
                onClick={() => {
                  setMethod(id);
                  setErrors({});
                }}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition",
                  method === id ? "bg-surface text-brand-700 shadow-sm dark:text-gold-300" : "text-muted hover:text-fg"
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>

          <div key={method} className="mt-5 motion-safe:animate-[banner-in_0.3s_ease-out]">
            {method === "upi" ? (
              <div className="space-y-4">
                <p className="text-sm font-medium">Pay with a UPI app</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app}
                      type="button"
                      aria-pressed={upi.app === app}
                      onClick={() => setUpi({ app, id: "" })}
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                        upi.app === app ? "border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-100 dark:bg-brand-950 dark:text-brand-100 dark:ring-brand-900" : "border-line hover:border-brand-200"
                      )}
                    >
                      {app}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-line" /> or enter UPI ID <span className="h-px flex-1 bg-line" />
                </div>
                <Field htmlFor="upi-id" error={errors.upi}>
                  <Input id="upi-id" value={upi.id} onChange={(e) => setUpi({ app: "", id: e.target.value.trim() })} placeholder="yourname@okaxis" autoComplete="off" aria-invalid={Boolean(errors.upi)} />
                </Field>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-[1.6] max-w-xs overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900 p-5 text-white shadow-lg" aria-hidden>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/80">
                    <span>Debit / Credit</span>
                    <span>{brand}</span>
                  </div>
                  <p className="mt-8 font-mono text-lg tracking-widest tabular-nums">{card.number || "•••• •••• •••• ••••"}</p>
                  <div className="mt-4 flex justify-between text-xs uppercase">
                    <span className="truncate">{card.name || "Name on card"}</span>
                    <span className="tabular-nums">{card.expiry || "MM/YY"}</span>
                  </div>
                </div>
                <Field label="Card number" htmlFor="cc-number" error={errors.number}>
                  <Input
                    id="cc-number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) => setCardField("number", digits(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))}
                    aria-invalid={Boolean(errors.number)}
                  />
                </Field>
                <Field label="Name on card" htmlFor="cc-name" error={errors.name}>
                  <Input id="cc-name" autoComplete="cc-name" placeholder="As printed on the card" value={card.name} onChange={(e) => setCardField("name", e.target.value)} aria-invalid={Boolean(errors.name)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" htmlFor="cc-exp" error={errors.expiry}>
                    <Input
                      id="cc-exp"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCardField("expiry", digits(e.target.value).slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2"))}
                      aria-invalid={Boolean(errors.expiry)}
                    />
                  </Field>
                  <Field label="CVV" htmlFor="cc-cvv" error={errors.cvv}>
                    <Input
                      id="cc-cvv"
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="•••"
                      value={card.cvv}
                      onChange={(e) => setCardField("cvv", digits(e.target.value).slice(0, 4))}
                      aria-invalid={Boolean(errors.cvv)}
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-4 text-green-600" aria-hidden /> Payments are encrypted and processed securely.
          </p>
          <Button type="submit" variant="gold" size="lg" className="mt-5 w-full lg:hidden">
            <Lock className="size-4" aria-hidden /> {`Pay ${money(cart.total)}`}
          </Button>
        </section>
      </form>

      <OrderSummary cart={cart}>
        <Button type="submit" form="payment-form" variant="gold" size="lg" className="mt-5 hidden w-full lg:inline-flex">
          <Lock className="size-4" aria-hidden /> {`Pay ${money(cart.total)}`}
        </Button>
        <p className="mt-3 text-center text-xs text-muted">Demo checkout — no money is charged.</p>
      </OrderSummary>
    </div>
  );
}
