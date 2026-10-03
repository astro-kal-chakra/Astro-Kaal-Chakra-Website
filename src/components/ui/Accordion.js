import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Native <details> accordion: zero JS, accessible, and crawlable for FAQ SEO. */
export function Accordion({ items, className }) {
  return (
    <div className={cn("divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface", className)}>
      {items.map((item, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-medium [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="px-4 pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
