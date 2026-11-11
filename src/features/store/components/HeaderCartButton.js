"use client";

import { ShoppingBag } from "lucide-react";
import { openCart, useCartCount } from "../cart";

/** Header cart icon with an item-count badge; opens the cart drawer (checkout lives there). */
export function HeaderCartButton() {
  const count = useCartCount();
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={count ? `Cart, ${count} items` : "Cart"}
      className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-fg transition hover:border-brand-300 hover:text-brand-700 dark:hover:text-gold-300"
    >
      <ShoppingBag className="size-[18px]" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface dark:bg-brand-400 dark:text-brand-950">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
