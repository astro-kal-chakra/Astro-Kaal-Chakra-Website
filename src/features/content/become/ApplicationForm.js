"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileText, Pencil } from "lucide-react";
import { routes } from "@/config/routes";
import { LANGUAGES, SPECIALTIES } from "@/constants/astrologer";
import { contentService } from "@/lib/api/services/content.service";
import { useToast } from "@/providers/ToastProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select, inputClasses } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { ChoiceChips } from "./ChoiceChips";
import { DocumentUpload } from "./DocumentUpload";
import { label as t } from "@/lib/labels";

const STEPS = ["personal", "expertise", "availability", "documents", "review"];
const EXPERIENCE = ["2-5", "5-10", "10-20", "20+"];
const MODES = ["chat", "call", "video"]; // backend modes; "call" is a voice call
const MODE_LABEL = { chat: "modeChat", call: "modeCall", video: "modeVideo" };
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const SLOTS = ["morning", "afternoon", "evening", "night"];
const HOURS = ["1-2", "2-4", "4-6", "6+"];
const EXTRA_SPECIALTIES = ["Lal Kitab", "Nadi"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const INITIAL = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  city: "",
  specialties: [],
  languages: [],
  experience: "",
  modes: ["chat"],
  bio: "",
  days: [],
  slots: [],
  hoursPerDay: "2-4",
  idProof: null,
  certificate: null,
  consent: false,
};

/** Returns { field: errorKey } for the given step. */
function validateStep(step, v) {
  const e = {};
  if (step === "personal") {
    if (v.fullName.trim().length < 3) e.fullName = "fullName";
    if (!EMAIL_RE.test(v.email.trim())) e.email = "email";
    if (!PHONE_RE.test(v.phone)) e.phone = "phone";
    if (v.city.trim().length < 2) e.city = "city";
  }
  if (step === "expertise") {
    if (!v.specialties.length) e.specialties = "specialties";
    if (!v.languages.length) e.languages = "languages";
    if (!v.experience) e.experience = "experience";
    if (!v.modes.length) e.modes = "modes";
  }
  if (step === "availability") {
    if (!v.days.length) e.days = "days";
    if (!v.slots.length) e.slots = "slots";
  }
  if (step === "documents" && !v.idProof) e.idProof = "idProof";
  if (step === "review" && !v.consent) e.consent = "consent";
  return e;
}

export function ApplicationForm() {
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const inFlight = useRef(false);
  const headingRef = useRef(null);
  const docsRef = useRef([]);
  const step = STEPS[stepIndex];

  // Revoke document preview URLs when the form unmounts.
  useEffect(() => {
    docsRef.current = [values.idProof?.url, values.certificate?.url].filter(Boolean);
  }, [values.idProof, values.certificate]);
  useEffect(() => () => docsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const set = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };
  const onInput = (key) => (e) => set(key, e.target.value);
  const err = (k) => (errors[k] ? t(`content.become.form.errors.${errors[k]}`) : undefined);
  const f = (k) => t(`content.become.form.${k}`);

  const goTo = (i) => {
    setErrors({});
    setStepIndex(i);
    // Move focus to the step heading for keyboard / screen-reader users.
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.closest("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const next = () => {
    const found = validateStep(step, values);
    setErrors(found);
    if (Object.keys(found).length) return;
    goTo(stepIndex + 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (step !== "review") return next();
    if (inFlight.current) return;
    // Re-validate every step before submitting.
    for (let i = 0; i < STEPS.length; i++) {
      const found = validateStep(STEPS[i], values);
      if (Object.keys(found).length) {
        if (i !== stepIndex) goTo(i);
        setErrors(found);
        return;
      }
    }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const { idProof, certificate, consent, ...rest } = values;
      const res = await contentService.submitAstrologerApplication({
        ...rest,
        consent,
        documents: {
          idProof: idProof && { name: idProof.file.name, size: idProof.file.size, type: idProof.file.type },
          certificate: certificate && { name: certificate.file.name, size: certificate.file.size, type: certificate.file.type },
        },
      });
      setResult({ id: res.applicationId, name: values.fullName.trim().split(" ")[0] });
      window.scrollTo({ top: headingRef.current?.closest("section")?.offsetTop ?? 0, behavior: "smooth" });
    } catch {
      toast({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="flex flex-col items-center px-2 py-12 text-center" role="status">
        <span className="flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="size-10" aria-hidden />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold">{f("successTitle")}</h3>
        <p className="mt-2 max-w-md text-muted">{`Thank you, ${result.name}. Our onboarding team will review your application and contact you within 2–3 working days.`}</p>
        <div className="mt-6 rounded-2xl border border-dashed border-gold-500/60 bg-gold-100/50 px-6 py-4 dark:bg-gold-700/15">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{f("applicationId")}</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-brand-700 dark:text-gold-300">{result.id}</p>
        </div>
        <p className="mt-4 max-w-sm text-sm text-muted">{f("successNext")}</p>
        <ButtonLink href={routes.home} variant="outline" className="mt-6">
          {f("backHome")}
        </ButtonLink>
      </div>
    );
  }

  const specialtyOptions = [...SPECIALTIES, ...EXTRA_SPECIALTIES].map((s) => ({ value: s, label: s }));
  const languageOptions = LANGUAGES.map((l) => ({ value: l, label: l }));

  return (
    <form onSubmit={onSubmit} noValidate className="scroll-mt-24">
      {/* Progress */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted">
          {`Step ${stepIndex + 1} of ${STEPS.length}`}
        </p>
        <ol className="mt-3 grid grid-cols-5 gap-1.5" aria-label={f("title")}>
          {STEPS.map((s, i) => (
            <li key={s} className="min-w-0">
              <span
                className={cn("block h-1.5 rounded-full", i <= stepIndex ? "bg-brand-600 dark:bg-gold-400" : "bg-surface-muted")}
                aria-hidden
              />
              <span
                className={cn("mt-2 hidden truncate text-xs sm:block", i === stepIndex ? "font-semibold text-fg" : "text-muted")}
                aria-current={i === stepIndex ? "step" : undefined}
              >
                {t(`content.become.form.steps.${s}`)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <h3 ref={headingRef} tabIndex={-1} className="mb-5 text-xl font-semibold outline-none">
        {t(`content.become.form.steps.${step}`)}
      </h3>

      {step === "personal" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={f("fullName")} htmlFor="ba-name" error={err("fullName")} className="sm:col-span-2">
            <Input id="ba-name" autoComplete="name" value={values.fullName} onChange={onInput("fullName")} aria-invalid={Boolean(errors.fullName)} maxLength={80} />
          </Field>
          <Field label={f("email")} htmlFor="ba-email" error={err("email")}>
            <Input id="ba-email" type="email" autoComplete="email" value={values.email} onChange={onInput("email")} aria-invalid={Boolean(errors.email)} maxLength={120} />
          </Field>
          <Field label={f("phone")} htmlFor="ba-phone" error={err("phone")} hint={f("phoneHint")}>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-line bg-surface-muted px-3 text-sm text-muted">+91</span>
              <Input
                id="ba-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                aria-invalid={Boolean(errors.phone)}
                className="rounded-l-none"
              />
            </div>
          </Field>
          <Field label={f("gender")} htmlFor="ba-gender">
            <Select id="ba-gender" value={values.gender} onChange={onInput("gender")}>
              <option value="">{f("selectPlaceholder")}</option>
              <option value="male">{f("genderMale")}</option>
              <option value="female">{f("genderFemale")}</option>
              <option value="other">{f("genderOther")}</option>
            </Select>
          </Field>
          <Field label={f("city")} htmlFor="ba-city" error={err("city")}>
            <Input id="ba-city" autoComplete="address-level2" value={values.city} onChange={onInput("city")} aria-invalid={Boolean(errors.city)} maxLength={60} />
          </Field>
        </div>
      )}

      {step === "expertise" && (
        <div className="space-y-6">
          <ChoiceChips
            legend={f("specialties")}
            name="specialties"
            hint={f("specialtiesHint")}
            options={specialtyOptions}
            value={values.specialties}
            onChange={(v) => set("specialties", v)}
            error={err("specialties")}
          />
          <ChoiceChips legend={f("languages")} name="languages" options={languageOptions} value={values.languages} onChange={(v) => set("languages", v)} error={err("languages")} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={f("experience")} htmlFor="ba-exp" error={err("experience")}>
              <Select id="ba-exp" value={values.experience} onChange={onInput("experience")} aria-invalid={Boolean(errors.experience)}>
                <option value="">{f("selectPlaceholder")}</option>
                {EXPERIENCE.map((x) => (
                  <option key={x} value={x}>
                    {t(`content.become.form.experienceOptions.${x}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <ChoiceChips
              legend={f("modes")}
              name="modes"
              options={MODES.map((m) => ({ value: m, label: f(MODE_LABEL[m]) }))}
              value={values.modes}
              onChange={(v) => set("modes", v)}
              error={err("modes")}
            />
          </div>
          <Field label={f("bio")} htmlFor="ba-bio" hint={`${values.bio.length}/500`}>
            <textarea
              id="ba-bio"
              rows={4}
              maxLength={500}
              value={values.bio}
              onChange={onInput("bio")}
              placeholder={f("bioPlaceholder")}
              className={cn(inputClasses, "h-auto resize-y py-2.5")}
            />
          </Field>
        </div>
      )}

      {step === "availability" && (
        <div className="space-y-6">
          <ChoiceChips
            legend={f("days")}
            name="days"
            options={DAYS.map((d) => ({ value: d, label: t(`content.become.form.dayNames.${d}`) }))}
            value={values.days}
            onChange={(v) => set("days", v)}
            error={err("days")}
          />
          <ChoiceChips
            legend={f("slots")}
            name="slots"
            options={SLOTS.map((s) => ({ value: s, label: t(`content.become.form.slotNames.${s}`) }))}
            value={values.slots}
            onChange={(v) => set("slots", v)}
            error={err("slots")}
          />
          <Field label={f("hoursPerDay")} htmlFor="ba-hours" className="max-w-xs">
            <Select id="ba-hours" value={values.hoursPerDay} onChange={onInput("hoursPerDay")}>
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      {step === "documents" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <DocumentUpload
            label={f("idProof")}
            required
            value={values.idProof}
            onChange={(v) => {
              set("idProof", v);
              setFileErrors((fe) => ({ ...fe, idProof: undefined }));
            }}
            onError={(msg) => setFileErrors((fe) => ({ ...fe, idProof: msg }))}
            error={fileErrors.idProof || err("idProof")}
          />
          <DocumentUpload
            label={f("certificate")}
            value={values.certificate}
            onChange={(v) => {
              set("certificate", v);
              setFileErrors((fe) => ({ ...fe, certificate: undefined }));
            }}
            onError={(msg) => setFileErrors((fe) => ({ ...fe, certificate: msg }))}
            error={fileErrors.certificate}
          />
          <p className="text-xs text-muted sm:col-span-2">{f("kycNote")}</p>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <ReviewBlock title="Personal details" onEdit={() => goTo(0)} editLabel="Edit">
            <ReviewRow label={f("fullName")} value={values.fullName} />
            <ReviewRow label={f("email")} value={values.email} />
            <ReviewRow label={f("phone")} value={values.phone ? `+91 ${values.phone}` : ""} />
            <ReviewRow label={f("gender")} value={values.gender ? f(`gender${values.gender[0].toUpperCase()}${values.gender.slice(1)}`) : "—"} />
            <ReviewRow label={f("city")} value={values.city} />
          </ReviewBlock>
          <ReviewBlock title="Expertise" onEdit={() => goTo(1)} editLabel="Edit">
            <ReviewRow label={f("specialties")} value={values.specialties.join(", ")} />
            <ReviewRow label={f("languages")} value={values.languages.join(", ")} />
            <ReviewRow label={f("experience")} value={values.experience ? t(`content.become.form.experienceOptions.${values.experience}`) : ""} />
            <ReviewRow label={f("modes")} value={values.modes.map((m) => f(MODE_LABEL[m])).join(", ")} />
            {values.bio && <ReviewRow label={f("bio")} value={values.bio} />}
          </ReviewBlock>
          <ReviewBlock title="Availability" onEdit={() => goTo(2)} editLabel="Edit">
            <ReviewRow label={f("days")} value={values.days.map((d) => t(`content.become.form.dayNames.${d}`)).join(", ")} />
            <ReviewRow label={f("slots")} value={values.slots.map((s) => t(`content.become.form.slotNames.${s}`)).join(", ")} />
            <ReviewRow label={f("hoursPerDay")} value={values.hoursPerDay} />
          </ReviewBlock>
          <ReviewBlock title="Documents" onEdit={() => goTo(3)} editLabel="Edit">
            <ReviewRow label={f("idProof")} value={values.idProof && <DocPreview doc={values.idProof} />} />
            <ReviewRow label={f("certificate")} value={values.certificate && <DocPreview doc={values.certificate} />} />
          </ReviewBlock>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 text-sm">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-0.5 size-4 accent-brand-600"
              aria-invalid={Boolean(errors.consent)}
            />
            <span>{f("consent")}</span>
          </label>
          {errors.consent && (
            <p className="text-sm text-red-600" role="alert">
              {err("consent")}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
        {stepIndex > 0 ? (
          <Button variant="ghost" onClick={() => goTo(stepIndex - 1)} disabled={submitting}>
            <ArrowLeft className="size-4" aria-hidden /> Back
          </Button>
        ) : (
          <span />
        )}
        {step === "review" ? (
          <Button type="submit" variant="gold" size="lg" loading={submitting}>
            {!submitting && <Check className="size-4" aria-hidden />} {f("submit")}
          </Button>
        ) : (
          <Button type="submit" size="lg">
            Next <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </form>
  );
}

function ReviewBlock({ title, onEdit, editLabel, children }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-muted/50 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="font-semibold">{title}</h4>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-gold-400">
          <Pencil className="size-3.5" aria-hidden /> {editLabel}
        </button>
      </div>
      <dl className="space-y-1">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 text-sm sm:grid-cols-[180px_1fr]">
      <dt className="text-muted">{label}</dt>
      <dd className="break-words">{value || "—"}</dd>
    </div>
  );
}

function DocPreview({ doc }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {doc.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob preview
        <img src={doc.url} alt="" className="size-8 shrink-0 rounded-md object-cover" />
      ) : (
        <FileText className="size-5 shrink-0 text-red-600" aria-hidden />
      )}
      <span className="truncate">{doc.file.name}</span>
    </span>
  );
}
