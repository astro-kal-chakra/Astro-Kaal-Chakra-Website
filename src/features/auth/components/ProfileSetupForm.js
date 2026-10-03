"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { authService } from "@/lib/api/services/auth.service";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useAuth } from "../context/AuthProvider";
import { PlaceAutocomplete } from "./PlaceAutocomplete";
import { label as t } from "@/lib/labels";

const GENDERS = ["male", "female", "other"];

export function ProfileSetupForm({ onDone }) {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    gender: user?.gender || "",
    dob: user?.dob || "",
    tob: user?.tob || "",
    unknownTime: false,
    place: user?.place || null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Full name";
    if (!form.gender) e.gender = "Gender";
    if (!form.dob) e.dob = "Date of birth";
    if (!form.unknownTime && !form.tob) e.tob = "Time of birth";
    if (!form.place) e.place = "Place of birth";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: form.name.trim(),
        gender: form.gender,
        dob: form.dob,
        tob: form.unknownTime ? null : form.tob,
        place: form.place,
      });
      setUser(updated);
      onDone?.(updated);
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Full name" htmlFor="name" error={errors.name && `${errors.name} *`}>
        <Input id="name" value={form.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />
      </Field>

      <Field label="Gender" error={errors.gender && `${errors.gender} *`}>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={form.gender === g}
              onClick={() => set({ gender: g })}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium",
                form.gender === g ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-800 dark:text-brand-100" : "border-line"
              )}
            >
              {t(`auth.${g}`)}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date of birth" htmlFor="dob" error={errors.dob && `${errors.dob} *`}>
          <Input id="dob" type="date" max={today} value={form.dob} onChange={(e) => set({ dob: e.target.value })} />
        </Field>
        <Field label="Time of birth" htmlFor="tob" error={errors.tob && `${errors.tob} *`}>
          <Input id="tob" type="time" value={form.tob} disabled={form.unknownTime} onChange={(e) => set({ tob: e.target.value })} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.unknownTime} onChange={(e) => set({ unknownTime: e.target.checked, tob: "" })} className="size-4 accent-brand-600" />
        {"I don't know my birth time"}
      </label>

      <Field label="Place of birth" htmlFor="pob" error={errors.place && `${errors.place} *`}>
        <PlaceAutocomplete id="pob" value={form.place} onChange={(place) => set({ place })} placeholder="Start typing a city" />
      </Field>

      <p className="flex gap-2 rounded-xl bg-surface-muted p-3 text-xs text-muted">
        <ShieldCheck className="size-4 shrink-0 text-brand-500" aria-hidden />
        {"Your birth details are stored securely and used only for your consultations, as per India's DPDP Act."}
      </p>

      <Button type="submit" size="lg" className="w-full" loading={saving}>
        Save &amp; Continue
      </Button>
    </form>
  );
}
