import { BookOpen, CalendarDays, CloudOff, Heart, Home, MessageCircle, RotateCw, ScrollText, SearchX, Sparkles, Star } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ZodiacWheel } from "@/components/ui/CelestialBackdrop";
import { blogCategoryLabel } from "./categoryLabel";

const TOOLS = [
  { href: routes.horoscope, label: "Daily Horoscope", icon: Star },
  { href: routes.kundli, label: "Free Kundli", icon: ScrollText },
  { href: routes.kundliMatching, label: "Kundli Matching", icon: Heart },
  { href: routes.panchang, label: "Today's Panchang", icon: CalendarDays },
];

const VARIANTS = {
  // No posts published at all
  none: {
    icon: BookOpen,
    eyebrow: "Coming soon",
    title: "Our first articles are on the way",
    text: "Verified astrologers are writing practical guidance on planets, remedies, festivals and more. Check back soon — or ask them your question directly.",
  },
  // A search or category with no matching posts
  noResults: {
    icon: SearchX,
    eyebrow: "No matches",
    title: "No articles found",
  },
  // The request failed
  failed: {
    icon: CloudOff,
    eyebrow: "Connection issue",
    title: "We couldn't load articles right now",
    text: "This is usually temporary. Please check your connection and try again in a moment.",
  },
};

/**
 * Friendly, on-brand card for an empty blog listing: nothing published yet, nothing matching a search or
 * category, or the request failed. Each case suggests a useful next step so the visitor isn't stuck.
 */
export function BlogEmptyState({ variant = "none", q, category, categories = [], retryHref = routes.blog }) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  const text =
    variant === "noResults"
      ? q
        ? `Nothing matches “${q}”. Try a different word, or explore one of the topics below.`
        : `There are no articles in ${category ? blogCategoryLabel(category) : "this category"} yet. Explore another topic below.`
      : v.text;

  return (
    <div className="bg-aura relative isolate overflow-hidden rounded-3xl border border-line px-6 py-12 text-center sm:px-10 sm:py-16">
      {/* decorative turning wheel */}
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 w-72 opacity-40 sm:-right-16 sm:w-96 dark:opacity-25">
        <ZodiacWheel small />
      </div>
      <Sparkles aria-hidden className="absolute left-8 top-8 size-4 text-gold-500 motion-safe:animate-twinkle" />
      <Sparkles aria-hidden className="absolute bottom-10 right-1/4 size-3 text-brand-400 motion-safe:animate-twinkle [animation-delay:1.2s]" />

      <div className="relative mx-auto flex size-20 items-center justify-center">
        <span aria-hidden className="absolute inset-0 rounded-full bg-brand-400/25 motion-safe:animate-ping [animation-duration:3s]" />
        <span className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-600/30">
          <Icon className="size-9" aria-hidden />
        </span>
      </div>

      <p className="eyebrow mt-6 justify-center">{v.eyebrow}</p>
      <h3 className="mt-2 font-display text-2xl text-fg sm:text-3xl">{v.title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-muted">{text}</p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {variant === "none" && (
          <ButtonLink href={routes.astrologers}>
            <MessageCircle className="size-4" aria-hidden /> Talk to an astrologer
          </ButtonLink>
        )}
        {variant === "noResults" && (
          <ButtonLink href={routes.blog} variant="outline">
            {q ? "Clear search" : "Browse all articles"}
          </ButtonLink>
        )}
        {variant === "failed" && (
          <>
            <ButtonLink href={retryHref}>
              <RotateCw className="size-4" aria-hidden /> Try again
            </ButtonLink>
            <ButtonLink href={routes.home} variant="outline">
              <Home className="size-4" aria-hidden /> Go to home
            </ButtonLink>
          </>
        )}
      </div>

      {/* A useful next step */}
      {variant === "none" && (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Meanwhile, explore our free tools</p>
          <ul className="mx-auto mt-4 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {TOOLS.map(({ href, label, icon: ToolIcon }) => (
              <li key={href}>
                <LocaleLink
                  href={href}
                  className="flex h-full flex-col items-center gap-2 rounded-2xl border border-line bg-surface/80 p-4 text-sm font-medium text-fg transition hover:border-brand-300 hover:text-brand-700 motion-safe:hover:-translate-y-0.5 dark:hover:text-gold-300"
                >
                  <ToolIcon className="size-5 text-brand-600 dark:text-gold-400" aria-hidden />
                  {label}
                </LocaleLink>
              </li>
            ))}
          </ul>
        </div>
      )}
      {variant === "noResults" && categories.length > 0 && (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Try a popular topic</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {categories
              .filter((c) => c !== category)
              .slice(0, 6)
              .map((c) => (
                <li key={c}>
                  <LocaleLink
                    href={`${routes.blog}?category=${encodeURIComponent(c)}`}
                    rel="nofollow"
                    className="inline-flex rounded-full border border-line bg-surface/80 px-4 py-1.5 text-sm font-medium text-fg transition hover:border-brand-300 hover:text-brand-700 dark:hover:text-gold-300"
                  >
                    {blogCategoryLabel(c)}
                  </LocaleLink>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
