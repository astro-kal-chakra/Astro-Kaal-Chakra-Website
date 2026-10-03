import { Search } from "lucide-react";
import { routes } from "@/config/routes";
import { buttonClasses } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";
import { label as t } from "@/lib/labels";

/** Build a blog listing URL from filters (locale-less, for LocaleLink). */
export function blogHref({ category, q, page } = {}) {
  const sp = new URLSearchParams();
  if (category) sp.set("category", category);
  if (q) sp.set("q", q);
  if (page && page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${routes.blog}?${qs}` : routes.blog;
}

/**
 * Category chips + search. Works without JavaScript: chips are links and the
 * search box is a plain GET form, so every filtered view is a shareable URL.
 */
export function BlogFilters({ lang, categories, category, q }) {
  const chip = (active) =>
    cn(
      "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
      active
        ? "border-brand-600 bg-brand-600 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-brand-950"
        : "border-line bg-surface text-fg hover:bg-surface-muted"
    );

  return (
    <div className="space-y-4">
      <form action={`${routes.blog}`} method="get" role="search" className="flex max-w-xl gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <label htmlFor="blog-search" className="sr-only">
          Search articles
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="blog-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search articles, e.g. Sade Sati"
            className={cn(inputClasses, "pl-9")}
            maxLength={80}
          />
        </div>
        <button type="submit" className={buttonClasses({ className: "h-11" })}>
          Search
        </button>
      </form>

      <nav aria-label="Filter by category">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <li>
            <LocaleLink href={blogHref({ q })} className={chip(!category)} aria-current={!category ? "page" : undefined}>
              All
            </LocaleLink>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <LocaleLink
                href={blogHref({ category: c, q })}
                className={chip(category === c)}
                aria-current={category === c ? "page" : undefined}
              >
                {t(`content.blog.categories.${c}`)}
              </LocaleLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
