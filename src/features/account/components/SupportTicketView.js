"use client";

import { useState } from "react";
import { Headset, SearchX, Send } from "lucide-react";
import { routes } from "@/config/routes";
import { supportService } from "@/lib/api/services/support.service";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAccountResource } from "../hooks/useAccountResource";
import { formatDateTime, formatShortDate } from "../lib/format";
import { AccountTextarea } from "./AccountControls";
import { AccountShell } from "./AccountShell";
import { AccountEmptyCard, AccountErrorState } from "./AccountStates";
import { AttachmentChip, AttachmentPicker } from "./SupportAttachments";
import { TICKET_TONE } from "./SupportView";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

function Thread({ ticket }) {
  const locale = SITE_LOCALE;
  return (
    <ol className="space-y-4" aria-label={ticket.subject}>
      {ticket.messages.map((m) => {
        const mine = m.from === "user";
        return (
          <li key={m.id} className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}>
            {!mine && (
              <span className="mt-5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Headset className="size-4" aria-hidden />
              </span>
            )}
            <div className={cn("max-w-[85%] sm:max-w-[75%]", mine && "text-right")}>
              <p className="mb-1 text-xs text-muted">
                <span className="font-semibold text-fg">{mine ? "You" : m.agentName || "Support team"}</span>
                {" · "}
                <time dateTime={m.at}>{formatDateTime(m.at, locale)}</time>
              </p>
              <div
                className={cn(
                  "inline-block rounded-2xl px-4 py-2.5 text-left text-sm",
                  mine ? "rounded-tr-sm bg-brand-600 text-white" : "rounded-tl-sm border border-line bg-surface"
                )}
              >
                <p className="whitespace-pre-line">{m.text}</p>
              </div>
              {m.attachments?.length > 0 && (
                <div className={cn("mt-1.5 flex flex-wrap gap-1.5", mine && "justify-end")}>
                  {m.attachments.map((a, i) => (
                    <AttachmentChip key={i} file={a} />
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ReplyBox({ ticket, onReplied }) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const updated = await supportService.reply(ticket.id, { message: message.trim(), attachments: files });
      onReplied(updated);
      setMessage("");
      setFiles([]);
      toast({ type: "success", title: "Reply sent" });
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setSending(false);
    }
  };

  if (ticket.status === "closed") {
    return (
      <Card className="flex flex-col items-start gap-3 p-4 text-sm sm:flex-row sm:items-center">
        <p className="flex-1 text-muted">This ticket is closed. Raise a new ticket if you still need help.</p>
        <ButtonLink href={routes.support} size="sm" variant="outline">
          Raise a ticket
        </ButtonLink>
      </Card>
    );
  }

  return (
    <Card as="form" onSubmit={send} className="space-y-3 p-4">
      {ticket.status === "resolved" && <p className="text-xs text-muted">Marked resolved. Replying will reopen this ticket.</p>}
      <label htmlFor="tk-reply" className="sr-only">
        Reply
      </label>
      <AccountTextarea
        id="tk-reply"
        rows={3}
        className="min-h-20"
        maxLength={2000}
        value={message}
        placeholder="Write a reply…"
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AttachmentPicker files={files} onChange={setFiles} onError={(msg) => toast({ type: "warning", title: msg })} compact />
        <Button type="submit" loading={sending} disabled={!message.trim()}>
          <Send className="size-4" aria-hidden /> Send
        </Button>
      </div>
    </Card>
  );
}

export function SupportTicketView({ id }) {
  const locale = SITE_LOCALE;
  const { data: ticket, status, reload, mutate } = useAccountResource(() => supportService.getTicket(id), id);
  const back = { href: routes.support, label: "All tickets" };

  if (status === "loading") {
    return (
      <AccountShell back={back}>
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-3/4 rounded-2xl" />
          <Skeleton className="ml-auto h-20 w-2/3 rounded-2xl" />
        </div>
      </AccountShell>
    );
  }
  if (status === "error") {
    return (
      <AccountShell back={back}>
        <AccountErrorState onRetry={reload} />
      </AccountShell>
    );
  }
  if (!ticket) {
    return (
      <AccountShell back={back}>
        <AccountEmptyCard
          icon={SearchX}
          title="Ticket not found"
          description="This ticket doesn't exist or isn't linked to your account."
          action={<ButtonLink href={routes.support}>All tickets</ButtonLink>}
        />
      </AccountShell>
    );
  }

  return (
    <AccountShell back={back} title={ticket.subject}>
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span className="font-mono text-xs">{ticket.id}</span>
        <Badge tone={TICKET_TONE[ticket.status]}>{t(`account.support.status.${ticket.status}`)}</Badge>
        <span>{t(`account.support.categories.${ticket.category}`)}</span>
        <span aria-hidden>·</span>
        <span>{`Opened ${formatShortDate(ticket.createdAt, locale)}`}</span>
        {ticket.sessionId && (
          <>
            <span aria-hidden>·</span>
            <LocaleLink href={routes.sessionSummary(ticket.sessionId)} className="font-medium text-brand-600 hover:underline dark:text-gold-400">
              {`Session #${ticket.sessionId}`}
            </LocaleLink>
          </>
        )}
      </div>

      <div className="space-y-6">
        <Thread ticket={ticket} />
        <ReplyBox ticket={ticket} onReplied={(updated) => mutate(updated)} />
      </div>
    </AccountShell>
  );
}
