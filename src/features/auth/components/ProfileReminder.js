"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "../context/AuthProvider";

/* Reminder timing — change here. */
const firstDelay = () => (10 + Math.random() * 2) * 1000; // first appears 10–12 s after landing
const AFTER_CLOSE = 20 * 1000; // stays until the user closes it (×); appears again 20 s after that

// No reminder on the onboarding form (the user is completing it there), on the profile edit page, or on login.
const HIDE_ON = [routes.onboarding, routes.profile, routes.login];

const KEY = (id) => `profile_reminder_next:${id}`;
const CLOSED_EVENT = "profile-reminder:closed";
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

/** The reminder currently on screen in this tab (only ever one at a time). */
let openId = null;

/**
 * Show the reminder (also used right away when the user taps "Skip for now"). It stays until the user
 * closes it; closing it schedules the next one 20 s later.
 */
export function showProfileReminder(toast, userId) {
  if (openId) return; // one at a time
  const id = `profile-reminder-${Date.now()}`;
  openId = id;
  // If the page reloads while it is open, bring it back 10–12 s after load.
  if (userId) writeNext(userId, Date.now() + firstDelay());
  toast({
    id,
    type: "warning",
    title: "You haven't completed your profile",
    message: "Add your birth details for more accurate guidance.",
    action: { label: "Complete profile", href: routes.profile },
    duration: 0, // no auto-hide
    onClose: () => {
      if (openId === id) openId = null;
      if (userId) writeNext(userId, Date.now() + AFTER_CLOSE);
      window.dispatchEvent(new Event(CLOSED_EVENT));
    },
  });
}

/**
 * "You haven't completed your profile" for logged-in users who skipped onboarding: first 10–12 s after
 * landing, then it stays until closed and comes back 20 s after each close — on every page except the
 * onboarding form — until the profile is complete (then it is removed and never shows). The next time is
 * stored per user in localStorage, so page changes, refreshes and other tabs follow one shared schedule.
 */
export function ProfileReminder() {
  const { status, user } = useAuth();
  const { toast, dismiss } = useToast();
  const pathname = usePathname() || "";
  const hidden = HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const userId = user?.id;
  const incomplete = status === "authenticated" && Boolean(userId) && !user?.profileComplete;

  useEffect(() => {
    // Profile completed (or logged out / on the form): take an open reminder off the screen.
    if (!incomplete || hidden) {
      if (openId) dismiss(openId);
      return;
    }
    let timer = 0;

    const arm = () => {
      clearTimeout(timer);
      if (openId) return; // wait for the user to close the one on screen
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
      // Another tab may have pushed the schedule on: follow that instead.
      if (readNext(userId) > Date.now() + 1000) return arm();
      showProfileReminder(toast, userId);
    };

    arm();
    window.addEventListener(CLOSED_EVENT, arm);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CLOSED_EVENT, arm);
    };
  }, [incomplete, hidden, userId, toast, dismiss]);

  return null;
}
