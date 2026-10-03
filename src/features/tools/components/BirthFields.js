"use client";

import { Field, Input, Select } from "@/components/ui/Input";
import { PlaceAutocomplete } from "@/features/auth/components/PlaceAutocomplete";
import { label as t } from "@/lib/labels";

/**
 * Controlled birth-detail inputs (name, gender, date, time, place). Used by Kundli and Matching.
 * @param {{ idPrefix: string, value: object, onChange: (patch: object) => void, errors?: object, maxDate?: string, withGender?: boolean }} props
 */
export function BirthFields({ idPrefix, value, onChange, errors = {}, maxDate, withGender = true }) {
  const id = (f) => `${idPrefix}-${f}`;
  const err = (f) => (errors[f] ? t(errors[f]) : undefined);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Name" htmlFor={id("name")} error={err("name")} className={withGender ? "" : "sm:col-span-2"}>
        <Input
          id={id("name")}
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Full name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name) || undefined}
        />
      </Field>
      {withGender && (
        <Field label="Gender" htmlFor={id("gender")}>
          <Select id={id("gender")} value={value.gender} onChange={(e) => onChange({ gender: e.target.value })}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </Field>
      )}
      <Field label="Date of birth" htmlFor={id("date")} error={err("date")}>
        <Input
          id={id("date")}
          type="date"
          value={value.date}
          max={maxDate}
          min="1900-01-01"
          onChange={(e) => onChange({ date: e.target.value })}
          required
          aria-invalid={Boolean(errors.date) || undefined}
        />
      </Field>
      <Field label="Time of birth" htmlFor={id("time")} error={err("time")}>
        <Input
          id={id("time")}
          type="time"
          value={value.time}
          onChange={(e) => onChange({ time: e.target.value })}
          required
          aria-invalid={Boolean(errors.time) || undefined}
        />
      </Field>
      <Field label="Place of birth" htmlFor={id("place")} error={err("place")} className="sm:col-span-2">
        <PlaceAutocomplete
          id={id("place")}
          value={value.place}
          onChange={(place) => onChange({ place })}
          placeholder="Start typing a city"
        />
      </Field>
    </div>
  );
}
