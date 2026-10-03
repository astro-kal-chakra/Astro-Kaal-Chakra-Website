import { ChevronLeft, ChevronRight } from "lucide-react";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";
import { blogHref } from "./BlogFilters";

const ITEM = "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border border-line px-3 text-sm font-medium";
const ACTIVE = "border-brand-600 bg-brand-600 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-brand-950";
const IDLE = "bg-surface hover:bg-surface-muted";

export function BlogPagination({ page, totalPages, category, q }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const edge = (target, rel, children) =>
    target ? (
      <LocaleLink href={blogHref({ category, q, page: target })} rel={rel} className={cn(ITEM, IDLE)}>
        {children}
      </LocaleLink>
    ) : (
      <span className={cn(ITEM, "opacity-40")} aria-disabled="true">
        {children}
      </span>
    );

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-col items-center gap-3">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {edge(page > 1 ? page - 1 : null, "prev", <><ChevronLeft className="size-4" aria-hidden /> Previous</>)}
        </li>
        {pages.map((p) => (
          <li key={p}>
            <LocaleLink
              href={blogHref({ category, q, page: p })}
              aria-label={`Go to page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={cn(ITEM, p === page ? ACTIVE : IDLE)}
            >
              {p}
            </LocaleLink>
          </li>
        ))}
        <li>
          {edge(page < totalPages ? page + 1 : null, "next", <>Next <ChevronRight className="size-4" aria-hidden /></>)}
        </li>
      </ul>
      <p className="text-xs text-muted">{`Page ${page} of ${totalPages}`}</p>
    </nav>
  );
}
