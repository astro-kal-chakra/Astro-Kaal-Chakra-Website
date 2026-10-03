"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "./LoginForm";
import { SITE_LOCALE } from "@/config/locale";

/** Only allow same-site relative redirects (prevents open redirect via ?next=). */
export const safeNext = (next, locale) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/");

export function LoginView() {
  const locale = SITE_LOCALE;
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"), locale);

  const handleSuccess = ({ isNewUser }) => {
    router.replace(isNewUser ? `${routes.onboarding}?next=${encodeURIComponent(next)}` : next);
  };

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      <h1 className="font-display text-2xl font-semibold">Login with your phone</h1>
      <p className="mb-6 mt-1 text-sm text-muted">{"We'll send a 6-digit OTP. No password needed."}</p>
      <LoginForm onSuccess={handleSuccess} />
    </Card>
  );
}
