import { ChevronRight } from "lucide-react";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";

/**
 * Visible breadcrumb trail. Pair with breadcrumbJsonLd for structured data.
 * @param {{ items: { name: string, href?: string }[], label: string, className?: string }} props
 */
export function ContentBreadcrumbs({ items, label, className }) {
  return (
    <nav aria-label={label} className={cn("text-sm text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${it.name}-${i}`} className="flex min-w-0 items-center gap-1">
              {last || !it.href ? (
                <span aria-current={last ? "page" : undefined} className={cn("truncate", last && "text-fg")}>
                  {it.name}
                </span>
              ) : (
                <LocaleLink href={it.href} className="hover:text-brand-600 hover:underline dark:hover:text-gold-400">
                  {it.name}
                </LocaleLink>
              )}
              {!last && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
