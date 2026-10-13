"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Skeleton";
import { useAuth } from "../context/AuthProvider";
import { safeNext } from "./LoginView";
import { useToast } from "@/providers/ToastProvider";
import { showProfileReminder } from "./ProfileReminder";
import { ProfileSetupForm } from "./ProfileSetupForm";
import { SITE_LOCALE } from "@/config/locale";

export function OnboardingView() {
  const locale = SITE_LOCALE;
  const router = useRouter();
  const { status, user } = useAuth();
  const { toast } = useToast();
  const [skipping, setSkipping] = useState(false);
  const next = safeNext(useSearchParams().get("next"), locale);

  if (status === "loading") return <Spinner className="mt-10" />;

  return (
    <Card className="w-full max-w-lg p-6 sm:p-8">
      <h1 className="font-display text-2xl font-semibold">Tell us about yourself</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Birth details help astrologers give you accurate guidance.</p>
      <ProfileSetupForm onDone={() => router.replace(next)} />
      {/* Profile is optional to get started; skipping shows the reminder, which then repeats (ProfileReminder) */}
      <button
        type="button"
        disabled={skipping}
        onClick={() => {
          // Tell the user first, then go to the website (the toast stays visible across the redirect).
          setSkipping(true);
          showProfileReminder(toast, user?.id); // stays until closed; the next one comes 20 s after closing
          setTimeout(() => router.replace(next), 1500);
        }}
        className="mx-auto mt-4 block text-sm font-medium text-muted underline-offset-4 hover:text-fg hover:underline"
      >
        Skip for now
      </button>
    </Card>
  );
}
