"use client";

import { Search, X } from "lucide-react";
import { LANGUAGES, PRICE_RANGES, SORT_OPTIONS, SPECIALTIES } from "@/constants/astrologer";
import { cn } from "@/lib/utils/cn";
import { Input, Select } from "@/components/ui/Input";
import { MODE_FILTERS } from "../lib/modes";

const chip = (active) =>
  cn(
    "h-9 shrink-0 rounded-full border px-3 text-sm font-medium transition-colors",
    active
      ? "border-brand-600 bg-brand-600 text-white dark:border-brand-400 dark:bg-brand-400 dark:text-brand-950"
      : "border-line bg-surface text-fg hover:border-brand-300 hover:bg-surface-muted"
  );

export function AstrologerFilters({ filters, onChange, onReset }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const hasFilters = Object.entries(filters).some(([k, v]) => k !== "sort" && v);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            type="search"
            value={filters.q || ""}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search by name or specialty"
            className="pl-9"
            aria-label="Search"
          />
        </div>
        <Select value={filters.sort || SORT_OPTIONS.POPULARITY} onChange={(e) => set({ sort: e.target.value })} className="sm:w-56" aria-label="Sort by">
          <option value={SORT_OPTIONS.POPULARITY}>Popularity</option>
          <option value={SORT_OPTIONS.RATING}>Rating</option>
          <option value={SORT_OPTIONS.PRICE_LOW}>Price: low to high</option>
          <option value={SORT_OPTIONS.PRICE_HIGH}>Price: high to low</option>
          <option value={SORT_OPTIONS.EXP_HIGH}>Experience: high to low</option>
          <option value={SORT_OPTIONS.EXP_LOW}>Experience: low to high</option>
        </Select>
      </div>

      {/* Horizontal-scroll filter bar — thumb friendly on mobile */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <button className={chip(filters.online)} onClick={() => set({ online: filters.online ? "" : "1" })}>
          <span className="mr-1.5 inline-block size-2 rounded-full bg-online" aria-hidden />
          Online now
        </button>
        {MODE_FILTERS.map((m) => (
          <button key={m.key} className={cn(chip(filters.mode === m.key), "inline-flex items-center gap-1.5")} aria-pressed={filters.mode === m.key} onClick={() => set({ mode: filters.mode === m.key ? "" : m.key })}>
            <m.icon className="size-3.5" aria-hidden /> {m.label}
          </button>
        ))}
        <button className={chip(filters.minRating === "4.5")} onClick={() => set({ minRating: filters.minRating === "4.5" ? "" : "4.5" })}>
          ★ 4.5+
        </button>

        <Select value={filters.language || ""} onChange={(e) => set({ language: e.target.value })} className="h-9 w-auto shrink-0 rounded-full text-sm" aria-label="Language">
          <option value="">Language</option>
          {LANGUAGES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </Select>
        <Select value={filters.specialty || ""} onChange={(e) => set({ specialty: e.target.value })} className="h-9 w-auto shrink-0 rounded-full text-sm" aria-label="Specialty">
          <option value="">Specialty</option>
          {SPECIALTIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select value={filters.price || ""} onChange={(e) => set({ price: e.target.value })} className="h-9 w-auto shrink-0 rounded-full text-sm" aria-label="Price">
          <option value="">Price</option>
          {PRICE_RANGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>

        {hasFilters && (
          <button onClick={onReset} className="flex h-9 shrink-0 items-center gap-1 px-2 text-sm font-medium text-accent">
            <X className="size-4" aria-hidden /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
