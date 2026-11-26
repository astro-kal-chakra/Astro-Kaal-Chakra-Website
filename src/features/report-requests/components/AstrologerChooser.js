"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Search, Star } from "lucide-react";
import { reportRequestService } from "@/lib/api/services/reportRequest.service";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

export const ANY_EXPERT = "any";
const PAGE_SIZE = 10;

const optionClass = (active) =>
  cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition",
    active ? "border-brand-500 bg-brand-50 dark:border-gold-500 dark:bg-brand-800/40" : "border-line hover:bg-surface-muted"
  );

/** One astrologer line: avatar, name, rating, experience, languages. */
export function AstrologerLine({ astrologer: a }) {
  const facts = [a.experienceYears > 0 && `${a.experienceYears} yrs exp`, a.languages?.length > 0 && a.languages.slice(0, 3).join(", ")].filter(Boolean);
  return (
    <>
      <Avatar src={a.avatar} name={a.name || "Astrologer"} size={44} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-sm font-medium">
          <span className="truncate">{a.name}</span>
          {a.isVerified && <BadgeCheck className="size-4 shrink-0 text-brand-500 dark:text-gold-400" aria-label="Verified" />}
        </span>
        <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
          {a.rating > 0 ? (
            <span className="inline-flex items-center gap-0.5">
              <Star className="size-3 fill-gold-500 text-gold-500" aria-hidden />
              <span className="font-medium text-fg">{Number(a.rating).toFixed(1)}</span>
              {a.ratingCount > 0 && <span>{`(${a.ratingCount})`}</span>}
            </span>
          ) : (
            <span>New</span>
          )}
          {facts.map((f) => (
            <span key={f} className="truncate">{`· ${f}`}</span>
          ))}
        </span>
      </span>
    </>
  );
}

/**
 * "Who writes it?": an "Any expert" card (when the dashboard allows it) and a searchable list of astrologers
 * taking report requests. `value` is ANY_EXPERT, an astrologer row, or null.
 */
export function AstrologerChooser({ value, onChange, allowAnyExpert }) {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [nonce, setNonce] = useState(0);
  const reqKey = `${term}#${nonce}`;
  const [state, setState] = useState({ reqKey, status: "loading", items: [], page: 0, hasMore: false, more: false });

  // Search after a short pause in typing
  useEffect(() => {
    const id = setTimeout(() => setTerm(q.trim()), 350);
    return () => clearTimeout(id);
  }, [q]);

  if (state.reqKey !== reqKey) setState({ reqKey, status: "loading", items: [], page: 0, hasMore: false, more: false });

  useEffect(() => {
    let alive = true;
    reportRequestService
      .listAstrologers({ q: term, page: 1, pageSize: PAGE_SIZE })
      .then((r) => alive && setState({ reqKey, status: "success", items: r.items, page: 1, hasMore: r.hasMore, more: false }))
      .catch(() => alive && setState({ reqKey, status: "error", items: [], page: 0, hasMore: false, more: false }));
    return () => {
      alive = false;
    };
    // reqKey covers term + retries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqKey]);

  const loadMore = () => {
    if (state.more) return;
    const next = state.page + 1;
    const k = state.reqKey;
    setState((s) => ({ ...s, more: true }));
    reportRequestService
      .listAstrologers({ q: term, page: next, pageSize: PAGE_SIZE })
      .then((r) =>
        setState((s) => {
          if (s.reqKey !== k) return s;
          const seen = new Set(s.items.map((x) => x.id));
          return { ...s, items: [...s.items, ...r.items.filter((x) => !seen.has(x.id))], page: next, hasMore: r.hasMore, more: false };
        })
      )
      .catch(() => setState((s) => (s.reqKey === k ? { ...s, more: false } : s)));
  };

  const selectedId = value && value !== ANY_EXPERT ? value.id : null;

  return (
    <div className="space-y-2">
      {allowAnyExpert && (
        <button type="button" role="radio" aria-checked={value === ANY_EXPERT} onClick={() => onChange(ANY_EXPERT)} className={optionClass(value === ANY_EXPERT)}>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Any expert</span>
            <span className="block text-xs text-muted">Our team chooses the best available astrologer for this report.</span>
          </span>
        </button>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search astrologers by name" aria-label="Search astrologers" className="pl-9" />
      </div>

      <div role="radiogroup" aria-label="Astrologer" className="max-h-72 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
        {state.status === "loading" && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[4.25rem] rounded-xl" />)}
        {state.status === "error" && (
          <p className="rounded-xl bg-surface-muted p-3 text-sm text-muted">
            {"Couldn't load astrologers. "}
            <button type="button" className="font-semibold text-brand-600 underline dark:text-gold-400" onClick={() => setNonce((n) => n + 1)}>
              Try again
            </button>
          </p>
        )}
        {state.status === "success" && state.items.length === 0 && (
          <p className="rounded-xl bg-surface-muted p-3 text-sm text-muted">
            {term ? `No astrologer named "${term}" is taking reports right now.` : "No astrologer is taking reports right now."}
          </p>
        )}
        {state.items.map((a) => (
          <button key={a.id} type="button" role="radio" aria-checked={selectedId === a.id} onClick={() => onChange(a)} className={optionClass(selectedId === a.id)}>
            <AstrologerLine astrologer={a} />
          </button>
        ))}
        {state.status === "success" && state.hasMore && (
          <Button variant="ghost" size="sm" className="w-full" loading={state.more} onClick={loadMore}>
            Show more astrologers
          </Button>
        )}
      </div>
    </div>
  );
}
