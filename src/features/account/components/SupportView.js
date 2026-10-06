"use client";

import { useState } from "react";
import { ChevronRight, CircleHelp, Inbox, Mail, Plus, X } from "lucide-react";
import { routes } from "@/config/routes";
import { contentService } from "@/lib/api/services/content.service";
import { sessionHistoryService } from "@/lib/api/services/session-history.service";
import { SUPPORT_CATEGORIES, supportService } from "@/lib/api/services/support.service";
import { useToast } from "@/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { useAccountResource } from "../hooks/useAccountResource";
import { formatShortDate } from "../lib/format";
import { AccountTextarea } from "./AccountControls";
import { AccountShell } from "./AccountShell";
import { AccountEmptyCard, AccountErrorState, AccountListSkeleton } from "./AccountStates";
import { AttachmentPicker } from "./SupportAttachments";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

export const TICKET_TONE = { open: "gold", in_progress: "warning", resolved: "success", closed: "neutral" };

function TicketForm({ onCreated, onCancel }) {
  const locale = SITE_LOCALE;
  const { toast } = useToast();
  const sessions = useAccountResource(() => sessionHistoryService.list({ pageSize: 50 }));
  const [form, setForm] = useState({ category: "", sessionId: "", subject: "", message: "" });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const errs = {};
    if (!form.category) errs.category = "Select a category";
    if (form.subject.trim().length < 5) errs.subject = "Enter a subject (at least 5 characters)";
    if (form.message.trim().length < 20) errs.message = "Describe the issue (at least 20 characters)";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const ticket = await supportService.createTicket({
        category: form.category,
        sessionId: form.sessionId || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
        attachments: files,
      });
      toast({ type: "success", title: `Ticket ${ticket.id} created. We'll reply soon.` });
      onCreated(ticket);
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
      setSaving(false);
    }
  };

  return (
    <Card as="form" onSubmit={submit} noValidate className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">New support ticket</h2>
        <button type="button" onClick={onCancel} className="rounded-full p-1 text-muted hover:bg-surface-muted" aria-label="Close">
          <X className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="tk-category" error={errors.category}>
          <Select id="tk-category" value={form.category} onChange={(e) => set({ category: e.target.value })}>
            <option value="">Select a category</option>
            {SUPPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`account.support.categories.${c}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={
            <>
              Related session <span className="font-normal text-muted">(optional)</span>
            </>
          }
          htmlFor="tk-session"
        >
          <Select id="tk-session" value={form.sessionId} onChange={(e) => set({ sessionId: e.target.value })} disabled={sessions.loading}>
            <option value="">Not related to a session</option>
            {sessions.data?.items.map((s) => (
              <option key={s.id} value={s.id}>
                {`${s.astrologer.name} · ${formatShortDate(s.startedAt, locale)}`}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Subject" htmlFor="tk-subject" error={errors.subject}>
        <Input
          id="tk-subject"
          value={form.subject}
          maxLength={120}
          placeholder="Briefly describe the issue"
          onChange={(e) => set({ subject: e.target.value })}
        />
      </Field>

      <Field label="Message" htmlFor="tk-message" error={errors.message}>
        <AccountTextarea
          id="tk-message"
          rows={5}
          maxLength={2000}
          value={form.message}
          placeholder="Tell us what happened. Include amounts, times or error messages if possible."
          onChange={(e) => set({ message: e.target.value })}
        />
      </Field>

      <Field label="Attachments">
        <AttachmentPicker files={files} onChange={setFiles} onError={(msg) => toast({ type: "warning", title: msg })} />
      </Field>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Submit ticket
        </Button>
      </div>
    </Card>
  );
}

function TicketList({ tickets }) {
  const locale = SITE_LOCALE;
  return (
    <Card as="ul" className="divide-y divide-line overflow-hidden">
      {tickets.map((tk) => (
        <li key={tk.id}>
          <LocaleLink href={routes.supportTicket(tk.id)} className="flex items-center gap-3 p-4 hover:bg-surface-muted">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted">{tk.id}</span>
                <Badge tone={TICKET_TONE[tk.status]}>{t(`account.support.status.${tk.status}`)}</Badge>
              </div>
              <p className="mt-1 truncate font-medium">{tk.subject}</p>
              <p className="text-xs text-muted">
                {t(`account.support.categories.${tk.category}`)} · {`Updated ${formatShortDate(tk.updatedAt, locale)}`}
                {tk.messageCount ? ` · ${`${tk.messageCount} messages`}` : ""}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
          </LocaleLink>
        </li>
      ))}
    </Card>
  );
}

export function SupportView() {
  const [formOpen, setFormOpen] = useState(false);
  const { data, status, reload, mutate } = useAccountResource(() => supportService.listTickets());
  const site = useAccountResource(() => contentService.getSiteConfig(), "site-config"); // support email from the dashboard

  const onCreated = (ticket) => {
    const { messages, ...summary } = ticket;
    mutate((list = []) => [{ ...summary, messageCount: messages.length }, ...list]);
    setFormOpen(false);
  };

  return (
    <AccountShell
      title="Help & support"
      subtitle="We usually reply within 24 hours."
      actions={
        !formOpen && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" aria-hidden /> Raise a ticket
          </Button>
        )
      }
    >
      <div className="space-y-6">
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-800 dark:text-gold-400">
            <CircleHelp className="size-5" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="font-semibold">Quick answers</p>
            <p className="text-sm text-muted">Most questions about recharges, refunds and sessions are answered in our FAQs.</p>
            {site.data?.support?.email && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Mail className="size-3.5" aria-hidden />
                {`Or email us at ${site.data.support.email}`}
              </p>
            )}
          </div>
          <ButtonLink href={routes.faqs} variant="outline" size="sm">
            Browse FAQs
          </ButtonLink>
        </Card>

        {formOpen && <TicketForm onCreated={onCreated} onCancel={() => setFormOpen(false)} />}

        <section aria-labelledby="tickets-title">
          <h2 id="tickets-title" className="mb-3 text-lg font-semibold">
            Your tickets
          </h2>
          {status === "loading" && <AccountListSkeleton rows={3} avatar={false} />}
          {status === "error" && <AccountErrorState onRetry={reload} />}
          {status === "success" && data.length === 0 && (
            <AccountEmptyCard
              icon={Inbox}
              title="No tickets yet"
              description="If something went wrong, raise a ticket and we'll help."
              action={
                !formOpen && (
                  <Button onClick={() => setFormOpen(true)}>
                    <Plus className="size-4" aria-hidden /> Raise a ticket
                  </Button>
                )
              }
            />
          )}
          {status === "success" && data.length > 0 && <TicketList tickets={data} />}
        </section>
      </div>
    </AccountShell>
  );
}
