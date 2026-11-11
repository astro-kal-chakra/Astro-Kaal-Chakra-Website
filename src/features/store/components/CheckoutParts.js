"use client";

import { Check, ShoppingBag } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { ButtonLink } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Skeleton";
import { useCart, useHydrated } from "../cart";
import { ProductArt } from "./ProductArt";

export const money = (n) => formatCurrency(n, SITE_LOCALE);

const STEPS = ["Cart", "Address", "Payment"];

/** Checkout progress: cart → address → payment. `current` is the 0-based active step. */
export function CheckoutSteps({ current }) {
  return (
    <ol className="flex items-center justify-center gap-2 text-xs font-semibold sm:text-sm">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          {i > 0 && <span className={cn("h-px w-6 sm:w-12", i <= current ? "bg-brand-500" : "bg-line")} aria-hidden />}
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full border",
              i < current && "border-brand-600 bg-brand-600 text-white",
              i === current && "border-brand-600 text-brand-700 ring-4 ring-brand-100 dark:text-brand-200 dark:ring-brand-900",
              i > current && "border-line text-muted"
            )}
            aria-current={i === current ? "step" : undefined}
          >
            {i < current ? <Check className="size-4" aria-hidden /> : i + 1}
          </span>
          <span className={cn("hidden sm:inline", i === current ? "text-fg" : "text-muted")}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

/** Renders children with the cart once hydrated; an empty cart gets a way back to the store. */
export function WithCart({ children }) {
  const hydrated = useHydrated();
  const cart = useCart();
  if (!hydrated) return <Spinner className="mx-auto my-24 size-10" />;
  if (!cart.items.length) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950">
          <ShoppingBag className="size-8" aria-hidden />
        </span>
        <p className="font-semibold">Your cart is empty</p>
        <ButtonLink href={routes.store}>Browse the store</ButtonLink>
      </div>
    );
  }
  return children(cart);
}

/** Items and price breakdown beside the address and payment steps. */
export function OrderSummary({ cart, children }) {
  const { items, count, subtotal, mrpTotal, shipping, total } = cart;
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-[0_20px_50px_-30px_rgb(194_65_12/0.5)]">
        <p className="font-semibold">{`Order summary (${count} ${count === 1 ? "item" : "items"})`}</p>
        <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto">
          {items.map(({ product: p, qty }) => (
            <li key={p.slug} className="flex items-center gap-3">
              <ProductArt product={p} className="size-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">{`Qty ${qty}`}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{money(p.price * qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="You save" value={money(mrpTotal - subtotal)} className="font-semibold text-green-700 dark:text-green-400" />
          <Row label="Delivery" value={shipping ? money(shipping) : "Free"} />
          <div className="flex justify-between border-t border-dashed border-line pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{money(total)}</dd>
          </div>
        </dl>
        {children}
      </div>
    </aside>
  );
}

function Row({ label, value, className }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("tabular-nums", className)}>{value}</dd>
    </div>
  );
}
