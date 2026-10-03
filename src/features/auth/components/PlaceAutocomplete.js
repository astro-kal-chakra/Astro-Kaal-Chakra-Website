"use client";

import { useEffect, useId, useState } from "react";
import { MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { placesService } from "@/lib/api/services/places.service";
import { Input } from "@/components/ui/Input";

/** Accessible combobox for birth place. `value` is the selected place object or null. */
export function PlaceAutocomplete({ id, value, onChange, placeholder }) {
  const listId = useId();
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebounce(query, 250);

  useEffect(() => {
    if (value && debounced === value.name) return;
    let cancelled = false;
    placesService.search(debounced).then((r) => !cancelled && (setResults(r), setOpen(true), setActive(-1)));
    return () => {
      cancelled = true;
    };
  }, [debounced, value]);

  const select = (place) => {
    onChange(place);
    setQuery(place.name);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => (a + 1) % results.length));
    else if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => (a - 1 + results.length) % results.length));
    else if (e.key === "Enter" && active >= 0) (e.preventDefault(), select(results[active]));
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          if (value) onChange(null);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-surface py-1 shadow-lg">
          {results.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={i === active}
              onMouseDown={() => select(p)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${i === active ? "bg-surface-muted" : ""}`}
            >
              <MapPin className="size-4 text-muted" aria-hidden />
              <span className="font-medium">{p.name}</span>
              <span className="text-muted">{p.region}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
