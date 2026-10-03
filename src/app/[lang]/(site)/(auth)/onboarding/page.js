import { Suspense } from "react";
import { OnboardingView } from "@/features/auth/components/OnboardingView";

export const metadata = { title: "Complete your profile" };

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingView />
    </Suspense>
  );
}
