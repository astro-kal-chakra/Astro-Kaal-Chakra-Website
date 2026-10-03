"use client";

import { useState } from "react";
import { FileText, History, LifeBuoy, MessageCircle, MessagesSquare, Phone, RotateCcw, Video } from "lucide-react";
import { routes } from "@/config/routes";
import { sessionHistoryService } from "@/lib/api/services/session-history.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDuration } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAccountResource } from "../hooks/useAccountResource";
import { formatDateTime, formatTime } from "../lib/format";
import { AccountFilterChips } from "./AccountControls";
import { AccountShell } from "./AccountShell";
import { AccountEmptyCard, AccountErrorState, AccountListSkeleton } from "./AccountStates";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const TABS = ["all", "chat", "call"];
const STATUS_TONE = { completed: "success", missed: "warning", refunded: "brand" };

const typeKey = (s) => (s.type === "chat" ? "chat" : s.callMode === "voice" ? "voice" : "video");
const TYPE_ICON = { chat: MessageCircle, video: Video, voice: Phone };

function TranscriptModal({ session, onClose }) {
  const locale = SITE_LOCALE;
  const { data, status, reload } = useAccountResource(
    () => (session ? sessionHistoryService.getTranscript(session.id) : Promise.resolve([])),
    session?.id || ""
  );

  return (
    <Modal
      open={Boolean(session)}
      onClose={onClose}
      title={session ? `Chat with ${session.astrologer.name}` : ""}
      className="sm:max-w-lg"
    >
      {session && (
        <div>
          <p className="mb-3 text-xs text-muted">{formatDateTime(session.startedAt, locale)}</p>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl bg-surface-muted p-3" aria-live="polite">
            {status === "loading" &&
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className={cn("h-12 w-3/4 rounded-2xl", i % 2 && "ml-auto")} />
              ))}
            {status === "error" && (
              <div className="py-6 text-center text-sm">
                <p className="mb-3 text-muted">{"Couldn't load this"}</p>
                <Button size="sm" variant="outline" onClick={reload}>
                  Try again
                </Button>
              </div>
            )}
            {status === "success" && data.length === 0 && <p className="py-6 text-center text-sm text-muted">No messages in this session.</p>}
            {status === "success" &&
              data.map((m) =>
                m.from === "system" ? (
                  <p key={m.id} className="text-center text-xs text-muted">
                    {m.text} · {formatTime(m.at, locale)}
                  </p>
                ) : (
                  <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                        m.from === "user" ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-surface text-fg shadow-sm"
                      )}
                    >
                      <p className="mb-0.5 text-[11px] font-semibold opacity-80">
                        {m.from === "user" ? "You" : session.astrologer.name}
                      </p>
                      <p className="whitespace-pre-line">{m.text}</p>
                      <p className="mt-1 text-right text-[10px] opacity-70">{formatTime(m.at, locale)}</p>
                    </div>
                  </div>
                )
              )}
          </div>
          <p className="mt-3 text-xs text-muted">Transcripts are private to you. They may be reviewed for safety if a complaint is raised.</p>
        </div>
      )}
    </Modal>
  );
}

function SessionRow({ session: s, onTranscript }) {
  const locale = SITE_LOCALE;
  const kind = typeKey(s);
  const Icon = TYPE_ICON[kind];
  const rebookMode = s.type === "chat" ? "chat" : "video";

  return (
    <Card as="li" className="p-4">
      <div className="flex gap-3">
        <LocaleLink href={routes.astrologer(s.astrologer.slug)} className="shrink-0">
          <Avatar src={s.astrologer.avatarUrl} name={s.astrologer.name} size={48} />
        </LocaleLink>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <LocaleLink href={routes.astrologer(s.astrologer.slug)} className="min-w-0 truncate font-semibold hover:text-brand-600 dark:hover:text-gold-400">
              {s.astrologer.name}
            </LocaleLink>
            <Badge tone={STATUS_TONE[s.status]}>{t(`account.sessions.status.${s.status}`)}</Badge>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon className="size-3.5" aria-hidden /> {t(`account.sessions.type.${kind}`)}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={s.startedAt}>{formatDateTime(s.startedAt, locale)}</time>
          </p>
          <dl className="mt-2 flex gap-6 text-sm">
            <div>
              <dt className="text-xs text-muted">Duration</dt>
              <dd className="font-medium tabular-nums">{formatDuration(s.durationSec)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Amount</dt>
              <dd className={cn("font-medium tabular-nums", s.status === "refunded" && "line-through opacity-70")}>
                {s.isFree ? "Free" : formatCurrency(s.amount, locale)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
        <ButtonLink href={`${routes.consult}?astrologer=${s.astrologer.slug}&mode=${rebookMode}`} size="sm" variant="primary">
          <RotateCcw className="size-3.5" aria-hidden /> Rebook
        </ButtonLink>
        {s.hasTranscript && (
          <Button size="sm" variant="outline" onClick={() => onTranscript(s)}>
            <MessagesSquare className="size-3.5" aria-hidden /> Transcript
          </Button>
        )}
        {s.hasSummary && (
          <ButtonLink href={routes.sessionSummary(s.id)} size="sm" variant="ghost">
            <FileText className="size-3.5" aria-hidden /> Summary
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

export function SessionHistoryView() {
  const [tab, setTab] = useState("all");
  const [transcriptFor, setTranscriptFor] = useState(null);
  const { data, status, reload } = useAccountResource(() => sessionHistoryService.list({ type: tab }), tab);

  return (
    <AccountShell title="Session history" subtitle="All your consultations in one place.">
      <AccountFilterChips
        className="mb-4"
        label="Session history"
        value={tab}
        onChange={setTab}
        options={TABS.map((v) => ({ value: v, label: t(`account.sessions.tabs.${v}`) }))}
      />

      {status === "loading" && <AccountListSkeleton rows={4} />}
      {status === "error" && <AccountErrorState onRetry={reload} />}
      {status === "success" && data.items.length === 0 && (
        <AccountEmptyCard
          icon={History}
          title="No sessions yet"
          description="Your chats and calls with astrologers will appear here."
          action={<ButtonLink href={routes.astrologers}>Find an astrologer</ButtonLink>}
        />
      )}
      {status === "success" && data.items.length > 0 && (
        <>
          <p className="mb-2 text-sm text-muted" aria-live="polite">
            {`${data.total} sessions`}
          </p>
          <ul className="space-y-3">
            {data.items.map((s) => (
              <SessionRow key={s.id} session={s} onTranscript={setTranscriptFor} />
            ))}
          </ul>
        </>
      )}

      <Card className="mt-6 flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center">
        <LifeBuoy className="size-5 text-brand-500" aria-hidden />
        <p className="flex-1 text-sm">Problem with a session?</p>
        <ButtonLink href={routes.support} size="sm" variant="outline">
          Get help
        </ButtonLink>
      </Card>

      <TranscriptModal session={transcriptFor} onClose={() => setTranscriptFor(null)} />
    </AccountShell>
  );
}
