"use client";

import { useState } from "react";
import { HeartHandshake, MapPin, ScrollText, Trash2 } from "lucide-react";
import { routes } from "@/config/routes";
import { userService } from "@/lib/api/services/user.service";
import { useToast } from "@/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { useAccountResource } from "../hooks/useAccountResource";
import { formatBirthDate, formatBirthTime, formatShortDate } from "../lib/format";
import { AccountConfirmModal } from "./AccountControls";
import { AccountShell } from "./AccountShell";
import { AccountEmptyCard, AccountErrorState, AccountListSkeleton } from "./AccountStates";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const openHref = (k) => `${k.type === "matching" ? routes.kundliMatching : routes.kundli}?profile=${k.id}`;

export function SavedKundlisView() {
  const locale = SITE_LOCALE;
  const { toast } = useToast();
  const { data, status, reload, mutate } = useAccountResource(() => userService.listSavedKundlis());
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await userService.deleteSavedKundli(deleting.id);
      mutate((list = []) => list.filter((k) => k.id !== deleting.id));
      toast({ type: "success", title: "Kundli deleted" });
      setDeleting(null);
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const createActions = (
    <div className="flex flex-wrap justify-center gap-2">
      <ButtonLink href={routes.kundli} size="sm">
        <ScrollText className="size-4" aria-hidden /> Free kundli
      </ButtonLink>
      <ButtonLink href={routes.kundliMatching} size="sm" variant="outline">
        <HeartHandshake className="size-4" aria-hidden /> Kundli matching
      </ButtonLink>
    </div>
  );

  return (
    <AccountShell
      title="Saved kundlis"
      subtitle="Birth charts and match reports you've generated."
      actions={status === "success" && data.length > 0 ? createActions : null}
    >
      {status === "loading" && <AccountListSkeleton rows={3} />}
      {status === "error" && <AccountErrorState onRetry={reload} />}
      {status === "success" && data.length === 0 && (
        <AccountEmptyCard icon={ScrollText} title="No saved kundlis" description="Generate a free kundli or matching report and save it to see it here." action={createActions} />
      )}
      {status === "success" && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((k) => {
            const Icon = k.type === "matching" ? HeartHandshake : ScrollText;
            return (
              <Card as="li" key={k.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-800 dark:text-gold-400">
                  <Icon className="size-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <LocaleLink href={openHref(k)} className="truncate font-semibold hover:text-brand-600 dark:hover:text-gold-400">
                      {k.name}
                    </LocaleLink>
                    <Badge tone={k.type === "matching" ? "gold" : "brand"}>{t(`account.kundlis.type.${k.type}`)}</Badge>
                    {k.type === "matching" && k.score != null && <Badge tone="success">{`${k.score}/36 gunas`}</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatBirthDate(k.dob, locale)} · {k.tob ? formatBirthTime(k.tob, locale) : "Time unknown"}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" aria-hidden /> {k.place}
                    </span>
                    <span>{`Saved ${formatShortDate(k.createdAt, locale)}`}</span>
                  </p>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <ButtonLink href={openHref(k)} size="sm" variant="outline" className="flex-1 sm:flex-none">
                    Open
                  </ButtonLink>
                  <button
                    onClick={() => setDeleting(k)}
                    className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    aria-label={`${"Delete"} ${k.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </ul>
      )}

      <p className="mt-6 text-sm text-muted">
        Looking for purchased reports?{" "}
        <LocaleLink href={routes.myReports} className="font-semibold text-brand-600 hover:underline dark:text-gold-400">
          My reports →
        </LocaleLink>
      </p>

      <AccountConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete saved kundli?"
        description={deleting ? `"${deleting.name}" will be removed from your saved list.` : ""}
        confirmLabel="Delete"
      />
    </AccountShell>
  );
}
