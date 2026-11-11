"use client";

import { Suspense } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { FileText, NotebookPen, PlayCircle, Radio, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Logo } from "@/components/layout/Logo";
import { LanguageToggle } from "@/features/translate/components/LanguageToggle";
import { planById } from "../data";
import { useAcademy } from "../progress";

/** Course sections; `feature` sections only exist when the subscribed plan includes them. */
const TABS = [
  { id: "classes", label: "Recorded classes", icon: PlayCircle },
  { id: "notes", label: "Notes", icon: NotebookPen, feature: "notes" },
  { id: "resources", label: "Study material", icon: FileText, feature: "material" },
  { id: "live", label: "Live class", icon: Radio, feature: "live" },
  { id: "session", label: "1:1 Session", icon: UserRound, feature: "session" },
];

export const tabsFor = (plan) => TABS.filter((t) => !t.feature || plan.features.includes(t.feature));

/** Selected course section from ?tab=, falling back to recorded classes when the plan doesn't include it. */
export const useCourseTab = (plan) => {
  const tab = useSearchParams().get("tab");
  return plan && tabsFor(plan).some((t) => t.id === tab) ? tab : "classes";
};

/**
 * Academy header, only on a subscribed course page (the enroll / plans / success steps have none):
 * logo, the sections the plan unlocks and the language toggle. The course page shows the section picked here.
 */
export function AcademyHeader() {
  return (
    <Suspense>
      <CourseHeader />
    </Suspense>
  );
}

function CourseHeader() {
  const { slug } = useParams();
  const pathname = usePathname();
  const state = useAcademy();
  const plan = state && planById(state.subs[slug]?.plan);
  const coursePage = pathname.endsWith(`/academy/${slug}`); // not the enroll / plans / success steps
  const active = useCourseTab(plan);

  if (!coursePage || !plan) return null;
  const links = (
    <nav aria-label="Course" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
      {tabsFor(plan).map(({ id, label, icon: Icon }) => (
        <LocaleLink
          key={id}
          href={id === "classes" ? pathname : `${pathname}?tab=${id}`}
          replace
          scroll={false}
          aria-current={active === id ? "page" : undefined}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
            active === id ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-gold-300" : "text-muted hover:bg-surface-muted hover:text-fg"
          )}
        >
          <Icon className="size-4" aria-hidden /> {label}
          {id === "live" && <span className="size-1.5 rounded-full bg-red-500" aria-hidden />}
        </LocaleLink>
      ))}
    </nav>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-6">
        <Logo priority wordmarkClassName="hidden min-[480px]:inline" />
        <div className="hidden min-w-0 xl:block">{links}</div>
        <div className="ml-auto shrink-0">
          <LanguageToggle variant="compact" className="inline-flex md:hidden" />
          <LanguageToggle className="hidden md:inline-flex" />
        </div>
      </div>
      <div className="container-page border-t border-line py-2 xl:hidden">{links}</div>
    </header>
  );
}
