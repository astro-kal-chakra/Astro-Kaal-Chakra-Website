"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BadgeCheck, Search, ShieldCheck, Sparkles, Truck, X } from "lucide-react";
import { inputClasses } from "@/components/ui/Input";
import { ParticleField } from "@/components/ui/ParticleField";
import { cn } from "@/lib/utils/cn";
import { PRODUCTS, STORE_CATEGORIES, discountPct } from "../data";
import { ProductCard } from "./ProductCard";

const SORTS = {
  popular: { label: "Most popular", fn: (a, b) => b.reviews - a.reviews },
  
  rating: { label: "Top rated", fn: (a, b) => b.rating - a.rating || b.reviews - a.reviews },
  priceAsc: { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  priceDesc: { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  discount: { label: "Biggest discount", fn: (a, b) => discountPct(b) - discountPct(a) },
};

const PAGE = 12; // products rendered per "page"; Load more adds the next 12

const PROMISES = [
  { icon: BadgeCheck, label: "Lab-certified & energised" },
  { icon: Truck, label: "Free delivery above ₹499" },
  { icon: ShieldCheck, label: "7-day easy returns" },
];

/**
 * /store: animated hero, category chips, search, sort and a staggered product grid.
 * Scales to large catalogues: filtering/sorting is memoised and only PAGE products are rendered at a time
 * (Load more appends the next page), so 100+ products never mean 100+ heavy cards in the DOM at once.
 */
export function StoreView() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  // New filter → start again from the first page ("adjust state while rendering", no extra effect pass).
  const filterKey = `${category}|${sort}|${q.trim().toLowerCase()}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (filterKey !== prevKey) {
    setPrevKey(filterKey);
    setLimit(PAGE);
  }

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PRODUCTS.filter((p) => category === "all" || p.category === category)
      .filter((p) => !term || `${p.name} ${p.benefit} ${p.category}`.toLowerCase().includes(term))
      .sort(SORTS[sort].fn);
  }, [category, sort, q]);

  const counts = useMemo(() => Object.fromEntries(STORE_CATEGORIES.map((c) => [c.slug, PRODUCTS.filter((p) => p.category === c.slug).length])), []);
  const chip = (active) =>
    cn(
      "inline-flex h-9 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition",
      active
        ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-700/20 dark:border-gold-400 dark:bg-gold-400 dark:text-brand-950"
        : "border-line bg-surface text-fg hover:border-brand-300 hover:bg-surface-muted"
    );

  return (
    <div>
      {/* Hero */}
      <section className="bg-aura relative overflow-hidden border-b border-line">
        <ParticleField contained density={0.45} />
        <div className="container-page relative py-12 text-center sm:py-16">
          <p className="eyebrow justify-center motion-safe:animate-[banner-in_0.6s_ease-out]">
            <Sparkles className="size-3.5" aria-hidden /> Astro Kaal Chakra Store
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl leading-tight text-fg motion-safe:animate-[banner-in_0.7s_ease-out] sm:text-5xl">
            Sacred Rudraksha, Malas &amp; Gemstones
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted motion-safe:animate-[banner-in_0.8s_ease-out]">
            Authentic, energised items recommended by our astrologers — for peace, protection, prosperity and focus.
          </p>
          <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-fg motion-safe:animate-[banner-in_0.9s_ease-out]">
            {PROMISES.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-brand-600 dark:text-gold-400" aria-hidden /> {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container-page py-8">
        {/* Toolbar */}
        {/* pinned while scrolling on tablet/desktop; on phones it scrolls away so products get the screen */}
        <div className="-mx-4 space-y-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md sm:sticky sm:top-16 sm:z-20 sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
          <div className="flex gap-2 sm:gap-3">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Rudraksha, mala, gemstone…"
                className={cn(inputClasses, "pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden")}
              />
              {q && (
                <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg" aria-label="Clear search">
                  <X className="size-4" />
                </button>
              )}
            </label>
            <label className="w-36 shrink-0 sm:w-56">
              <span className="sr-only">Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={cn(inputClasses, "cursor-pointer")}>
                {Object.entries(SORTS).map(([k, s]) => (
                  <option key={k} value={k}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {/* One scrollable row (any number of categories), edges fade so it reads as "more this way" */}
          <div
            className="-mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-1 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)] [scrollbar-width:none] sm:mx-0 sm:px-1"
            role="tablist"
            aria-label="Categories"
          >
            <button type="button" role="tab" aria-selected={category === "all"} onClick={() => setCategory("all")} className={chip(category === "all")}>
              All <span className="opacity-70">{PRODUCTS.length}</span>
            </button>
            {STORE_CATEGORIES.map((c) => (
              <button key={c.slug} type="button" role="tab" aria-selected={category === c.slug} onClick={() => setCategory(c.slug)} className={chip(category === c.slug)}>
                {c.label} <span className="opacity-70">{counts[c.slug]}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted">{`${list.length} ${list.length === 1 ? "product" : "products"}`}</p>

        {list.length ? (
          // key: re-run the staggered entrance whenever the filter changes
          <>
            <ul key={filterKey} className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {list.slice(0, limit).map((p, i) => (
                // stagger only within the newest page, so "Load more" animates just the new cards
                <li key={p.slug} className="motion-safe:animate-[rise_0.55s_cubic-bezier(0.22,1,0.36,1)_backwards]" style={{ animationDelay: `${(i % PAGE) * 45}ms` }}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
            {limit < list.length && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-xs text-muted">{`Showing ${limit} of ${list.length}`}</p>
                <button
                  type="button"
                  onClick={() => setLimit((n) => n + PAGE)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-6 text-sm font-semibold transition hover:border-brand-300 hover:bg-surface-muted"
                >
                  Load more <ChevronDown className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
            <p className="font-display text-2xl">No products found</p>
            <p className="mt-2 text-muted">Try another word, or browse all categories.</p>
            <button type="button" onClick={() => { setQ(""); setCategory("all"); }} className="mt-5 rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-surface-muted">
              Show all products
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted">Demo catalogue — products and prices are for preview only; online checkout is coming soon.</p>
      </div>
    </div>
  );
}
