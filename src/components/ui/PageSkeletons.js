import { cn } from "@/lib/utils/cn";
import { Skeleton } from "./Skeleton";

/*
 * Page-shaped loading skeletons, shown instantly by each route's loading.js while the page's API data
 * arrives. They mirror the real layouts (container, spacing, grids) so content lands without jumping.
 */

const repeat = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

/** Page title + optional subtitle line(s). */
export function SkHeading({ subtitle = true, center = false, className }) {
  return (
    <div className={cn("space-y-3", center && "flex flex-col items-center", className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-3/4 max-w-md" />
      {subtitle && <Skeleton className="h-4 w-full max-w-xl" />}
    </div>
  );
}

/** A few lines of body text. */
export function SkText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {repeat(lines, (i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

/** Card with an image/cover area on top (blog posts, live sessions, reports). */
export function SkMediaCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <SkText lines={2} />
        <Skeleton className="mt-2 h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Simple text card (features, FAQs, info blocks). */
export function SkPlainCard() {
  return (
    <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="h-5 w-2/3" />
      <SkText lines={2} />
    </div>
  );
}

/** Responsive grid of cards. */
export function SkCardGrid({ count = 6, card = "media", className = "sm:grid-cols-2 lg:grid-cols-3" }) {
  const Card = card === "media" ? SkMediaCard : SkPlainCard;
  return (
    <div className={cn("grid grid-cols-1 gap-5", className)}>
      {repeat(count, (i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

/** Listing page: heading, optional filter chips, card grid (blog, live, reports). */
export function SkListPage({ chips = true, count = 6, card = "media" }) {
  return (
    <div className="container-page space-y-6 py-8">
      <SkHeading />
      {chips && (
        <div className="flex gap-2 overflow-hidden">
          {repeat(5, (i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      )}
      <SkCardGrid count={count} card={card} />
    </div>
  );
}

/** Long-form article (blog post, legal page, report). */
export function SkArticle({ withCover = false }) {
  return (
    <div className="container-page max-w-3xl space-y-6 py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-5/6" />
      <Skeleton className="h-4 w-48" />
      {withCover && <Skeleton className="aspect-[16/9] w-full rounded-2xl" />}
      {repeat(4, (i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <SkText lines={3} />
        </div>
      ))}
    </div>
  );
}

/** Generic content page (about, contact, FAQs, how it works, tools…). */
export function SkGenericPage() {
  return (
    <div className="container-page space-y-8 py-8">
      <SkHeading />
      <SkText lines={3} className="max-w-3xl" />
      <SkCardGrid count={3} card="plain" className="md:grid-cols-3" />
      <SkText lines={4} className="max-w-3xl" />
    </div>
  );
}

/** Astrologer profile: avatar + name + stats, rates, about, reviews. */
export function SkProfile() {
  return (
    <div className="container-page space-y-6 py-8">
      <Skeleton className="h-4 w-48" />
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Skeleton className="size-24 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-4">
              {repeat(3, (i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {repeat(3, (i) => (
              <Skeleton key={i} className="h-11 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {repeat(3, (i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <Skeleton className="h-6 w-32" />
          <SkText lines={5} />
        </div>
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <Skeleton className="h-6 w-28" />
          {repeat(3, (i) => (
            <SkText key={i} lines={2} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Horoscope sign page: heading + period tabs + reading + 4 areas, sidebar of signs. */
export function SkHoroscopeSign() {
  return (
    <div className="container-page grid grid-cols-1 gap-8 py-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-full" />
        <SkText lines={3} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {repeat(4, (i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-3 gap-3">
          {repeat(12, (i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Live room: video stage + chat panel. */
export function SkLiveRoom() {
  return (
    <div className="container-page grid grid-cols-1 gap-5 py-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        {repeat(6, (i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <SkText lines={1} className="flex-1" />
          </div>
        ))}
        <Skeleton className="mt-2 h-11 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Home: hero (headline + dial), astrologer cards, categories, zodiac strip. */
export function SkHome() {
  return (
    <div>
      <div className="border-b border-line">
        <div className="container-page grid grid-cols-1 items-center gap-12 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div className="space-y-5">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-12 w-3/5" />
            <SkText lines={3} className="max-w-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-52 rounded-full" />
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
          </div>
          <Skeleton className="mx-auto aspect-square w-full max-w-[420px] rounded-full" />
        </div>
      </div>
      <div className="container-page space-y-6 py-10">
        <SkHeading />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repeat(3, (i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="container-page grid grid-cols-2 gap-3 pb-10 sm:grid-cols-3 lg:grid-cols-5">
        {repeat(5, (i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
