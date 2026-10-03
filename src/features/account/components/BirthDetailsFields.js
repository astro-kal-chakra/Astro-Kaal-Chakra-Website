"use client";

import { PlaceAutocomplete } from "@/features/auth/components/PlaceAutocomplete";
import { cn } from "@/lib/utils/cn";
import { Field, Input } from "@/components/ui/Input";
import { label as t } from "@/lib/labels";

export const GENDERS = ["male", "female", "other"];

/** Shape used by the birth-details form fields. */
export const toBirthForm = (src = {}) => ({
  name: src.name || "",
  gender: src.gender || "",
  dob: src.dob || "",
  tob: src.tob || "",
  unknownTime: Boolean(src.dob) && !src.tob,
  place: src.place || null,
});

/** Validate name + birth details; returns an errors object keyed by field. */
export function validateBirthForm(form, t) {
  const e = {};
  if (form.name.trim().length < 2) e.name = "Enter at least 2 characters";
  if (!form.gender) e.gender = "Select a gender";
  if (!form.dob) e.dob = "Enter the date of birth";
  if (!form.unknownTime && !form.tob) e.tob = "Enter the time of birth or tick \"don't know\"";
  if (!form.place) e.place = "Select a place from the list";
  return e;
}

/** Controlled gender / DOB / TOB / birthplace fields shared by profile and family profiles. */
export function BirthDetailsFields({ idPrefix, form, onChange, errors = {} }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Field label="Gender" error={errors.gender}>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Gender">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={form.gender === g}
              onClick={() => onChange({ gender: g })}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium transition-colors",
                form.gender === g
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-gold-500 dark:bg-brand-800 dark:text-brand-100"
                  : "border-line hover:bg-surface-muted"
              )}
            >
              {t(`account.profile.${g}`)}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date of birth" htmlFor={`${idPrefix}-dob`} error={errors.dob}>
          <Input id={`${idPrefix}-dob`} type="date" max={today} value={form.dob} onChange={(e) => onChange({ dob: e.target.value })} />
        </Field>
        <Field label="Time of birth" htmlFor={`${idPrefix}-tob`} error={errors.tob}>
          <Input
            id={`${idPrefix}-tob`}
            type="time"
            value={form.tob}
            disabled={form.unknownTime}
            onChange={(e) => onChange({ tob: e.target.value })}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.unknownTime}
          onChange={(e) => onChange({ unknownTime: e.target.checked, tob: "" })}
          className="size-4 accent-brand-600"
        />
        {"I don't know the birth time"}
      </label>

      <Field label="Place of birth" htmlFor={`${idPrefix}-pob`} error={errors.place}>
        <PlaceAutocomplete
          id={`${idPrefix}-pob`}
          value={form.place}
          onChange={(place) => onChange({ place })}
          placeholder="Start typing a city"
        />
      </Field>
    </>
  );
}
