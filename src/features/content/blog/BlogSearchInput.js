"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { inputClasses } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { blogHref } from "./BlogFilters";

const DEBOUNCE_MS = 400; // wait this long after the last keystroke before searching

/**
 * Blog search box with debounce: results update automatically ~0.4 s after the user stops typing
 * (one request per pause, not per keystroke). Enter / the Search button still search immediately
 * through the surrounding <Form>, and the box works as a plain GET field without JavaScript.
 */
export function BlogSearchInput({ q = "", category }) {
  const router = useRouter();
  const [value, setValue] = useState(q);
  const [pending, startTransition] = useTransition();
  const lastSent = useRef(q.trim());

  // Keep the box in sync when the URL changes elsewhere (Clear search, back/forward): React's
  // "adjust state while rendering" pattern, so no extra render pass from an effect.
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setValue(q);
  }

  useEffect(() => {
    lastSent.current = q.trim();
  }, [q]);

  useEffect(() => {
    const term = value.trim();
    if (term === lastSent.current) return;
    const timer = setTimeout(() => {
      lastSent.current = term;
      startTransition(() => router.replace(blogHref({ category, q: term }), { scroll: false }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, category, router]);

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id="blog-search"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles, e.g. Sade Sati"
        className={cn(inputClasses, "pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden")}
        maxLength={80}
        autoComplete="off"
      />
      <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
        {pending ? (
          <Loader2 className="size-4 animate-spin text-brand-600" aria-label="Searching" />
        ) : (
          value && (
            <button type="button" onClick={() => setValue("")} className="rounded-full p-0.5 text-muted hover:text-fg" aria-label="Clear search">
              <X className="size-4" />
            </button>
          )
        )}
      </span>
    </div>
  );
}
