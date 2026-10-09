"use client";

import { BadgeCheck, Gift, Languages, Star, Users } from "lucide-react";
import { routes } from "@/config/routes";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { SITE_LOCALE } from "@/config/locale";
import { astrologerModes } from "../lib/modes";
import { AstrologerActions } from "./AstrologerActions";
import { StatusBadge } from "./StatusBadge";

const RING = { online: "ring-online", busy: "ring-busy", offline: "ring-line" };

export function AstrologerCard({ astrologer: a, priority = false }) {
  const locale = SITE_LOCALE;
  const modes = astrologerModes(a);

  return (
    <Card as="article" interactive className="flex h-full min-w-0 flex-col p-4">
      <div className="flex gap-3.5">
        <LocaleLink href={routes.astrologer(a.slug)} className="shrink-0" aria-label={a.name}>
          <Avatar src={a.avatarUrl} name={a.name} size={64} priority={priority} className={cn("ring-2 ring-offset-2 ring-offset-surface", RING[a.status])} />
        </LocaleLink>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <LocaleLink href={routes.astrologer(a.slug)} className="min-w-0">
              <h3 className="flex items-center gap-1 font-semibold text-fg hover:text-accent">
                <span className="truncate">{a.name}</span>
                {a.isVerified && <BadgeCheck className="size-4 shrink-0 text-brand-500" aria-label="Verified" />}
              </h3>
            </LocaleLink>
            <StatusBadge status={a.status} className="shrink-0" />
          </div>
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
            <span className="text-sm font-semibold text-fg">
              {formatCurrency(m.price, locale)}
              <span className="text-[11px] font-normal text-muted">/min</span>
            </span>
          </li>
        ))}
      </ul>

      {((a.freeChatOnly && a.status !== "offline") || a.queueCount > 0) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-medium">
          {/* Free chat mode: free first chats for new users (paid sessions paused) */}
          {a.freeChatOnly && a.status !== "offline" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-brand-700 dark:bg-brand-950/50 dark:text-brand-200">
              <Gift className="size-3" aria-hidden /> Free chat · new users
            </span>
          )}
          {a.queueCount > 0 && (
            <span key={a.queueCount} className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {a.queueCount} waiting
            </span>
          )}
        </div>
      )}

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
