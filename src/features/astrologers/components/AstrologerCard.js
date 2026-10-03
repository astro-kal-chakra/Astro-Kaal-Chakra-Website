"use client";

import { BadgeCheck, Languages, Star, Users } from "lucide-react";
import { routes } from "@/config/routes";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { AstrologerActions } from "./AstrologerActions";
import { StatusBadge } from "./StatusBadge";
import { SITE_LOCALE } from "@/config/locale";

export function AstrologerCard({ astrologer: a, priority = false }) {
  const locale = SITE_LOCALE;

  return (
    <Card as="article" className="flex min-w-0 flex-col p-4 transition-shadow hover:shadow-md">
      <div className="flex gap-3">
        <LocaleLink href={routes.astrologer(a.slug)} className="relative">
          <Avatar src={a.avatarUrl} name={a.name} size={68} priority={priority} />
          {a.status === "online" && (
            <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full border-2 border-surface bg-online" aria-hidden />
          )}
        </LocaleLink>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <LocaleLink href={routes.astrologer(a.slug)} className="min-w-0">
              <h3 className="flex items-center gap-1 truncate font-semibold hover:text-brand-600 dark:hover:text-gold-400">
                <span className="truncate">{a.name}</span>
                {a.isVerified && <BadgeCheck className="size-4 shrink-0 text-brand-500" aria-label="Verified" />}
              </h3>
            </LocaleLink>
            <StatusBadge status={a.status} className="shrink-0" />
          </div>
          <p className="truncate text-sm text-muted">{a.specialties.join(", ")}</p>
          <p className="flex items-center gap-1 truncate text-sm text-muted">
            <Languages className="size-3.5 shrink-0" aria-hidden /> {a.languages.join(", ")}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-0.5 font-semibold text-fg">
              <Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden /> {a.rating.toFixed(1)}
            </span>
            <span>{`${a.experienceYears} yrs`}</span>
            <span className="flex items-center gap-0.5">
              <Users className="size-3.5" aria-hidden /> {formatCompact(a.totalSessions, locale)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span>
            <span className="font-bold">{formatCurrency(a.chatPrice, locale)}</span>
            <span className="text-muted">/min</span>
          </span>
          {a.supportsVideo && (
            <span className="text-xs text-muted">
              Video Call {formatCurrency(a.videoPrice, locale)}
              /min
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {a.freeChatEligible && <Badge tone="gold">FREE</Badge>}
          {a.queueCount > 0 && <Badge key={a.queueCount} tone="warning">{`${a.queueCount} in queue`}</Badge>}
        </div>
      </div>

      <div className="mt-3">
        <AstrologerActions astrologer={a} />
      </div>
    </Card>
  );
}

export function AstrologerCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="size-[68px] animate-pulse rounded-full bg-surface-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-4 h-8 animate-pulse rounded-full bg-surface-muted" />
    </Card>
  );
}
