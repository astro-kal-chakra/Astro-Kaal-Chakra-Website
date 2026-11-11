"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Crown, Download, FileText, PlayCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Spinner } from "@/components/ui/Skeleton";
import { allLessons, planById, PLANS } from "../data";
import { academy, useAcademy } from "../progress";
import { useCourseTab } from "./AcademyHeader";
import { LiveClass } from "./LiveClass";
import { TrainerSessions } from "./TrainerSessions";

/**
 * Video lessons plus the section picked in the academy header (only those the plan unlocks).
 * Sends visitors without a plan to enrolment or the plans step.
 */
export function CoursePlayer({ course }) {
  const router = useRouter();
  const state = useAcademy();
  const enrolled = state?.enrolled[course.slug];
  const sub = state?.subs[course.slug];
  const plan = sub && planById(sub.plan);
  const lessons = allLessons(course);
  const [currentId, setCurrentId] = useState(lessons[0].id);
  const tab = useCourseTab(plan);
  const panelRef = useRef(null);
  const shownTab = useRef(tab);

  useEffect(() => {
    if (state && !plan) router.replace(enrolled ? routes.academyPlans(course.slug) : routes.academyEnroll(course.slug));
  }, [state, enrolled, plan, router, course.slug]);

  // Picking a section in the header brings it into view (recorded classes = the player at the top).
  useEffect(() => {
    if (shownTab.current === tab) return;
    shownTab.current = tab;
    if (tab === "classes") window.scrollTo({ top: 0, behavior: "smooth" });
    else panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [tab]);

  if (!plan) return <Spinner className="mx-auto my-24 size-10" />;

  const current = lessons.find((l) => l.id === currentId) || lessons[0];
  const doneCount = lessons.filter((l) => state.done[l.id]).length;
  const pct = Math.round((doneCount / lessons.length) * 100);
  const topPlan = plan.id === PLANS.at(-1).id;
  const next = lessons[lessons.indexOf(current) + 1];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-3xl bg-black shadow-lg">
          <video
            key={current.id}
            src={current.video}
            controls
            playsInline
            preload="metadata"
            onEnded={() => academy.markDone(current.id)}
            className="aspect-video w-full object-cover"
          />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">{course.modules.find((m) => m.lessons.includes(current))?.title}</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl">{current.title}</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => academy.toggleDone(current.id)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                state.done[current.id] ? "border-green-600 text-green-700 dark:text-green-400" : "border-line hover:bg-surface-muted"
              )}
            >
              <CheckCircle2 className="size-4" aria-hidden /> {state.done[current.id] ? "Completed" : "Mark complete"}
            </button>
            {next && (
              <button type="button" onClick={() => setCurrentId(next.id)} className="h-10 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-400 dark:text-brand-950">
                Next lesson
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface-muted px-4 py-2.5 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Crown className="size-4 text-brand-600 dark:text-gold-400" aria-hidden /> {`${plan.name} plan`}
          </span>
          {!topPlan && (
            <LocaleLink href={routes.academyPlans(course.slug)} className="font-semibold text-accent hover:underline">
              Upgrade for more features →
            </LocaleLink>
          )}
        </div>

        <div ref={panelRef} className="scroll-mt-36 motion-safe:animate-[banner-in_0.3s_ease-out]" key={tab}>
          {tab === "classes" && <Overview course={course} name={enrolled.name} live={plan.features.includes("live")} />}
          {tab === "notes" && <Notes key={current.id} lesson={current} value={state.notes[current.id] || ""} />}
          {tab === "resources" && <Resources course={course} />}
          {tab === "live" && <LiveClass course={course} />}
          {tab === "session" && <TrainerSessions course={course} plan={plan} booked={sub.booked} />}
        </div>
      </div>

      {/* Module list */}
      <aside className="lg:sticky lg:top-36 lg:self-start xl:top-24">
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="border-b border-line p-4">
            <p className="font-semibold">Course content</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted">{`${doneCount} of ${lessons.length} lessons · ${pct}% complete`}</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {course.modules.map((m, mi) => (
              <div key={m.title}>
                <p className="bg-surface-muted px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">{`Module ${mi + 1} · ${m.title}`}</p>
                {m.lessons.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setCurrentId(l.id)}
                    aria-current={l.id === current.id}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition",
                      l.id === current.id ? "bg-brand-50 font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-100" : "hover:bg-surface-muted"
                    )}
                  >
                    {state.done[l.id] ? (
                      <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-label="Completed" />
                    ) : l.id === current.id ? (
                      <PlayCircle className="size-4 shrink-0 text-brand-600" aria-hidden />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">{l.title}</span>
                    <span className="shrink-0 text-xs text-muted tabular-nums">{l.duration}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Overview({ course, name, live }) {
  return (
    <div className="space-y-5">
      <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-100">{`Welcome, ${name.split(" ")[0]}! Watch the lessons in order${live ? ", take notes, and join the weekly live class." : " and take notes as you go."}`}</p>
      <div>
        <h2 className="font-display text-xl">What you&apos;ll learn</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {course.outcomes.map((o) => (
            <li key={o} className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden /> {o}
            </li>
          ))}
        </ul>
      </div>
      {live && <p className="text-sm text-muted">{`Live class: ${course.live.day}, ${course.live.time} (${course.live.length}) with ${course.trainer.name}.`}</p>}
    </div>
  );
}

/** Per-lesson notes, auto-saved (debounced) on this device. */
function Notes({ lesson, value }) {
  const [text, setText] = useState(value);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (text === value) return;
    const t = setTimeout(() => {
      academy.saveNote(lesson.id, text);
      setSaved(true);
    }, 500);
    return () => clearTimeout(t);
  }, [text, value, lesson.id]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <label htmlFor="lesson-notes" className="font-semibold">{`Notes for “${lesson.title}”`}</label>
        <span className="text-xs text-muted">{saved ? "Saved" : "Saving…"}</span>
      </div>
      <textarea
        id="lesson-notes"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        rows={8}
        placeholder="Write key points, chart examples or questions for the live class…"
        className="w-full resize-y rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed outline-none transition focus:border-brand-400"
      />
    </div>
  );
}

function Resources({ course }) {
  const download = (r) => {
    const blob = new Blob([`${course.title}\n${r.name}\n\n${r.content}\n`], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt` });
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <ul className="space-y-2">
      {course.resources.map((r) => (
        <li key={r.name} className="flex items-center gap-3 rounded-2xl border border-line p-4">
          <FileText className="size-5 shrink-0 text-brand-600 dark:text-gold-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{r.name}</p>
            <p className="text-xs text-muted">{r.kind}</p>
          </div>
          <button type="button" onClick={() => download(r)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-semibold hover:bg-surface-muted">
            <Download className="size-4" aria-hidden /> Download
          </button>
        </li>
      ))}
    </ul>
  );
}
