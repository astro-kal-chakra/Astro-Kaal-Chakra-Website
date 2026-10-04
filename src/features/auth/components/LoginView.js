"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MonitorSmartphone } from "lucide-react";
import { routes } from "@/config/routes";
import { SIGNED_IN_ELSEWHERE } from "@/lib/socket/events";
import { Card } from "@/components/ui/Card";
import { SIGNED_IN_ELSEWHERE_MESSAGE } from "../context/AuthProvider";
import { LoginForm } from "./LoginForm";
import { SITE_LOCALE } from "@/config/locale";

/** Only allow same-site relative redirects (prevents open redirect via ?next=). */
export const safeNext = (next, locale) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/");

export function LoginView() {
  const locale = SITE_LOCALE;
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), locale);
  const signedInElsewhere = searchParams.get("reason") === SIGNED_IN_ELSEWHERE;

  const handleSuccess = ({ isNewUser }) => {
    router.replace(isNewUser ? `${routes.onboarding}?next=${encodeURIComponent(next)}` : next);
  };

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      {signedInElsewhere && (
        <p role="alert" className="mb-5 flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <MonitorSmartphone className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {SIGNED_IN_ELSEWHERE_MESSAGE} Your account can be signed in on one device at a time.
          </span>
        </p>
      )}
      <h1 className="font-display text-2xl font-semibold">Login with your phone</h1>
      <p className="mb-6 mt-1 text-sm text-muted">{"We'll send a 6-digit OTP. No password needed."}</p>
      <LoginForm onSuccess={handleSuccess} />
    </Card>
  );
}
