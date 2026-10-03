"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bell, CheckCheck, Settings } from "lucide-react";
import { routes } from "@/config/routes";
import { useAccountResource } from "@/features/account/hooks/useAccountResource";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { NOTIFICATIONS_CHANGED_EVENT, notificationService } from "@/lib/api/services/notification.service";
import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { NotificationItem } from "./NotificationItem";
import { SITE_LOCALE } from "@/config/locale";

const LATEST = 5;

function BellDropdown({ className }) {
  const locale = SITE_LOCALE;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelId = useId();
  const { data, status, reload, refresh } = useAccountResource(() => notificationService.list({ locale, limit: LATEST }), locale);
  const unread = data?.unreadCount ?? 0;

  // Keep in sync with the notifications page / other tabs. TODO(socket): also refresh on a "notification:new" event.
  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) refresh();
    setOpen((o) => !o);
  };

  const onOpenItem = (n) => {
    setOpen(false);
    if (!n.read) notificationService.markRead(n.id).catch(() => {});
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative flex size-9 items-center justify-center rounded-full border border-line hover:bg-surface-muted"
      >
        <Bell className="size-4" aria-hidden />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          className="fixed inset-x-2 top-16 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <p className="font-semibold">
              Notifications
              {unread > 0 && <span className="ml-2 text-xs font-medium text-muted">{`${unread} unread`}</span>}
            </p>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => notificationService.markAllRead().catch(() => {})}
                  className="rounded-full p-1.5 text-muted hover:bg-surface-muted hover:text-fg"
                  aria-label="Mark all read"
                  title="Mark all read"
                >
                  <CheckCheck className="size-4" />
                </button>
              )}
              <LocaleLink
                href={routes.notificationSettings}
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-muted hover:bg-surface-muted hover:text-fg"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="size-4" />
              </LocaleLink>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {status === "loading" && (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {status === "error" && (
              <div className="p-6 text-center text-sm">
                <p className="mb-2 text-muted">{"Couldn't load this"}</p>
                <button type="button" onClick={reload} className="font-semibold text-brand-600 hover:underline dark:text-gold-400">
                  Try again
                </button>
              </div>
            )}
            {status === "success" && data.items.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="mx-auto mb-2 size-8 text-muted" aria-hidden />
                <p className="font-medium">{"You're all caught up"}</p>
                <p className="text-sm text-muted">New notifications will appear here.</p>
              </div>
            )}
            {status === "success" && data.items.length > 0 && (
              <ul className="divide-y divide-line">
                {data.items.map((n) => (
                  <li key={n.id}>
                    <NotificationItem notification={n} onOpen={onOpenItem} compact />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <LocaleLink
            href={routes.notifications}
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:bg-surface-muted dark:text-gold-400"
          >
            View all notifications
          </LocaleLink>
        </div>
      )}
    </div>
  );
}

/**
 * Header bell with unread badge and a dropdown of the latest notifications.
 * Renders nothing for guests, so it can be mounted unconditionally in the header.
 */
export function NotificationBell({ className }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <BellDropdown className={className} />;
}
