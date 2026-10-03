import { List } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** In-page table of contents. Plain anchor links — no JS needed. */
export function TableOfContents({ title, sections, className, id = "toc" }) {
  return (
    <nav aria-labelledby={`${id}-title`} className={cn("rounded-2xl border border-line bg-surface p-5", className)}>
      <h2 id={`${id}-title`} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <List className="size-4" aria-hidden /> {title}
      </h2>
      <ol className="mt-3 space-y-2 text-sm">
        {sections.map((s, i) => (
          <li key={s.id} className="flex gap-2">
            <span className="text-gold-600 dark:text-gold-400" aria-hidden>
              {i + 1}.
            </span>
            <a href={`#${s.id}`} className="hover:text-brand-600 hover:underline dark:hover:text-gold-400">
              {s.h}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
