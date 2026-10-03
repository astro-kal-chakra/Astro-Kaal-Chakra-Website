"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Accessible tab list (WAI-ARIA tabs pattern, arrow-key navigation).
 * Render panels yourself with `tabPanelProps(id)` so the ids line up.
 */
export function useToolTabs() {
  const base = useId();
  return {
    tabId: (id) => `${base}-tab-${id}`,
    panelId: (id) => `${base}-panel-${id}`,
  };
}

export function ToolTabs({ tabs, active, onChange, label, ids, className }) {
  const refs = useRef({});

  const onKeyDown = (e, index) => {
    const next = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    let target = null;
    if (next) target = tabs[(index + next + tabs.length) % tabs.length];
    if (e.key === "Home") target = tabs[0];
    if (e.key === "End") target = tabs[tabs.length - 1];
    if (!target) return;
    e.preventDefault();
    onChange(target.id);
    refs.current[target.id]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex gap-1 overflow-x-auto rounded-full bg-surface-muted p-1 [scrollbar-width:none]", className)}
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => (refs.current[tab.id] = el)}
            type="button"
            role="tab"
            id={ids.tabId(tab.id)}
            aria-selected={selected}
            aria-controls={ids.panelId(tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "shrink-0 flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selected ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
