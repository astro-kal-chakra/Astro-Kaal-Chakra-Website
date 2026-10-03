"use client";

import { useState } from "react";
import { HeartHandshake, MapPin, Pencil, Plus, ScrollText, ShieldCheck, Trash2, Users } from "lucide-react";
import { routes } from "@/config/routes";
import { userService } from "@/lib/api/services/user.service";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAccountResource } from "../hooks/useAccountResource";
import { formatBirthDate, formatBirthTime } from "../lib/format";
import { AccountConfirmModal } from "./AccountControls";
import { AccountShell } from "./AccountShell";
import { AccountEmptyCard, AccountErrorState, AccountListSkeleton } from "./AccountStates";
import { BirthDetailsFields, toBirthForm, validateBirthForm } from "./BirthDetailsFields";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

export const RELATIONS = ["self", "spouse", "child", "parent", "sibling", "friend", "other"];

function BirthProfileForm({ profile, onSaved, onCancel }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({ ...toBirthForm(profile || {}), relation: profile?.relation || "" }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const errs = validateBirthForm(form, t);
    if (!form.relation) errs.relation = "This field is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const saved = await userService.saveBirthProfile({
        ...(profile?.id ? { id: profile.id, createdAt: profile.createdAt } : {}),
        name: form.name.trim(),
        relation: form.relation,
        gender: form.gender,
        dob: form.dob,
        tob: form.unknownTime ? null : form.tob,
        place: form.place,
      });
      toast({ type: "success", title: "Profile saved" });
      onSaved(saved);
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Full name" htmlFor="bp-name" error={errors.name}>
        <Input id="bp-name" value={form.name} onChange={(e) => set({ name: e.target.value })} autoComplete="off" />
      </Field>
      <Field label="Relation" htmlFor="bp-relation" error={errors.relation}>
        <Select id="bp-relation" value={form.relation} onChange={(e) => set({ relation: e.target.value })}>
          <option value="">Select relation</option>
          {RELATIONS.map((r) => (
            <option key={r} value={r}>
              {t(`account.birthProfiles.relations.${r}`)}
            </option>
          ))}
        </Select>
      </Field>
      <BirthDetailsFields idPrefix="bp" form={form} onChange={set} errors={errors} />
      <p className="flex gap-2 rounded-xl bg-surface-muted p-3 text-xs text-muted">
        <ShieldCheck className="size-4 shrink-0 text-brand-500" aria-hidden />
        Birth details of others should be added only with their consent.
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function BirthProfileCard({ profile: p, onEdit, onDelete }) {
  const locale = SITE_LOCALE;
  return (
    <Card as="article" className="flex flex-col p-4">
      <div className="flex items-start gap-3">
        <Avatar name={p.name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{p.name}</h3>
            <Badge tone="brand">{t(`account.birthProfiles.relations.${p.relation}`)}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {`Born ${formatBirthDate(p.dob, locale)}`}
            {" · "}
            {p.tob ? formatBirthTime(p.tob, locale) : "Time unknown"}
          </p>
          {p.place && (
            <p className="flex items-center gap-1 truncate text-sm text-muted">
              <MapPin className="size-3.5 shrink-0" aria-hidden /> {p.place.name}
              {p.place.region ? `, ${p.place.region}` : ""}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-fg"
            aria-label={`${"Edit"} ${p.name}`}
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            aria-label={`${"Delete"} ${p.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <ButtonLink href={`${routes.kundli}?profile=${p.id}`} size="sm" variant="outline" className="flex-1">
          <ScrollText className="size-4" aria-hidden /> Kundli
        </ButtonLink>
        <ButtonLink href={`${routes.kundliMatching}?profile=${p.id}`} size="sm" variant="outline" className="flex-1">
          <HeartHandshake className="size-4" aria-hidden /> Match
        </ButtonLink>
      </div>
    </Card>
  );
}

export function BirthProfilesView() {
  const { toast } = useToast();
  const { data, status, reload, mutate } = useAccountResource(() => userService.listBirthProfiles());
  const [editing, setEditing] = useState(null); // null | "new" | profile
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const onSaved = (saved) => {
    mutate((list = []) => (list.some((p) => p.id === saved.id) ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list]));
    setEditing(null);
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await userService.deleteBirthProfile(deleting.id);
      mutate((list = []) => list.filter((p) => p.id !== deleting.id));
      toast({ type: "success", title: "Profile deleted" });
      setDeleting(null);
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setDeleteBusy(false);
    }
  };

  const addButton = (
    <Button onClick={() => setEditing("new")}>
      <Plus className="size-4" aria-hidden /> Add profile
    </Button>
  );

  return (
    <AccountShell
      title="Saved birth profiles"
      subtitle="Save family and friends once, then use them for kundli and matching in one tap."
      actions={status === "success" && data.length > 0 ? addButton : null}
    >
      {status === "loading" && <AccountListSkeleton rows={3} />}
      {status === "error" && <AccountErrorState onRetry={reload} />}
      {status === "success" && data.length === 0 && (
        <AccountEmptyCard icon={Users} title="No saved profiles yet" description="Add family members to generate their kundli or check compatibility quickly." action={addButton} />
      )}
      {status === "success" && data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.map((p) => (
            <BirthProfileCard key={p.id} profile={p} onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add birth profile" : "Edit birth profile"}
        className="sm:max-w-lg"
      >
        {editing && (
          <div className="max-h-[75vh] overflow-y-auto px-0.5">
            <BirthProfileForm
              key={editing === "new" ? "new" : editing.id}
              profile={editing === "new" ? null : editing}
              onSaved={onSaved}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}
      </Modal>

      <AccountConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteBusy}
        title="Delete profile?"
        description={deleting ? `${deleting.name}'s birth details will be permanently removed. Saved kundlis are not affected.` : ""}
        confirmLabel="Delete"
      />
    </AccountShell>
  );
}
