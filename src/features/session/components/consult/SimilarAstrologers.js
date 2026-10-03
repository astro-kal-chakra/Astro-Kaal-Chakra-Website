"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { astrologerService } from "@/lib/api/services/astrologer.service";
import { formatCurrency } from "@/lib/utils/format";
import { priceFor } from "@/lib/api/services/session.service";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/features/astrologers/components/StatusBadge";
import { SITE_LOCALE } from "@/config/locale";

/**
 * "Similar astrologers available now" — shown while waiting, after a reject /
 * timeout, in the queue and when the chosen astrologer is offline.
 * `onPick(astrologer)` lets the parent cancel any pending request first.
 */
export function SimilarAstrologers({ astrologer, mode, onPick, title }) {
  const locale = SITE_LOCALE;
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    astrologerService
      .getSimilar(astrologer, 6)
      .then((list) => {
        if (!alive) return;
        const usable = list.filter((a) => a.status === "online" && (mode === "chat" || a.supportsVideo));
        setItems(usable.slice(0, 4));
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [astrologer, mode]);

  if (items && items.length === 0) return null;

  return (
    <section aria-labelledby="similar-title" className="mt-8">
      <h2 id="similar-title" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {title || "Similar astrologers available now"}
      </h2>
      <ul className="space-y-2">
        {items === null
          ? [0, 1, 2].map((i) => (
              <li key={i}>
                <Skeleton className="h-[72px] rounded-2xl" />
              </li>
            ))
          : items.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
                <Avatar src={a.avatarUrl} name={a.name} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.name}</p>
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <StatusBadge status={a.status} />
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="size-3 fill-gold-500 text-gold-500" aria-hidden />
                      {a.rating.toFixed(1)}
                    </span>
                    <span>
                      {formatCurrency(priceFor(a, mode), locale)}
                      /min
                    </span>
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onPick(a)} aria-label={`Consult ${a.name} instead`}>
                  {(mode === "chat" ? "Chat" : "Call")}
                </Button>
              </li>
            ))}
      </ul>
    </section>
  );
}
