"use client";

import { useState } from "react";
import { env } from "@/config/site";
import { routes } from "@/config/routes";
import { useCountdown } from "@/hooks/useCountdown";
import { authService, MOCK_OTP } from "@/lib/api/services/auth.service";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { useAuth } from "../context/AuthProvider";
import { OtpInput } from "./OtpInput";

const PHONE_RE = /^[6-9]\d{9}$/;

/**
 * Two-step phone + OTP login. Server enforces rate limits / attempts;
 * we mirror them in the UI with a resend timer and attempts counter.
 * @param {{ onSuccess?: (result: { user, isNewUser }) => void }} props
 */
export function LoginForm({ onSuccess }) {
  const { onLoggedIn } = useAuth();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [requestId, setRequestId] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resend = useCountdown(0);

  const errorMessage = (e) => {
    if (e?.status === 429) return "Too many requests. Please wait a moment and try again.";
    if (e?.code === "TOO_MANY_ATTEMPTS") return "Too many attempts. Please request a new OTP.";
    if (e?.code === "INVALID_OTP" || e?.status === 400) return "Incorrect OTP. Please try again.";
    return e?.message || "Please try again. If the problem continues, contact support.";
  };

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!PHONE_RE.test(phone)) return setError("Enter a valid 10-digit mobile number");
    setError("");
    setLoading(true);
    try {
      const res = await authService.sendOtp(phone);
      setRequestId(res.requestId);
      setAttemptsLeft(res.maxAttempts ?? 3);
      resend.start(res.resendAfter ?? 30);
      setOtp("");
      setStep("otp");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ phone, otp, requestId });
      onLoggedIn(res.user);
      onSuccess?.(res);
    } catch (err) {
      const left = err?.data?.attemptsLeft ?? attemptsLeft - 1;
      setAttemptsLeft(left);
      setError(left <= 0 ? "Too many attempts. Please request a new OTP." : errorMessage(err));
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  if (step === "phone") {
    return (
      <form onSubmit={sendOtp} className="space-y-4" noValidate>
        <Field label="Mobile number" htmlFor="phone" error={error}>
          <div className="flex">
            <span className="flex h-11 items-center rounded-l-xl border border-r-0 border-line bg-surface-muted px-3 text-sm font-medium">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="rounded-l-none"
              placeholder="98765 43210"
              autoFocus
            />
          </div>
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={phone.length !== 10}>
          Send OTP
        </Button>
        <p className="text-center text-xs text-muted">
          <LocaleLink href={routes.legal("terms")} className="underline">
            By continuing you agree to our Terms and Privacy Policy.
          </LocaleLink>
        </p>
      </form>
    );
  }

  const locked = attemptsLeft <= 0;

  return (
    <form onSubmit={verify} className="space-y-4">
      <p className="text-sm text-muted">
        {`Sent to +91 ${phone}`}{" "}
        <button type="button" className="font-semibold text-brand-600 dark:text-gold-400" onClick={() => setStep("phone")}>
          Change
        </button>
      </p>
      <OtpInput value={otp} onChange={setOtp} disabled={loading || locked} invalid={Boolean(error)} />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error} {!locked && attemptsLeft < 3 && <span className="text-muted">({`${attemptsLeft} attempts left`})</span>}
        </p>
      )}
      {env.useMocks && <p className="text-xs text-muted">Dev mode: use OTP {MOCK_OTP}</p>}
      <Button type="submit" size="lg" className="w-full" loading={loading} disabled={otp.length !== 6 || locked}>
        Verify &amp; Continue
      </Button>
      <div className="text-center text-sm">
        {resend.isDone ? (
          <button type="button" onClick={sendOtp} className="font-semibold text-brand-600 dark:text-gold-400" disabled={loading}>
            Resend OTP
          </button>
        ) : (
          <span key={resend.seconds} className="text-muted">{`Resend OTP in ${resend.seconds}s`}</span>
        )}
      </div>
    </form>
  );
}
