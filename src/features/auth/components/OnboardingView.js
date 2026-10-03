"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Skeleton";
import { useAuth } from "../context/AuthProvider";
import { safeNext } from "./LoginView";
import { ProfileSetupForm } from "./ProfileSetupForm";
import { SITE_LOCALE } from "@/config/locale";

export function OnboardingView() {
  const locale = SITE_LOCALE;
  const router = useRouter();
  const { status } = useAuth();
  const next = safeNext(useSearchParams().get("next"), locale);

  if (status === "loading") return <Spinner className="mt-10" />;

  return (
    <Card className="w-full max-w-lg p-6 sm:p-8">
      <h1 className="font-display text-2xl font-semibold">Tell us about yourself</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Birth details help astrologers give you accurate guidance.</p>
      <ProfileSetupForm onDone={() => router.replace(next)} />
    </Card>
  );
}
