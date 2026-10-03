"use client";

import { useState } from "react";
import { Lock, Pencil, ShieldCheck } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { userService } from "@/lib/api/services/user.service";
import { maskPhone } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { formatBirthDate, formatBirthTime, isValidEmail } from "../lib/format";
import { AccountShell } from "./AccountShell";
import { BirthDetailsFields, toBirthForm, validateBirthForm } from "./BirthDetailsFields";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

function DetailRow({ label, value, muted }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:gap-4">
      <dt className="text-sm text-muted sm:w-40 sm:shrink-0">{label}</dt>
      <dd className={muted || !value ? "text-sm text-muted" : "font-medium"}>{value || "Not set"}</dd>
    </div>
  );
}

function ProfileDetails({ user, onEdit }) {
  const locale = SITE_LOCALE;
  const place = user.place ? [user.place.name, user.place.region].filter(Boolean).join(", ") : "";

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Personal details</h2>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="size-3.5" aria-hidden /> Edit
          </Button>
        </div>
        <dl className="divide-y divide-line">
          <DetailRow label="Full name" value={user.name} />
          <DetailRow label="Gender" value={user.gender && t(`account.profile.${user.gender}`)} />
          <DetailRow label="Email" value={user.email} />
        </dl>
      </Card>

      <Card className="p-5">
        <h2 className="mb-2 font-semibold">Birth details</h2>
        <dl className="divide-y divide-line">
          <DetailRow label="Date of birth" value={formatBirthDate(user.dob, locale)} />
          <DetailRow
            label="Time of birth"
            value={user.dob && !user.tob ? "Time unknown" : formatBirthTime(user.tob, locale)}
          />
          <DetailRow label="Place of birth" value={place} />
        </dl>
        <p className="mt-3 flex gap-2 rounded-xl bg-surface-muted p-3 text-xs text-muted">
          <ShieldCheck className="size-4 shrink-0 text-brand-500" aria-hidden />
          {"Birth details are stored securely and used only for your consultations and tools, as per India's DPDP Act."}
        </p>
      </Card>
    </div>
  );
}

function ProfileEditForm({ user, onDone, onCancel }) {
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({ ...toBirthForm(user), email: user.email || "" }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const errs = validateBirthForm(form, t);
    if (form.email && !isValidEmail(form.email.trim())) errs.email = "Enter a valid email address";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: form.name.trim(),
        gender: form.gender,
        dob: form.dob,
        tob: form.unknownTime ? null : form.tob,
        place: form.place,
        email: form.email.trim() || null,
      });
      setUser(updated);
      toast({ type: "success", title: "Profile updated" });
      onDone();
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="form" onSubmit={submit} noValidate className="space-y-4 p-5">
      <h2 className="font-semibold">Personal details</h2>
      <Field label="Full name" htmlFor="pf-name" error={errors.name}>
        <Input id="pf-name" value={form.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />
      </Field>

      <BirthDetailsFields idPrefix="pf" form={form} onChange={set} errors={errors} />

      <Field
        label={
          <>
            Email <span className="font-normal text-muted">(optional)</span>
          </>
        }
        htmlFor="pf-email"
        error={errors.email}
        hint="For invoices and important updates only."
      >
        <Input
          id="pf-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={form.email}
          placeholder="you@example.com"
          onChange={(e) => set({ email: e.target.value })}
        />
      </Field>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </div>
    </Card>
  );
}

export function ProfileView() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(() => !user?.profileComplete);

  if (!user) return null;

  return (
    <AccountShell title="My profile" subtitle="Keep your details up to date for accurate readings.">
      <div className="max-w-2xl space-y-4">
        <Card className="flex items-center gap-4 p-5">
          <Avatar name={user.name || "U"} size={64} />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name || "Not set"}</p>
            <p className="text-sm text-muted">+91 {maskPhone(user.phone)}</p>
          </div>
        </Card>

        {editing ? (
          <ProfileEditForm user={user} onDone={() => setEditing(false)} onCancel={() => setEditing(false)} />
        ) : (
          <ProfileDetails user={user} onEdit={() => setEditing(true)} />
        )}

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Contact</h2>
          <Field label="Mobile number" htmlFor="pf-phone" hint="Your number is used to log in and can't be changed here. It is never shown to astrologers.">
            <div className="relative">
              <Input id="pf-phone" value={`+91 ${maskPhone(user.phone)}`} readOnly disabled className="pr-10" />
              <Lock className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            </div>
          </Field>
        </Card>
      </div>
    </AccountShell>
  );
}
