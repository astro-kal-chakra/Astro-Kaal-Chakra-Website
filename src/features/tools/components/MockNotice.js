"use client";

import { Info } from "lucide-react";

/** Shown while results come from local mock calculations (remove with the mocks). */
export function MockNotice({ show = true }) {
  if (!show) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      Demo calculation: these results are approximate and for preview only. Precise calculations will come from our servers.
    </p>
  );
}
