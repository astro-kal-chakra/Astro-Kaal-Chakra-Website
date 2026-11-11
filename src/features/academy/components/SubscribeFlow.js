"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Crown, Landmark, Lock, QrCode, ShieldCheck, X } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Skeleton";
import { FEATURES, PLANS } from "../data";
import { academy, useAcademy } from "../progress";
import { Stepper } from "./Stepper";

const METHODS = [
  { id: "upi", icon: QrCode, label: "UPI", hint: "Google Pay, PhonePe, Paytm & more" },
  { id: "card", icon: CreditCard, label: "Debit / Credit card", hint: "Visa, Mastercard, RuPay" },
  { id: "netbanking", icon: Landmark, label: "Netbanking", hint: "All major banks" },
];

const money = (n) => formatCurrency(n, SITE_LOCALE);

/**
 * Steps 2–3 of training: pick a monthly plan, then pay.
 * DEMO: payment is simulated until the backend sells subscriptions through Razorpay (see wallet/lib/razorpay.js).
 */
export function SubscribeFlow({ course }) {
  const router = useRouter();
  const state = useAcademy();
  const [plan, setPlan] = useState(null);
  const [method, setMethod] = useState("upi");
  const [paying, setPaying] = useState(false);
  const enrolled = state?.enrolled[course.slug];
  const current = state?.subs[course.slug]?.plan;

  useEffect(() => {
    if (state && !enrolled) router.replace(routes.academyEnroll(course.slug));
  }, [state, enrolled, router, course.slug]);

  useEffect(() => {
    if (!paying) return;
    const t = setTimeout(() => {
      academy.activate(course.slug, { plan: plan.id, amount: plan.price, method, orderId: `AKC${Date.now().toString(36).toUpperCase()}` });
      router.replace(routes.academySuccess(course.slug));
    }, 1800);
    return () => clearTimeout(t);
  }, [paying, plan, method, course.slug, router]);

  if (!enrolled) return <Spinner className="mx-auto my-24 size-10" />;

  const choose = (p) => {
    setPlan(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Stepper current={plan ? 2 : 1} />

      {!plan ? (
        <div key="plans" className="motion-safe:animate-[banner-in_0.4s_ease-out]">
          <div className="mt-8 text-center">
            <p className="eyebrow justify-center">{course.title}</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl">{`Choose your plan, ${enrolled.name.split(" ")[0]}`}</h1>
            <p className="mt-2 text-muted">Monthly subscription · cancel anytime</p>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <li
                key={p.id}
                className={cn(
                  "relative flex flex-col rounded-3xl border bg-surface p-6 transition duration-300 motion-safe:animate-[rise_0.55s_cubic-bezier(0.22,1,0.36,1)_backwards] motion-safe:hover:-translate-y-1",
                  p.popular ? "border-brand-400 shadow-[0_24px_60px_-30px_rgb(194_65_12/0.6)]" : "border-line hover:shadow-[0_20px_44px_-28px_rgb(194_65_12/0.4)]"
                )}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    <Crown className="size-3.5" aria-hidden /> Most popular
                  </span>
                )}
                <h2 className="font-display text-2xl">{p.name}</h2>
                <p className="mt-1 text-sm text-muted">{p.blurb}</p>
                <p className="mt-5">
                  <span className="font-display text-4xl tabular-nums">{money(p.price)}</span>
                  <span className="text-sm text-muted"> / month</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {Object.entries(FEATURES).map(([id, label]) => {
                    const on = p.features.includes(id);
                    return (
                      <li key={id} className={cn("flex gap-2", !on && "text-muted line-through decoration-line")}>
                        {on ? <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden /> : <X className="mt-0.5 size-4 shrink-0" aria-hidden />}
                        {id === "session" && on ? `${p.sessions} ${label} / month` : label}
                        <span className="sr-only">{on ? "(included)" : "(not included)"}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button variant={p.popular ? "gold" : "outline"} size="lg" className="mt-6 w-full" disabled={current === p.id} onClick={() => choose(p)}>
                  {current === p.id ? "Your current plan" : `Choose ${p.name}`}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div key="pay" className="mt-8 grid grid-cols-1 gap-6 motion-safe:animate-[banner-in_0.4s_ease-out] lg:grid-cols-[1fr_380px]">
          <section className="rounded-3xl border border-line bg-surface p-6">
            <button type="button" onClick={() => setPlan(null)} disabled={paying} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
              <ArrowLeft className="size-4" aria-hidden /> Change plan
            </button>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl">Payment method</h1>
            <div role="radiogroup" aria-label="Payment method" className="mt-5 space-y-3">
              {METHODS.map(({ id, icon: Icon, label, hint }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={method === id}
                  onClick={() => setMethod(id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition",
                    method === id ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100 dark:bg-brand-950 dark:ring-brand-900" : "border-line hover:border-brand-200"
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-surface-muted text-brand-600 dark:text-gold-400">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{label}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                  <span className={cn("flex size-5 items-center justify-center rounded-full border-2 transition", method === id ? "border-brand-600" : "border-line")} aria-hidden>
                    {method === id && <span className="size-2.5 rounded-full bg-brand-600" />}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="size-4 text-green-600" aria-hidden /> Payments are encrypted and processed securely.
            </p>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-[0_20px_50px_-30px_rgb(194_65_12/0.5)]">
              <p className="text-sm text-muted">Order summary</p>
              <p className="mt-1 font-semibold">{course.title}</p>
              <p className="text-sm text-muted">{`${plan.name} plan · monthly`}</p>
              <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                {plan.features.map((id) => (
                  <li key={id} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden /> {FEATURES[id]}
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tabular-nums">{money(plan.price)}</dd>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <dt>Total (incl. GST)</dt>
                  <dd className="tabular-nums">{money(plan.price)}</dd>
                </div>
              </dl>
              <Button variant="gold" size="lg" className="mt-5 w-full" loading={paying} onClick={() => setPaying(true)}>
                {paying ? "Processing payment…" : (
                  <>
                    <Lock className="size-4" aria-hidden /> {`Pay ${money(plan.price)}`}
                  </>
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-muted">Demo checkout — no money is charged.</p>
            </div>
          </aside>
        </div>
      )}

      {paying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm motion-safe:animate-[banner-in_0.25s_ease-out]" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-surface px-10 py-8 shadow-2xl">
            <Spinner className="size-10" />
            <p className="font-semibold">Confirming your payment…</p>
            <p className="text-xs text-muted">{"Please don't close this page."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
