"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { contentService } from "@/lib/api/services/content.service";
import { useToast } from "@/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, inputClasses } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { label as t } from "@/lib/labels";

export const CONTACT_TOPICS = ["consultation", "payment", "refund", "technical", "account", "feedback", "partnership", "other"];
const MAX_MESSAGE = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;

const EMPTY = { name: "", contact: "", topic: "", message: "" };

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "name";
  const c = v.contact.trim().replace(/\s/g, "");
  if (!EMAIL_RE.test(c) && !PHONE_RE.test(c)) e.contact = "contact";
  if (!v.topic) e.topic = "topic";
  if (v.message.trim().length < 20) e.message = "message";
  return e;
}

export function ContactForm({ defaultTopic = "" }) {
  const { toast } = useToast();
  const [values, setValues] = useState({ ...EMPTY, topic: CONTACT_TOPICS.includes(defaultTopic) ? defaultTopic : "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
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
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const res = await contentService.submitContact({
        name: values.name.trim(),
        contact: values.contact.trim(),
        topic: values.topic,
        message: values.message.trim(),
      });
      setResult({ id: res.ticketId, name: values.name.trim() });
    } catch {
      toast({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="flex flex-col items-center py-10 text-center" role="status">
        <span className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h3 className="mt-4 text-xl font-semibold">Message sent!</h3>
        <p className="mt-2 max-w-sm text-muted">{`Thanks, ${result.name}. Our team will reply within 24 hours.`}</p>
        <p className="mt-3 rounded-full bg-surface-muted px-3 py-1 font-mono text-sm">{`Reference: ${result.id}`}</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setValues(EMPTY);
            setResult(null);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const err = (k) => (errors[k] ? t(`content.contact.errors.${errors[k]}`) : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="contact-name" error={err("name")}>
          <Input
            id="contact-name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            placeholder="e.g. Priya Sharma"
            aria-invalid={Boolean(errors.name)}
            maxLength={80}
          />
        </Field>
        <Field label="Email or mobile number" htmlFor="contact-contact" error={err("contact")} hint="We'll only use this to reply to your message.">
          <Input
            id="contact-contact"
            autoComplete="email"
            value={values.contact}
            onChange={set("contact")}
            placeholder="you@example.com or 98XXXXXXXX"
            aria-invalid={Boolean(errors.contact)}
            maxLength={120}
          />
        </Field>
      </div>

      <Field label="Topic" htmlFor="contact-topic" error={err("topic")}>
        <Select id="contact-topic" value={values.topic} onChange={set("topic")} aria-invalid={Boolean(errors.topic)}>
          <option value="" disabled>
            Choose a topic
          </option>
          {CONTACT_TOPICS.map((k) => (
            <option key={k} value={k}>
              {t(`content.contact.topics.${k}`)}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Message"
        htmlFor="contact-message"
        error={err("message")}
        hint={`${values.message.length}/${MAX_MESSAGE}`}
      >
        <textarea
          id="contact-message"
          rows={6}
          value={values.message}
          onChange={set("message")}
          maxLength={MAX_MESSAGE}
          placeholder="Tell us what happened. Include a session ID if you have one."
          aria-invalid={Boolean(errors.message)}
          className={cn(inputClasses, "h-auto resize-y py-2.5")}
        />
      </Field>

      <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
        {!submitting && <Send className="size-4" aria-hidden />} Send message
      </Button>
    </form>
  );
}
