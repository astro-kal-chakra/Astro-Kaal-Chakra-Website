"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { cart, openCart, useCartQty, useWished, wishlist } from "../cart";

/** Product page buttons: quantity, Add to cart, Buy now (adds + opens the cart), wishlist. */
export function ProductActions({ product: p }) {
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const inCart = useCartQty(p.slug);
  const wished = useWished(p.slug);

  const addToCart = () => {
    cart.setQty(p.slug, inCart + qty);
    toast({ type: "success", title: "Added to cart", message: `${qty} × ${p.name}`, duration: 2000 });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted">Quantity</span>
        <div className="inline-flex items-center rounded-full border border-line">
          <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))} className="p-2.5 hover:text-brand-600" aria-label="Decrease quantity">
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button type="button" onClick={() => setQty((n) => Math.min(cart.MAX_QTY, n + 1))} className="p-2.5 hover:text-brand-600" aria-label="Increase quantity">
            <Plus className="size-4" />
          </button>
        </div>
        {inCart > 0 && <span className="text-xs font-medium text-green-700 dark:text-green-400">{inCart} in your cart</span>}
      </div>

      <div className="flex gap-2 sm:gap-3">
        <button
          type="button"
          onClick={addToCart}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-fg text-sm font-semibold text-fg transition hover:bg-fg hover:text-bg sm:text-base"
        >
          <ShoppingBag className="size-5" aria-hidden /> Add to cart
        </button>
        <button
          type="button"
          onClick={() => {
            cart.setQty(p.slug, inCart + qty);
            openCart();
          }}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-sm font-semibold text-white shadow-md shadow-brand-600/30 transition hover:from-brand-600 hover:to-brand-700 sm:text-base"
        >
          <Zap className="size-5" aria-hidden /> Buy now
        </button>
        <button
          type="button"
          onClick={() => wishlist.toggle(p.slug)}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line transition hover:border-red-300"
        >
          <Heart className={cn("size-5", wished ? "fill-red-500 text-red-500" : "text-muted")} aria-hidden />
        </button>
      </div>
    </div>
  );
}
