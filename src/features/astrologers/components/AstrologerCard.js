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
 * Mobile (below 768px): the same card as the mobile app. Photo with a status dot, name + heart,
 * experience line, specialties, languages, rating (or "New Astrologer"), then the starting rate on the
 * left and one button per mode on the right. Sizes step down on very narrow cards (home carousel, 320px phones).
 */
function MobileAstrologerCard({ astrologer: a, priority }) {
  const modes = astrologerModes(a);
  const prices = modes.filter((m) => !m.free && m.price != null).map((m) => Number(m.price));
  const startingRate = prices.length ? Math.min(...prices) : null;
  const sessions = a.totalSessions || 0;
  const href = routes.astrologer(a.slug);

  return (
    // The card is the size container: everything inside adapts to the card's width, not the screen's
    <Card
      as="article"
      interactive
      className="@container h-full min-w-0 rounded-3xl border-brand-100/80 shadow-[0_6px_24px_-12px_rgb(194_65_12/0.18)] md:hidden dark:border-line"
    >
      <div className="flex h-full flex-col p-4 @min-[22rem]:p-5">
        <div className="flex gap-3.5 @min-[20rem]:gap-4">
          <LocaleLink href={href} className="relative shrink-0 self-start" aria-label={a.name}>
            <Avatar src={a.avatarUrl} name={a.name} size={80} priority={priority} className="!size-16 ring-0 @min-[20rem]:!size-20" />
            <span
              className={cn("absolute bottom-2 right-0 size-3.5 rounded-full border-2 border-surface", DOT[a.status])}
              role="img"
              aria-label={t(`status.${a.status}`)}
            />
          </LocaleLink>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1">
              <LocaleLink href={href} className="min-w-0 flex-1">
                <h3 className="flex items-start gap-1.5 text-base font-bold leading-snug text-fg @min-[20rem]:text-lg">
                  <span className="min-w-0 break-words">{a.name}</span>
                  {a.isVerified && <BadgeCheck className="mt-[3px] size-5 shrink-0 fill-brand-500 text-white dark:text-surface" aria-label="Verified" />}
                </h3>
              </LocaleLink>
              <FollowHeart astrologer={a} className="-mr-2 -mt-2" />
            </div>
            <p className="mt-0.5 text-sm font-medium text-brand-600 dark:text-brand-300">
              {`${a.experienceYears} Yrs Experience`}
              {a.isVerified && " • Verified"}
            </p>
            {a?.promoted && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700 dark:bg-gold-700/30 dark:text-gold-300">
                <Crown className="size-3" aria-hidden /> Top astrologer
              </span>
            )}
            <p className="mt-1 truncate text-sm text-fg">{a.specialties.join(", ")}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted">
              <Languages className="size-4 shrink-0" aria-hidden /> {a.languages.join(", ")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
              {a.reviewCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-gold-100 px-2 py-0.5 font-semibold text-fg dark:bg-gold-700/30">
                  <Star className="size-4 fill-gold-400 text-gold-400" aria-hidden />
                  <span aria-label={`Rated ${a.rating.toFixed(1)} out of 5`}>{Number(a.rating.toFixed(1))}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                  <Award className="size-4" aria-hidden /> New Astrologer
                </span>
              )}
              <span className="text-muted">{`(${formatCompact(sessions, SITE_LOCALE)} ${sessions === 1 ? "consultation" : "consultations"})`}</span>
            </div>
          </div>
        </div>

        {/* No separate "free session" chip here: a free mode's button says "Free" instead of its price */}
        <AvailabilityChips a={a} showFree={false} className="mt-3" />

        {/* Starting rate on the left, mode buttons on the right. Only on the narrowest cards (home carousel on
            320px phones) the rate sits on one line above the buttons, which would otherwise be too cramped. */}
        <div className="mt-auto pt-4">
          <div className="flex flex-col gap-2.5 border-t border-line pt-4 @min-[17rem]:flex-row @min-[17rem]:items-center @min-[20rem]:gap-3">
            {startingRate != null && (
              <div className="flex shrink-0 items-baseline justify-between gap-2 @min-[17rem]:block">
                <p className="text-xs text-muted @min-[22rem]:text-sm">Starting rate</p>
                <p className="whitespace-nowrap">
                  <span className="text-xl font-bold leading-tight text-fg @min-[22rem]:text-2xl">{formatCurrency(startingRate, SITE_LOCALE)}</span>
                  <span className="text-xs text-muted @min-[22rem]:text-sm"> /min</span>
                </p>
              </div>
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
