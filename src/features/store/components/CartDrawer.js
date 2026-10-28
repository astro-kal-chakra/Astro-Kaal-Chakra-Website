"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { ButtonLink } from "@/components/ui/Button";
import { CART_OPEN_EVENT, cart, openCart, useCart } from "../cart";
import { ProductArt } from "./ProductArt";

const FREE_SHIPPING_FROM = 499;

/** Floating cart button (only when the cart has items) + slide-in cart drawer. Mounted once in the site layout. */
export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, count, subtotal, mrpTotal } = useCart();
  const { toast } = useToast();
  const money = (n) => formatCurrency(n, SITE_LOCALE);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : 49;

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener(CART_OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(CART_OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const checkout = () =>
    toast({
      type: "info",
      title: "Checkout is coming soon",
      message: "Online payment for the store is being set up. Your cart is saved on this device.",
      duration: 5000,
    });

  return (
    <>
      {count > 0 && !open && (
        <button
          type="button"
          onClick={openCart}
          aria-label={`Open cart, ${count} items`}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-40 flex items-center gap-2 rounded-full bg-brand-600 py-3 pl-3.5 pr-4 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-700 motion-safe:animate-[banner-in_0.35s_ease-out] sm:bottom-6 sm:left-6"
        >
          <ShoppingBag className="size-5" aria-hidden />
          <span>{count}</span>
          <span className="hidden sm:inline">· {money(subtotal)}</span>
        </button>
      )}

      <div className={cn("fixed inset-0 z-[110] transition", open ? "visible" : "invisible")} aria-hidden={!open}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close cart"
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          role="dialog"
          aria-label="Your cart"
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-xl">Your cart {count > 0 && <span className="text-base text-muted">({count})</span>}</h2>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-fg" aria-label="Close cart">
              <X className="size-5" />
            </button>
          </header>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950">
                <ShoppingBag className="size-8" aria-hidden />
              </span>
              <p className="font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted">Explore Rudraksha, malas, gemstones and more.</p>
              <ButtonLink href={routes.store} onClick={() => setOpen(false)}>
                Browse the store
              </ButtonLink>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                {items.map(({ product: p, qty }) => (
                  <li key={p.slug} className="flex gap-3 py-4">
                    <ProductArt product={p} className="size-20 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                      <p className="mt-0.5 text-sm">
                        <span className="font-bold">{money(p.price)}</span> <span className="text-xs text-muted line-through">{money(p.mrp)}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-line">
                          <button type="button" onClick={() => cart.setQty(p.slug, qty - 1)} className="p-1.5 hover:text-brand-600" aria-label="Decrease quantity">
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                          <button type="button" onClick={() => cart.setQty(p.slug, qty + 1)} disabled={qty >= 10} className="p-1.5 hover:text-brand-600 disabled:opacity-40" aria-label="Increase quantity">
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button type="button" onClick={() => cart.remove(p.slug)} className="p-1.5 text-muted hover:text-red-600" aria-label={`Remove ${p.name}`}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <footer className="space-y-2 border-t border-line px-5 py-4 text-sm">
                {subtotal < FREE_SHIPPING_FROM && (
                  <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                    Add {money(FREE_SHIPPING_FROM - subtotal)} more for <strong>free delivery</strong>.
                  </p>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">You save</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">{money(mrpTotal - subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Delivery</span>
                  <span>{shipping ? money(shipping) : "Free"}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-line pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{money(subtotal + shipping)}</span>
                </div>
                <button
                  type="button"
                  onClick={checkout}
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-600 font-semibold text-white shadow-sm shadow-brand-500/30 hover:from-brand-600 hover:to-brand-700"
                >
                  Proceed to checkout
                </button>
              </footer>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
