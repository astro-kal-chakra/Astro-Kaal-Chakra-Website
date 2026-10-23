"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { contentService } from "@/lib/api/services/content.service";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input, inputClasses } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

const MAX_REASON = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;
const EMPTY = { phone: "", email: "", reason: "", website: "" };

function validate(v) {
  const e = {};
  if (!PHONE_RE.test(v.phone.trim().replace(/\s/g, ""))) e.phone = "Enter your registered 10-digit mobile number.";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
  return e;
}

/** Account deletion request for astrologers who can't sign in to the app (support verifies ownership first). */
export function DeletionRequestForm() {
  const { toast } = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const inFlight = useRef(false);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`del-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const res = await contentService.submitAstrologerDeletionRequest({
        phone: values.phone.trim().replace(/\s/g, ""),
        email: values.email.trim(),
        ...(values.reason.trim() ? { reason: values.reason.trim() } : {}),
        website: values.website,
      });
      setRequestId(res?.requestId ?? "");
    } catch (err) {
      toast({ type: "error", message: err?.status === 429 ? "Too many requests. Please try again later." : "Something went wrong. Please try again." });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (requestId !== null) {
    return (
      <div className="flex flex-col items-center py-10 text-center" role="status">
        <span className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h3 className="mt-4 text-xl font-semibold">Request received</h3>
        <p className="mt-2 max-w-md text-muted">
          Your account deletion request has been received. Our support team will verify account ownership and process your request.
        </p>
        {requestId && <p className="mt-3 rounded-full bg-surface-muted px-3 py-1 tabular-nums text-sm">{`Reference: ${requestId}`}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Registered mobile number" htmlFor="del-phone" error={errors.phone} hint="The number you sign in to Kaal-Chakra-Astro with.">
          <Input
            id="del-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={values.phone}
            onChange={set("phone")}
            placeholder="98XXXXXXXX"
            aria-invalid={Boolean(errors.phone)}
            aria-required="true"
            maxLength={16}
          />
        </Field>
        <Field label="Contact email address" htmlFor="del-email" error={errors.email} hint="We'll contact you here to verify the request.">
          <Input
            id="del-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-required="true"
            maxLength={120}
          />
        </Field>
      </div>

      <Field label="Reason for deletion (optional)" htmlFor="del-reason" hint={`${values.reason.length}/${MAX_REASON}`}>
        <textarea
          id="del-reason"
          rows={4}
          value={values.reason}
          onChange={set("reason")}
          maxLength={MAX_REASON}
          placeholder="Tell us why you're leaving (optional)"
          className={cn(inputClasses, "h-auto resize-y py-2.5")}
        />
      </Field>

      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="del-website">Website</label>
        <input id="del-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
      </div>

      <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
        {!submitting && <Send className="size-4" aria-hidden />} Submit Request
      </Button>
    </form>
  );
}
