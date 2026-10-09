"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ReviewCard } from "@/features/home/components/InfoSections";
import { astrologerService } from "@/lib/api/services/astrologer.service";

/**
 * Reviews after the server-rendered first page: "Show more reviews" loads the next 10 at a time.
 * Renders <li> items, so it sits inside the same list as the first page.
 */
export function MoreReviews({ astrologerId, hasMore: initialHasMore, locale }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(Boolean(initialHasMore));
  const [state, setState] = useState("idle"); // idle | loading | error

  const more = async () => {
    setState("loading");
    try {
      const r = await astrologerService.getReviews(astrologerId, { page: page + 1 });
      setItems((cur) => {
        const seen = new Set(cur.map((x) => x.id));
        return [...cur, ...r.items.filter((x) => !seen.has(x.id))];
      });
      setPage(page + 1);
      setHasMore(Boolean(r.hasMore ?? (page + 1) * 10 < r.total));
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      {items.map((r) => (
        <ReviewCard key={r.id} review={r} locale={locale} />
      ))}
      {(hasMore || state === "error") && (
        <li className="flex flex-col items-center gap-1 sm:col-span-2">
          <Button variant="outline" size="sm" loading={state === "loading"} onClick={more}>
            {state === "error" ? "Try again" : "Show more reviews"}
          </Button>
          {state === "error" && <p className="text-xs text-muted">Couldn&apos;t load more reviews.</p>}
        </li>
      )}
    </>
  );
}
