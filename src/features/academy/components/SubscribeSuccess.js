"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { routes } from "@/config/routes";
import { SITE_LOCALE } from "@/config/locale";
import { formatCurrency } from "@/lib/utils/format";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Skeleton";
import { planById } from "../data";
import { useAcademy } from "../progress";

const REDIRECT_SECONDS = 4;

/** Payment done: a short success message, then an automatic hop into the course. */
export function SubscribeSuccess({ course }) {
  const router = useRouter();
  const state = useAcademy();
  const sub = state?.subs[course.slug];
  const plan = sub && planById(sub.plan);
  const [left, setLeft] = useState(REDIRECT_SECONDS);
  const coursePath = routes.academyCourse(course.slug);

  useEffect(() => {
    if (state && !sub) router.replace(routes.academyPlans(course.slug));
  }, [state, sub, router, course.slug]);

  useEffect(() => {
    if (!sub) return;
    if (left === 0) return router.replace(coursePath);
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sub, left, router, coursePath]);

  if (!plan) return <Spinner className="mx-auto my-24 size-10" />;

  return (
    <Card className="mx-auto max-w-md p-6 text-center motion-safe:animate-[banner-in_0.4s_ease-out] sm:p-10">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
        <CheckCircle2 className="size-10" aria-hidden />
      </div>
      <h1 className="mt-4 font-display text-3xl">Payment successful!</h1>
      <p className="mt-2 text-muted">{`${formatCurrency(sub.amount, SITE_LOCALE)} paid · your ${plan.name} plan for ${course.title} is now active.`}</p>
      <ButtonLink href={coursePath} replace variant="gold" size="lg" className="mt-8 w-full">
        Go to course <ArrowRight className="size-4" aria-hidden />
      </ButtonLink>
      <p className="mt-3 text-xs text-muted" aria-live="polite">{`Opening your course in ${left}s…`}</p>
    </Card>
  );
}
