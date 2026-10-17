"use client";

import { useEffect, useId, useState } from "react";
import { MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { placesService } from "@/lib/api/services/places.service";
import { Input } from "@/components/ui/Input";

/**
 * Accessible combobox for birth place. `value` is the selected place object or null.
 * Searches every Indian city, town and village (type "Rampur, Saharanpur" to narrow by district or state).
 */
export function PlaceAutocomplete({ id, value, onChange, placeholder }) {
  const listId = useId();
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const debounced = useDebounce(query, 250);
  const typed = debounced.trim();

  useEffect(() => {
    if (value && debounced === value.name) return;
    if (typed.length < 2) return; // the list only shows from 2 letters
    let cancelled = false;
    placesService
      .search(typed)
      .then((r) => {
        if (cancelled) return;
        setResults(Array.isArray(r) ? r : []);
        setState("done");
        setOpen(true);
        setActive(-1);
      })
      .catch(() => !cancelled && (setResults([]), setState("error"), setOpen(true)));
    return () => {
      cancelled = true;
    };
  }, [debounced, typed, value]);

  const select = (place) => {
    onChange(place);
    setQuery(place.name);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") return setOpen(false);
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => (a + 1) % results.length));
    else if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => (a - 1 + results.length) % results.length));
    else if (e.key === "Enter" && active >= 0) (e.preventDefault(), select(results[active]));
  };

  // A message instead of the list: still typing, searching, nothing found, or the search failed
  const message =
    state === "loading" && !results.length
      ? "Searching…"
      : state === "error"
        ? "Couldn't search places right now. Please try again."
        : state === "done" && !results.length
          ? `No place found for "${typed}". Check the spelling, or try the nearest town or district.`
          : null;
  const showList = open && !value && typed.length >= 2 && (results.length > 0 || message);

  return (
    <div className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={Boolean(showList)}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setState("loading");
          if (value) onChange(null);
        }}
        onFocus={() => results.length && setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {showList && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-line bg-surface py-1 shadow-lg">
          {results.map((p, i) => (
            <li
              key={p.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => (e.preventDefault(), select(p))}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-start gap-2.5 px-3 py-2 text-sm ${i === active ? "bg-surface-muted" : ""}`}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate font-medium text-fg">{p.name}</span>
                {p.region && <span className="block truncate text-xs text-muted">{p.region}</span>}
              </span>
            </li>
          ))}
          {message && (
            <li role="status" className="px-3 py-2.5 text-sm text-muted">
              {message}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
