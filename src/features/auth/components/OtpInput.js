"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

/** 6-box OTP input with paste support and SMS autofill (autocomplete="one-time-code"). */
export function OtpInput({ value, onChange, length = 6, disabled, invalid }) {
  const refs = useRef([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setAt = (i, d) => {
    const next = digits.map((c, idx) => (idx === i ? d : c)).join("").replace(/\s+$/, "");
    onChange(next.replace(/\s/g, ""));
  };

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, "");
    if (!v) return;
    if (v.length > 1) {
      // paste or autofill
      onChange(v.slice(0, length));
      refs.current[Math.min(v.length, length) - 1]?.focus();
      return;
    }
    setAt(i, v);
    refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i].trim()) setAt(i, " ");
      else if (i > 0) {
        setAt(i - 1, " ");
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="One-time password">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d.trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? length : 1}
          disabled={disabled}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            "size-12 rounded-xl border bg-surface text-center text-xl font-semibold focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
            invalid ? "border-red-500" : "border-line"
          )}
        />
      ))}
    </div>
  );
}
