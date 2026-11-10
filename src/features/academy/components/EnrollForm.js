"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Skeleton";
import { academy, useAcademy } from "../progress";
import { Stepper } from "./Stepper";

/** /academy/[slug]/enroll: the form, or straight on to the plans once this course is enrolled. */
export function EnrollStep({ course }) {
  const router = useRouter();
  const state = useAcademy();
  const enrolled = state?.enrolled[course.slug];

  useEffect(() => {
    if (enrolled) router.replace(routes.academyPlans(course.slug));
  }, [enrolled, router, course.slug]);

  if (!state || enrolled) return <Spinner className="mx-auto my-24 size-10" />;
  return (
    <div className="mx-auto max-w-lg">
      <Stepper current={0} />
      <div className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-[0_20px_50px_-30px_rgb(194_65_12/0.5)] motion-safe:animate-[banner-in_0.4s_ease-out] sm:p-8">
        <EnrollForm course={course} />
      </div>
    </div>
  );
}

/** Step 1 of training: a short enrolment form (name, phone, experience, goal). Leads on to the plans. */
function EnrollForm({ course }) {
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
          <h1 className="font-display text-2xl">Enroll to start training</h1>
          <p className="text-sm text-muted">{course.title}</p>
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
        Continue to plans
      </Button>
    </form>
  );
}
