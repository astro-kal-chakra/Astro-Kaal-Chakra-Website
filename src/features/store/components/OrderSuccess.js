"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, Truck } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Skeleton";
import { useCheckout, useHydrated } from "../cart";
import { money } from "./CheckoutParts";

const DELIVERY_DAYS = 5;

/** /store/order-success — confirmation of the last paid order (order ID, items, address, delivery date). */
export function OrderSuccess() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { order } = useCheckout();

  useEffect(() => {
    if (hydrated && !order) router.replace(routes.store);
  }, [hydrated, order, router]);

  if (!order) return <Spinner className="mx-auto my-24 size-10" />;

  const eta = new Date(order.at + DELIVERY_DAYS * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const { address } = order;

  return (
    <Card className="mx-auto max-w-lg p-6 motion-safe:animate-[banner-in_0.4s_ease-out] sm:p-10">
      <div className="text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="size-10" aria-hidden />
        </div>
        <h1 className="mt-4 font-display text-3xl">Order placed!</h1>
        <p className="mt-2 text-muted">{`${money(order.total)} paid via ${order.method}.`}</p>
        <p className="mt-1 text-xs text-muted">
          Order ID: <span className="tabular-nums">{order.id}</span>
        </p>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line text-sm">
        {order.items.map((i) => (
          <li key={i.slug} className="flex justify-between gap-3 px-4 py-2.5">
            <span className="min-w-0 truncate">{`${i.name} × ${i.qty}`}</span>
            <span className="shrink-0 tabular-nums">{money(i.price * i.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between px-4 py-2.5 text-muted">
          <span>Delivery</span>
          <span>{order.shipping ? money(order.shipping) : "Free"}</span>
        </li>
        <li className="flex justify-between px-4 py-2.5 font-bold">
          <span>Total paid</span>
          <span className="tabular-nums">{money(order.total)}</span>
        </li>
      </ul>

      <div className="mt-4 space-y-3 rounded-2xl bg-surface-muted p-4 text-sm">
        <p className="flex gap-2">
          <Truck className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-gold-400" aria-hidden />
          <span>
            Expected delivery by <strong>{eta}</strong>
          </span>
        </p>
        <p className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-gold-400" aria-hidden />
          <span className="text-muted">{`${address.name}, ${address.line}, ${address.city}, ${address.state} – ${address.pincode}`}</span>
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <ButtonLink href={routes.store} variant="gold" size="lg" className="flex-1">
          Continue shopping
        </ButtonLink>
        <ButtonLink href={routes.home} variant="outline" size="lg" className="flex-1">
          Go to home
        </ButtonLink>
      </div>
    </Card>
  );
}
