"use client";

import { useState } from "react";
import { Bell, BellRing, CalendarClock, Eye, Play } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { liveService } from "@/lib/api/services/live.service";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "../utils";
import { LiveBadge } from "./LiveBadge";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

export function LiveSessionCard({ session: s }) {
  const locale = SITE_LOCALE;
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const [reminded, setReminded] = useState(false);
  const [busy, setBusy] = useState(false);
  const isLive = s.status === "live";
  const a = s.astrologer;

  const remind = () =>
    requireAuth(async () => {
      if (busy || reminded) return;
      setBusy(true);
      try {
        await liveService.remind(s.id);
        setReminded(true);
        toast({ type: "success", message: `We'll notify you when ${a?.name} goes live.` });
      } catch {
        toast({ type: "error", message: "Something went wrong. Please try again." });
      } finally {
        setBusy(false);
      }
    }, "live-remind");

  const stage = (
    <div className={cn("relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br", s.gradient)}>
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden />
      {isLive && <span className="absolute size-28 animate-ping rounded-full bg-gold-400/20 [animation-duration:2.4s]" aria-hidden />}
      <Avatar name={a?.name} src={a?.avatarUrl} size={88} className="relative" />
      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
        {isLive ? (
          <LiveBadge label="LIVE" />
        ) : (
          <Badge tone="gold">
            <CalendarClock className="size-3" aria-hidden /> Upcoming
          </Badge>
        )}
        {isLive && (
          <span className="inline-flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
            <Eye className="size-3.5" aria-hidden /> {formatCompact(s.viewers, locale)}
          </span>
        )}
      </div>
      {isLive && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
          <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-brand-700">
            <Play className="ml-1 size-6 fill-current" />
          </span>
        </span>
      )}
    </div>
  );

  return (
    <Card as="article" className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      {isLive ? (
        <LocaleLink href={routes.liveRoom(s.id)} tabIndex={-1} aria-hidden>
          {stage}
        </LocaleLink>
      ) : (
        stage
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug">
          {isLive ? (
            <LocaleLink href={routes.liveRoom(s.id)} className="hover:text-brand-600 dark:hover:text-gold-400">
              {s.title}
            </LocaleLink>
          ) : (
            s.title
          )}
        </h3>
        {a && (
          <LocaleLink href={routes.astrologer(a.slug)} className="mt-1 text-sm text-muted hover:underline">
            {a.name}
          </LocaleLink>
        )}
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{s.topic}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          {s.tags?.map((tag) => (
            <Badge key={tag} tone="brand">
              {t(`categories.${tag}`)}
            </Badge>
          ))}
          <span>{`Questions from ${formatCurrency(s.questionPrice, locale)}`}</span>
        </div>
        <p className="mt-3 text-xs font-medium text-muted" suppressHydrationWarning>
          {isLive
            ? `Started ${formatRelativeTime(s.startedAt, locale)}`
            : `Starts ${formatRelativeTime(s.startsAt, locale)}`}
        </p>
        <div className="mt-4">
          {isLive ? (
            <ButtonLink href={routes.liveRoom(s.id)} className="w-full" variant="primary">
              <Play className="size-4" aria-hidden /> Join live
            </ButtonLink>
          ) : (
            <Button variant={reminded ? "outline" : "gold"} className="w-full" onClick={remind} loading={busy} disabled={reminded} aria-pressed={reminded}>
              {!busy && (reminded ? <BellRing className="size-4" aria-hidden /> : <Bell className="size-4" aria-hidden />)}
              {reminded ? "Reminder set" : "Remind me"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
