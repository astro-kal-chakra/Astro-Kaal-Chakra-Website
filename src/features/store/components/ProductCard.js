"use client";

import { memo } from "react";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { SITE_LOCALE } from "@/config/locale";
import { routes } from "@/config/routes";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { cart, useCartQty, useWished, wishlist } from "../cart";
import { categoryLabel, discountPct } from "../data";
import { ProductArt } from "./ProductArt";

/**
 * Compact, modern product card: inset rounded image (4:3), category · rating line, name, price row with a
 * round "+" button that becomes a − qty + pill. Image and name open the product page.
 * Memoised + per-product subscriptions, so long grids stay fast.
 */
export const ProductCard = memo(function ProductCard({ product: p }) {
  const { toast } = useToast();
  const qty = useCartQty(p.slug);
  const wished = useWished(p.slug);
  const off = discountPct(p);
  const href = routes.storeProduct(p.slug);
  const money = (n) => formatCurrency(n, SITE_LOCALE);

  return (
    <article className="group flex h-full flex-col rounded-[1.25rem] border border-line bg-surface p-2 transition duration-300 hover:border-brand-200 hover:shadow-[0_16px_36px_-20px_rgb(194_65_12/0.45)] motion-safe:hover:-translate-y-0.5 dark:hover:border-brand-800">
      <div className="relative overflow-hidden rounded-2xl">
        <LocaleLink href={href} tabIndex={-1} aria-hidden className="block">
          <ProductArt product={p} className="aspect-[4/3]" />
        </LocaleLink>
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-green-700 shadow-sm backdrop-blur dark:bg-black/60 dark:text-green-400">
            -{off}%
          </span>
        )}
        <button
          type="button"
          onClick={() => wishlist.toggle(p.slug)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-fg shadow-sm backdrop-blur transition hover:scale-105 active:scale-90 dark:bg-black/60"
        >
          <Heart className={cn("size-4", wished ? "fill-red-500 text-red-500" : "text-muted")} aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-2.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="truncate font-semibold uppercase tracking-wider text-accent">{p.tag || categoryLabel(p.category)}</span>
          <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-fg">
            <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
            {p.rating}
            <span className="font-normal text-muted">({p.reviews >= 1000 ? `${(p.reviews / 1000).toFixed(1)}k` : p.reviews})</span>
          </span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-fg">
          <LocaleLink href={href} className="hover:text-brand-700 dark:hover:text-gold-300">
            {p.name}
          </LocaleLink>
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="min-w-0 leading-tight">
            <span className="block text-base font-bold text-fg">{money(p.price)}</span>
            <span className="text-[11px] text-muted line-through">{money(p.mrp)}</span>
          </p>

          {qty ? (
            <div className="flex h-9 shrink-0 items-center rounded-full bg-brand-600 text-white dark:bg-brand-400 dark:text-brand-950">
              <button type="button" onClick={() => cart.setQty(p.slug, qty - 1)} className="flex h-full w-8 items-center justify-center" aria-label="Decrease quantity">
                <Minus className="size-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => cart.setQty(p.slug, qty + 1)}
                disabled={qty >= cart.MAX_QTY}
                className="flex h-full w-8 items-center justify-center disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                cart.add(p.slug);
                toast({ type: "success", title: "Added to cart", message: p.name, duration: 2000 });
              }}
              aria-label={`Add ${p.name} to cart`}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-700 hover:shadow-lg active:scale-90 dark:bg-brand-400 dark:text-brand-950"
            >
              <Plus className="size-5" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </article>
  );
});
