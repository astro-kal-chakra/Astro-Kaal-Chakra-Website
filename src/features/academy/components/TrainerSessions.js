"use client";

import { useState } from "react";
import { CalendarCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { academy } from "../progress";

/** Next three days at 6 and 8 PM IST — DEMO slots until the trainer's calendar comes from the backend. */
const slots = () =>
  [1, 2, 3].flatMap((d) =>
    ["6:00 PM", "8:00 PM"].map((time) => {
      const day = new Date(Date.now() + d * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      return `${day} · ${time}`;
    })
  );

/** 1:1 video sessions with the course trainer, included in the Mentorship plan. */
export function TrainerSessions({ course, plan, booked }) {
  const [pick, setPick] = useState(null);
  const left = plan.sessions - booked.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-line p-4">
        <Avatar name={course.trainer.name} size={52} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{course.trainer.name}</p>
          <p className="text-sm text-muted">{`${course.trainer.role} · 30 min video session`}</p>
        </div>
        <p className="text-right text-sm">
          <span className="block font-display text-2xl tabular-nums">{left}</span>
          <span className="text-xs text-muted">{`of ${plan.sessions} left this month`}</span>
        </p>
      </div>

      {booked.length > 0 && (
        <ul className="space-y-2">
          {booked.map((s) => (
            <li key={s} className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
              <CalendarCheck className="size-4 shrink-0" aria-hidden /> {`Booked: ${s}`}
            </li>
          ))}
        </ul>
      )}

      {left > 0 ? (
        <div>
          <p className="text-sm font-semibold">Pick a slot</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots()
              .filter((s) => !booked.includes(s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPick(s)}
                  aria-pressed={pick === s}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                    pick === s ? "border-brand-500 bg-brand-50 font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-100" : "border-line hover:border-brand-200"
                  )}
                >
                  <Clock className="size-3.5 shrink-0 text-muted" aria-hidden /> {s}
                </button>
              ))}
          </div>
          <Button
            variant="gold"
            className="mt-4"
            disabled={!pick}
            onClick={() => {
              academy.bookSession(course.slug, pick);
              setPick(null);
            }}
          >
            Book session
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted">{"You've used this month's sessions. New sessions unlock with your next billing cycle."}</p>
      )}
    </div>
  );
}
