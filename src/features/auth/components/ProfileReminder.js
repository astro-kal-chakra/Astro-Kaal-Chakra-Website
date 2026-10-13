"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "../context/AuthProvider";

/* Reminder timing — change here. */
const tenToTwelve = () => (10 + Math.random() * 2) * 1000;
const firstDelay = tenToTwelve; // first appears 10–12 s after landing
const nextDelay = tenToTwelve; // then appears again every 10–12 s (measured from one appearance to the next)
export const REMINDER_VISIBLE = 5 * 1000; // stays on screen 5 s (the × closes it sooner)

// No reminder on the onboarding form (the user is completing it there), on the profile edit page, or on login.
const HIDE_ON = [routes.onboarding, routes.profile, routes.login];

const KEY = (id) => `profile_reminder_next:${id}`;
const readNext = (id) => {
  try {
    return Number(localStorage.getItem(KEY(id))) || 0;
  } catch {
    return 0;
  }
};
const writeNext = (id, at) => {
  try {
    localStorage.setItem(KEY(id), String(at));
  } catch {}
};

/** The reminder toast itself (also shown right away when the user taps "Skip for now"). */
export function showProfileReminder(toast) {
  toast({
    id: `profile-reminder-${Date.now()}`,
    type: "warning",
    title: "You haven't completed your profile",
    message: "Add your birth details for more accurate guidance.",
    action: { label: "Complete profile", href: routes.profile },
    duration: REMINDER_VISIBLE,
  });
}

/** Set when the next reminder is due (e.g. after "Skip for now" showed one already). */
export function scheduleProfileReminder(userId, delay = nextDelay()) {
  if (userId) writeNext(userId, Date.now() + delay);
}

/**
 * "You haven't completed your profile" for logged-in users who skipped onboarding: first 10–12 s after
 * landing, visible 5 s, and again every 10–12 s — on every page except the onboarding form — until
 * the profile is complete (then it never shows). The next time is stored per user in localStorage, so page
 * changes, refreshes and other tabs follow one shared schedule and never show it twice at once.
 */
export function ProfileReminder() {
  const { status, user } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname() || "";
  const hidden = HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const userId = user?.id;
  const incomplete = status === "authenticated" && Boolean(userId) && !user?.profileComplete;

  useEffect(() => {
    if (!incomplete || hidden) return;
    let timer = 0;

    const arm = () => {
      const now = Date.now();
      let next = readNext(userId);
      // Nothing scheduled, or it fell due while the user was away / on the onboarding form: 10–12 s from now.
      if (!next || next < now) {
        next = now + firstDelay();
        writeNext(userId, next);
      }
      timer = setTimeout(fire, next - now);
    };

    const fire = () => {
      // Another tab may have shown it already and pushed the schedule on: follow that instead.
      if (readNext(userId) > Date.now() + 1000) return arm();
      writeNext(userId, Date.now() + nextDelay());
      showProfileReminder(toast);
      arm();
    };

    arm();
    return () => clearTimeout(timer);
  }, [incomplete, hidden, userId, toast]);

  return null;
}
