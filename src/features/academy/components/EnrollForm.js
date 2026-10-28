"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { academy } from "../progress";

/** Step 1 of training: a short enrolment form (name, phone, experience, goal). Unlocks the course. */
export function EnrollForm({ course }) {
  const [form, setForm] = useState({ name: "", phone: "", experience: "beginner", goal: "" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 2) err.name = "Please enter your full name";
    if (!/^[6-9]\d{9}$/.test(form.phone)) err.phone = "Enter a valid 10-digit mobile number";
    setErrors(err);
    if (!Object.keys(err).length) academy.enroll(course.slug, { ...form, name: form.name.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
          <GraduationCap className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl">Enroll to start training</h2>
          <p className="text-sm text-muted">Free · takes 30 seconds</p>
        </div>
      </div>
      <Field label="Full name" htmlFor="en-name" error={errors.name}>
        <Input id="en-name" value={form.name} onChange={set("name")} placeholder="e.g. Ananya Sharma" autoComplete="name" />
      </Field>
      <Field label="Mobile number" htmlFor="en-phone" error={errors.phone}>
        <Input
          id="en-phone"
          inputMode="numeric"
          maxLength={10}
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
          placeholder="98765 43210"
          autoComplete="tel-national"
        />
      </Field>
      <Field label="Your experience in astrology" htmlFor="en-exp">
        <Select id="en-exp" value={form.experience} onChange={set("experience")}>
          <option value="beginner">New to astrology</option>
          <option value="some">Some self-study</option>
          <option value="practising">Already practising</option>
        </Select>
      </Field>
      <Field label="What do you want to achieve? (optional)" htmlFor="en-goal">
        <Input id="en-goal" value={form.goal} onChange={set("goal")} placeholder="e.g. Read charts for family, start consulting" />
      </Field>
      <Button type="submit" size="lg" variant="gold" className="w-full">
        Enroll &amp; start learning
      </Button>
      <p className="text-center text-xs text-muted">You&apos;ll get access to video lessons, notes, study material and live classes.</p>
    </form>
  );
}
