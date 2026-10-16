"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TriangleAlert, X } from "lucide-react";
import { routes } from "@/config/routes";
import { LocaleLink } from "@/components/ui/LocaleLink";
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

/** The reminder currently on screen in this tab (only ever one at a time): a toast id, or BANNER. */
let openId = null;
const BANNER = "banner";

/**
 * The toast version, shown right away when the user taps "Skip for now". It stays until the user
 * closes it; closing it schedules the next reminder (the top alert bar) 20 s later.
 */
export function showProfileReminder(toast, userId) {
  if (openId) return; // one at a time
  const id = `profile-reminder-${Date.now()}`;
  openId = id;
  // If the page reloads while it is open, bring the reminder back 10–12 s after load.
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
 * "You haven't completed your profile" for logged-in users who skipped onboarding. The Skip button shows it
 * as a toast (above); every later reminder is an alert bar at the top of the page, just under the header:
 * first 10–12 s after landing, stays until closed, back 20 s after each close — on every page except the
 * onboarding form — until the profile is complete (then it never shows). The next time is stored per user
 * in localStorage, so page changes, refreshes and other tabs follow one shared schedule.
 */
export function ProfileReminder() {
  const { status, user } = useAuth();
  const { dismiss } = useToast();
  const [bannerOpen, setBannerOpen] = useState(false);
  const pathname = usePathname() || "";
  const hidden = HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const userId = user?.id;
  const incomplete = status === "authenticated" && Boolean(userId) && !user?.profileComplete;

  useEffect(() => {
    // Profile completed (or logged out / on the form): take an open reminder toast off the screen.
    if (!incomplete || hidden) {
      if (openId && openId !== BANNER) dismiss(openId);
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
      openId = BANNER;
      writeNext(userId, Date.now() + firstDelay()); // if the page reloads while it's open: back 10–12 s after load
      setBannerOpen(true);
    };

    arm();
    window.addEventListener(CLOSED_EVENT, arm);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CLOSED_EVENT, arm);
    };
  }, [incomplete, hidden, userId, dismiss]);

  const closeBanner = () => {
    setBannerOpen(false);
    if (openId === BANNER) openId = null;
    if (userId) writeNext(userId, Date.now() + AFTER_CLOSE);
    window.dispatchEvent(new Event(CLOSED_EVENT));
  };

  if (!bannerOpen || !incomplete || hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[4.5rem] z-30 motion-safe:animate-[banner-in_0.35s_ease-out]">
      <div className="container-page">
        <div
          role="alert"
          className="pointer-events-auto flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-900 shadow-lg shadow-brand-900/10 sm:items-center sm:px-5 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-100"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-brand-600 sm:mt-0 dark:text-gold-400" aria-hidden />
          <p className="min-w-0 flex-1 text-sm sm:text-[15px]">
            <strong className="font-semibold">You haven&apos;t completed your profile.</strong>{" "}
            <span className="text-brand-800/90 dark:text-brand-100/85">Add your birth details for more accurate guidance —</span>{" "}
            <LocaleLink
              href={routes.profile}
              onClick={closeBanner}
              className="font-bold text-brand-700 underline underline-offset-2 hover:text-brand-900 dark:text-gold-300 dark:hover:text-gold-200"
            >
              complete your profile
            </LocaleLink>
            .
          </p>
          <button
            type="button"
            onClick={closeBanner}
            aria-label="Dismiss"
            className="-my-1 -mr-2 shrink-0 rounded-full p-2.5 text-brand-700/70 sm:-mr-1 sm:p-1 transition hover:bg-brand-100 hover:text-brand-900 dark:text-brand-200/70 dark:hover:bg-brand-900"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
