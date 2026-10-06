"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PRICE_RANGES } from "@/constants/astrologer";
import { useDebounce } from "@/hooks/useDebounce";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAstrologerPresence } from "../hooks/useAstrologerPresence";
import { AstrologerCard, AstrologerCardSkeleton } from "./AstrologerCard";
import { AstrologerFilters } from "./AstrologerFilters";

const PAGE_SIZE = 12;
const FILTER_KEYS = ["q", "language", "specialty", "price", "minRating", "online", "mode", "sort", "category"];

/** URL filters → service query (price range id → min/max). */
function toQuery(filters) {
  const { price, ...rest } = filters;
  const range = PRICE_RANGES.find((p) => p.id === price);
  return { ...rest, ...(range ? { minPrice: range.min, maxPrice: Number.isFinite(range.max) ? range.max : undefined } : {}) };
}

/**
 * Client-side listing. First page is server-rendered (SEO + fast LCP) and
 * passed in as `initial`; filters sync to the URL so results are shareable.
 */
/** `options` = { languages, specialties } from the backend (/meta) for the filter menus. */
export function AstrologerListing({ initial, initialFilters, options }) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const firstRender = useRef(true);
  const sentinel = useRef(null);

  const debouncedFilters = useDebounce(filters, 300);
  const withPresence = useAstrologerPresence(items);

  // Sync filters → URL (replace, no scroll) and refetch page 1.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    FILTER_KEYS.forEach((k) => debouncedFilters[k] && params.set(k, debouncedFilters[k]));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    let cancelled = false;
    setLoading(true);
    setError(null);
    astrologerService
      .list(toQuery(debouncedFilters), { page: 1, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setPage(1);
      })
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await astrologerService.list(toQuery(filters), { page: page + 1, pageSize: PAGE_SIZE });
      setItems((prev) => [...prev, ...res.items]);
      setTotal(res.total);
      setPage((p) => p + 1);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, filters, page]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  const reset = () => setFilters({ sort: filters.sort });

  return (
    <div className="space-y-6">
      <AstrologerFilters filters={filters} onChange={setFilters} onReset={reset} languages={options?.languages} specialties={options?.specialties} />
      <p className="text-sm text-muted">{`${total} astrologers available`}</p>

      {error && !items.length ? (
        <EmptyState
          title="Something went wrong"
          description="Please try again. If the problem continues, contact support."
          action={<Button onClick={() => setFilters({ ...filters })}>Try again</Button>}
        />
      ) : !loading && !items.length ? (
        <EmptyState
          title="No astrologers match your filters"
          description="Try removing a filter or searching for something else."
          action={<Button variant="outline" onClick={reset}>Clear filters</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => (
            <AstrologerCard key={a.id} astrologer={withPresence(a)} priority={i < 3} />
          ))}
          {loading && Array.from({ length: 3 }).map((_, i) => <AstrologerCardSkeleton key={`s${i}`} />)}
        </div>
      )}

      {hasMore && <div ref={sentinel} className="h-1" aria-hidden />}
    </div>
  );
}
