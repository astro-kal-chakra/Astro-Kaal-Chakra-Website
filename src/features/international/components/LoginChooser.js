"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/api/services/auth.service";
import { renderGoogleButton } from "@/lib/google/identity";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useCurrency } from "./CurrencyProvider";

/**
 * Google's own "Continue with Google" button (Google Identity Services). After the person picks their account,
 * the backend signs them in (a new account gets a dollar wallet) and the result goes on like the phone form's.
 */
function GoogleLogin({ clientId, onSuccess }) {
  const { onLoggedIn } = useAuth();
  const box = useRef(null);
  const [state, setState] = useState("loading"); // loading | ready | signing | failed
  const [error, setError] = useState("");
  const done = useRef(onSuccess);
  useEffect(() => {
    done.current = onSuccess;
  });

  useEffect(() => {
    let live = true;
    const onToken = async (idToken) => {
      setError("");
      setState("signing");
      try {
        const res = await authService.googleLogin({ idToken });
        onLoggedIn(res.user);
        done.current?.(res);
      } catch (err) {
        if (!live) return;
        setError(err?.message || "Couldn't sign in with Google. Please try again.");
        setState("ready");
      }
    };
    if (!clientId) return;
    renderGoogleButton(box.current, clientId, onToken, { width: box.current?.offsetWidth })
      .then(() => live && setState("ready"))
      .catch((e) => {
        if (!live) return;
        setState("failed");
        setError(e?.message || "Couldn't load Google sign-in. Please try again.");
      });
    return () => {
      live = false;
    };
  }, [clientId, onLoggedIn]);

  return (
    <div className="space-y-3">
      <div className="relative min-h-11">
        {/* Google draws its button here */}
        <div ref={box} className={`flex w-full justify-center ${state === "signing" ? "pointer-events-none opacity-40" : ""}`} />
        {clientId && (state === "loading" || state === "signing") && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted" aria-live="polite">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {state === "signing" ? "Signing you in..." : ""}
          </div>
        )}
      </div>
      {(error || !clientId) && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error || "Google sign-in isn't set up yet. Please use your mobile number or contact support."}
        </p>
      )}
    </div>
  );
}

/**
 * The login form for this visitor:
 *  - in India (and whenever international users are switched off): mobile number + OTP, exactly as before
 *  - outside India: "Continue with Google", with "Use mobile number instead" for Indian numbers
 * `heading`: also shows the page title (login page; the modal has its own title).
 */
export function LoginChooser({ onSuccess, heading = false }) {
  const { international, ready, settings } = useCurrency();
  const [phoneInstead, setPhoneInstead] = useState(false);

  // International users on, country not known yet: a moment's wait instead of the wrong form
  if (settings?.enabled && !ready) {
    return <div className="h-40 animate-pulse rounded-2xl bg-current/5" aria-busy="true" aria-label="Loading" />;
  }

  if (!international || phoneInstead) {
    return (
      <>
        {heading && (
          <>
            <h1 className="font-display text-2xl font-semibold">Login with your phone</h1>
            <p className="mb-6 mt-1 text-sm text-muted">{"We'll send a 6-digit OTP. No password needed."}</p>
          </>
        )}
        <LoginForm onSuccess={onSuccess} />
        {international && (
          <button type="button" onClick={() => setPhoneInstead(false)} className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline">
            Continue with Google instead
          </button>
        )}
      </>
    );
  }

  return (
    <>
      {heading && (
        <>
          <h1 className="font-display text-2xl font-semibold">Welcome</h1>
          <p className="mb-6 mt-1 text-sm text-muted">Sign in with your Google account. No password or phone number needed.</p>
        </>
      )}
      <GoogleLogin clientId={settings?.googleClientId} onSuccess={onSuccess} />
      <p className="mt-4 text-xs text-muted">Prices are shown in US dollars for customers outside India.</p>
      <button type="button" onClick={() => setPhoneInstead(true)} className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline">
        Have an Indian mobile number? Use mobile number instead
      </button>
    </>
  );
}
