"use client";

import { Award, BadgeCheck, Crown, Gift, Languages, Star, Users } from "lucide-react";
import { routes } from "@/config/routes";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { label as t } from "@/lib/labels";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { SITE_LOCALE } from "@/config/locale";
import { astrologerModes } from "../lib/modes";
import { AstrologerActions, FollowHeart } from "./AstrologerActions";
import { StatusBadge } from "./StatusBadge";

const RING = { online: "ring-online", busy: "ring-busy", offline: "ring-line" };
const DOT = { online: "bg-online", busy: "bg-busy", offline: "bg-offline" };

/** Phones and small tablets get the app-style card; 768px and up keep the desktop card. */
export function AstrologerCard({ astrologer, priority = false }) {
  return (
    <>
      <MobileAstrologerCard astrologer={astrologer} priority={priority} />
      <DesktopAstrologerCard astrologer={astrologer} priority={priority} />
    </>
  );
}

/** Free session or people waiting (shared by both cards). */
function AvailabilityChips({ a, className, showFree = true }) {
  const free = showFree && a.freeModes?.length > 0 && a.status !== "offline";
  if (!free && !(a.queueCount > 0)) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5 text-xs font-medium", className)}>
      {/* Free session for users who haven't had theirs: no charge at all */}
      {free && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <Gift className="size-3" aria-hidden /> Free session for you · ₹0
        </span>
      )}
      {a.queueCount > 0 && (
        <span key={a.queueCount} className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {a.queueCount} waiting
        </span>
      )}
    </div>
  );
}

/**
 * Mobile (below 768px): photo with a status dot, name + verified tick + heart, "★ 3.0 (3) • 5 Yrs Exp",
 * specialty pills (first two + "+N"), languages, then the per-minute rate on the left and pill buttons
 * on the right (first mode filled, the rest outlined). Sizes step down on very narrow cards.
 */
function MobileAstrologerCard({ astrologer: a, priority }) {
  const modes = astrologerModes(a);
  const prices = modes.filter((m) => !m.free && m.price != null).map((m) => Number(m.price));
  const rate = prices.length ? Math.min(...prices) : null;
  const href = routes.astrologer(a.slug);
  const shownTags = a.specialties.slice(0, 2);
  const moreTags = a.specialties.length - shownTags.length;
  const pill = "rounded-full bg-slate-200/70 px-2.5 py-1 @min-[22rem]:px-3 dark:bg-white/10";

  return (
    // The card is the size container: everything inside adapts to the card's width, not the screen's
    <Card
      as="article"
      interactive
      className="@container h-full min-w-0 rounded-2xl border-gray-200 bg-white shadow-sm md:hidden dark:border-line dark:bg-surface"
    >
      <div className="relative flex h-full flex-col p-4 @min-[22rem]:p-5">
        <FollowHeart astrologer={a} className="absolute right-2 top-2 text-gray-500 @min-[22rem]:right-3 @min-[22rem]:top-3 dark:text-muted" />
        <div className="flex gap-3 @min-[22rem]:gap-4">
          <LocaleLink href={href} className="relative shrink-0 self-start" aria-label={a.name}>
            <Avatar
              src={a.avatarUrl}
              name={a.name}
              size={72}
              priority={priority}
              className="!size-[52px] ring-2 ring-gray-200 ring-offset-2 ring-offset-white @min-[20rem]:!size-[60px] @min-[22rem]:!size-[72px] dark:ring-line dark:ring-offset-surface"
            />
            <span
              className={cn("absolute bottom-0.5 right-0 size-4 rounded-full border-[3px] border-white dark:border-surface", DOT[a.status])}
              role="img"
              aria-label={t(`status.${a.status}`)}
            />
          </LocaleLink>

          <div className="min-w-0 flex-1">
            {/* pr: room for the heart in the corner */}
            <LocaleLink href={href} className="block pr-7">
              <h3 className="flex items-start gap-1.5 text-[15px] font-bold leading-snug text-gray-900 @min-[20rem]:text-base @min-[22rem]:text-lg dark:text-fg">
                <span className="min-w-0 break-words">{a.name}</span>
                {a.isVerified && <BadgeCheck className="mt-[2px] size-[18px] shrink-0 fill-sky-500 text-white @min-[22rem]:size-5 dark:text-surface" aria-label="Verified" />}
              </h3>
            </LocaleLink>

            {/* ★ 3.0 (3) • 5 Yrs Exp   (no reviews yet: ★ New) */}
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-gray-500 @min-[22rem]:text-[15px] dark:text-muted">
              <Star className="size-4 fill-amber-500 text-amber-500" aria-hidden />
              {a.reviewCount > 0 ? (
                <span role="img" aria-label={`Rated ${a.rating.toFixed(1)} out of 5 from ${a.reviewCount} ${a.reviewCount === 1 ? "review" : "reviews"}`}>
                  {`${a.rating.toFixed(1)} (${formatCompact(a.reviewCount, SITE_LOCALE)})`}
                </span>
              ) : (
                <span>New</span>
              )}
              <span aria-hidden>•</span>
              <span className="whitespace-nowrap">{`${a.experienceYears} Yrs Exp`}</span>
            </p>

            {a?.promoted && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700 dark:bg-gold-700/30 dark:text-gold-300">
                <Crown className="size-3" aria-hidden /> Top astrologer
              </span>
            )}

            {/* Specialty pills on one row: the first two, then "+N". On the narrowest cards only the first one fits. */}
            {shownTags.length > 0 && (
              <ul className="mt-2.5 flex gap-1.5 text-[13px] text-gray-800 @min-[22rem]:gap-2 @min-[22rem]:text-sm dark:text-fg" aria-label="Specialties">
                {shownTags.map((s, i) => (
                  <li key={s} className={cn(pill, "min-w-0 truncate", i === 1 && "hidden @min-[20rem]:block")}>
                    {s}
                  </li>
                ))}
                {a.specialties.length > 1 && (
                  <li className={cn(pill, "shrink-0 @min-[20rem]:hidden")}>
                    <span aria-hidden>{`+${a.specialties.length - 1}`}</span>
                    <span className="sr-only">{`and ${a.specialties.slice(1).join(", ")}`}</span>
                  </li>
                )}
                {moreTags > 0 && (
                  <li className={cn(pill, "hidden shrink-0 @min-[20rem]:block")}>
                    <span aria-hidden>{`+${moreTags}`}</span>
                    <span className="sr-only">{`and ${a.specialties.slice(2).join(", ")}`}</span>
                  </li>
                )}
              </ul>
            )}

            <p className="mt-2 truncate text-sm text-gray-500 @min-[22rem]:text-[15px] dark:text-muted">{a.languages.join(", ")}</p>
          </div>
        </div>

        {/* No separate "free session" chip: a free mode's button says "Chat Free" */}
        <AvailabilityChips a={a} showFree={false} className="mt-3" />

        {/* Rate on the left, pill buttons on the right */}
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2.5 border-t border-gray-200 pt-4 @min-[22rem]:gap-3 dark:border-line">
            {rate != null && (
              <p className="shrink-0 whitespace-nowrap">
                <span className="text-lg font-bold text-gray-900 @min-[22rem]:text-2xl dark:text-fg">{formatCurrency(rate, SITE_LOCALE)}</span>
                <span className="text-sm font-medium text-gray-900 @min-[22rem]:text-lg dark:text-fg">/min</span>
              </p>
            )}
            <AstrologerActions astrologer={a} layout="compact" className="min-w-0 flex-1" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/** 768px and up (unchanged desktop card). */
function DesktopAstrologerCard({ astrologer: a, priority }) {
  const locale = SITE_LOCALE;
  const modes = astrologerModes(a);

  return (
    <Card as="article" interactive className="hidden h-full min-w-0 flex-col p-4 md:flex">
      <div className="flex gap-3.5">
        <LocaleLink href={routes.astrologer(a.slug)} className="shrink-0" aria-label={a.name}>
          <Avatar src={a.avatarUrl} name={a.name} size={64} priority={priority} className={cn("ring-2 ring-offset-2 ring-offset-surface", RING[a.status])} />
        </LocaleLink>

        <div className="@container min-w-0 flex-1">
          {/* Narrow cards (small phones, carousels, 4-column grids): the status badge drops under the name
              so the name gets the full width; it sits beside the name only when there is room. */}
          <div className="flex flex-col items-start gap-0.5 @min-[17rem]:flex-row @min-[17rem]:justify-between @min-[17rem]:gap-2">
            <LocaleLink href={routes.astrologer(a.slug)} className="min-w-0 max-w-full">
              <h3 className="flex items-start gap-1 font-semibold text-fg hover:text-accent">
                {/* Long names wrap to a second line instead of being cut to "Astro Bha…" */}
                <span className="line-clamp-2 break-words">{a.name}</span>
                {a.isVerified && <BadgeCheck className="mt-[0.2rem] size-4 shrink-0 text-brand-500" aria-label="Verified" />}
              </h3>
            </LocaleLink>
            <StatusBadge status={a.status} className="shrink-0" />
          </div>
          {/* Promoted from the dashboard (Marketing → Top astrologers) for a set time */}
          {a?.promoted && (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700 dark:bg-gold-700/30 dark:text-gold-300">
              <Crown className="size-3" aria-hidden /> Top astrologer
            </span>
          )}
          <p className="truncate text-sm text-muted">{a.specialties.join(" · ")}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted">
            <Languages className="size-3.5 shrink-0" aria-hidden /> {a.languages.join(", ")}
          </p>
          <p className="mt-1.5 flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-0.5 font-semibold text-fg">
              <Star className="size-3.5 fill-brand-400 text-brand-400" aria-hidden /> {a.rating.toFixed(1)}
            </span>
            <span>{`${a.experienceYears} yrs exp`}</span>
            <span className="flex items-center gap-0.5">
              <Users className="size-3.5" aria-hidden /> {formatCompact(a.totalSessions, locale)}
            </span>
          </p>
        </div>
      </div>

      {/* Price per mode */}
      <ul className="mt-4 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${modes.length}, minmax(0, 1fr))` }}>
        {modes.map((m) => (
          <li
            key={m.key}
            className={cn("rounded-xl border border-line bg-surface-muted/60 px-2 py-1.5 text-center", a.status === "online" && !m.available && "opacity-45")}
            title={a.status === "online" && !m.available ? "Not available right now" : undefined}
          >
            <span className="flex items-center justify-center gap-1 text-[11px] text-muted">
              <m.icon className="size-3" aria-hidden /> {m.label}
            </span>
            {m.free ? (
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
            ) : (
              <span className="text-sm font-semibold text-fg">
                {formatCurrency(m.price, locale)}
                <span className="text-[11px] font-normal text-muted">/min</span>
              </span>
            )}
          </li>
        ))}
      </ul>

      <AvailabilityChips a={a} className="mt-2.5" />

      <div className="mt-auto pt-4">
        <AstrologerActions astrologer={a} />
      </div>
    </Card>
  );
}

export function AstrologerCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-3.5">
        <div className="size-16 animate-pulse rounded-full bg-surface-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-4 h-12 animate-pulse rounded-xl bg-surface-muted" />
      <div className="mt-4 h-8 animate-pulse rounded-full bg-surface-muted" />
    </Card>
  );
}
