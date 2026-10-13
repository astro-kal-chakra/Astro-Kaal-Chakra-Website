"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "../context/AuthProvider";

const FIRST_DELAY = 60 * 1000; // first nudge: 1 min after skipping / landing with an incomplete profile
const RETURN_DELAY = 8 * 1000; // overdue (e.g. came back next day): wait a moment, don't pop on page load
const nextInterval = () => (20 + Math.random() * 10) * 60 * 1000; // then every 20–30 min
const HIDE_ON = [routes.onboarding, routes.profile, routes.login]; // already on the form / not logged in

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

/** Push the next reminder out (e.g. when the user taps "Skip for now" on onboarding). */
export function scheduleProfileReminder(userId, delay = FIRST_DELAY) {
  if (userId) writeNext(userId, Date.now() + delay);
}

/**
 * Gentle "Please complete your profile" toast for logged-in users who skipped onboarding.
 * Shows for ~10 s (or until closed with ×), then repeats only every 20–30 min until the profile is complete. The next time is
 * stored per user in localStorage, so navigation, refreshes and other tabs never show it early or twice.
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
      if (!next) {
        next = now + FIRST_DELAY;
        writeNext(userId, next);
      }
      timer = setTimeout(fire, next > now ? next - now : RETURN_DELAY);
    };

    const fire = () => {
      // Another tab may have shown it already and pushed the schedule on: follow that instead.
      if (readNext(userId) > Date.now() + 1000) return arm();
      writeNext(userId, Date.now() + nextInterval());
      toast({
        id: `profile-reminder-${Date.now()}`,
        type: "info",
        title: "Please complete your profile",
        message: "Add your birth details for more accurate guidance.",
        action: { label: "Complete profile", href: routes.profile },
        duration: 10000, // stays 10 s; the × closes it sooner
      });
      arm();
    };

    arm();
    return () => clearTimeout(timer);
  }, [incomplete, hidden, userId, toast]);

  return null;
}
