"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Settings } from "lucide-react";
import { routes } from "@/config/routes";
import { AccountFilterChips } from "@/features/account/components/AccountControls";
import { AccountShell } from "@/features/account/components/AccountShell";
import { AccountEmptyCard, AccountErrorState, AccountListSkeleton } from "@/features/account/components/AccountStates";
import { useAccountResource } from "@/features/account/hooks/useAccountResource";
import { NOTIFICATIONS_CHANGED_EVENT, NOTIFICATION_TYPES, notificationService } from "@/lib/api/services/notification.service";
import { useToast } from "@/providers/ToastProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NotificationItem } from "./NotificationItem";
import { PushPermissionPrompt } from "./PushPermissionPrompt";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

export function NotificationsView() {
  const locale = SITE_LOCALE;
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [marking, setMarking] = useState(false);
  const { data, status, reload, refresh, mutate } = useAccountResource(() => notificationService.list({ locale }), locale);

  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
  }, [refresh]);

  const items = data?.items ?? [];
  const unread = data?.unreadCount ?? 0;
  const filtered = items.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter));

  const options = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread", count: unread },
    ...NOTIFICATION_TYPES.map((type) => ({ value: type, label: t(`account.notifications.types.${type}`) })),
  ];

  const markAll = async () => {
    setMarking(true);
    try {
      await notificationService.markAllRead();
      mutate((d) => d && { ...d, unreadCount: 0, items: d.items.map((n) => ({ ...n, read: true })) });
      toast({ id: "notifications-read", type: "success", title: "All notifications marked as read" });
    } catch {
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setMarking(false);
    }
  };

  const onOpen = (n) => {
    if (n.read) return;
    mutate((d) => d && { ...d, unreadCount: Math.max(0, d.unreadCount - 1), items: d.items.map((x) => (x.id === n.id ? { ...x, read: true } : x)) });
    notificationService.markRead(n.id).catch(() => {});
  };

  return (
    <AccountShell
      title="Notifications"
      subtitle="Updates about your sessions, wallet and astrologers."
      actions={
        <>
          <Button size="sm" variant="outline" onClick={markAll} loading={marking} disabled={!unread}>
            <CheckCheck className="size-4" aria-hidden /> Mark all read
          </Button>
          <ButtonLink href={routes.notificationSettings} size="sm" variant="ghost">
            <Settings className="size-4" aria-hidden /> Settings
          </ButtonLink>
        </>
      }
    >
      <PushPermissionPrompt className="mb-4" />

      <AccountFilterChips className="mb-4" label="Notifications" value={filter} onChange={setFilter} options={options} />

      {status === "loading" && <AccountListSkeleton rows={5} />}
      {status === "error" && <AccountErrorState onRetry={reload} />}
      {status === "success" && filtered.length === 0 && (
        <AccountEmptyCard
          icon={Bell}
          title={items.length ? "Nothing here" : "You're all caught up"}
          description={items.length ? "No notifications match this filter." : "New notifications will appear here."}
        />
      )}
      {status === "success" && filtered.length > 0 && (
        <Card as="ul" className="divide-y divide-line overflow-hidden">
          {filtered.map((n) => (
            <li key={n.id}>
              <NotificationItem notification={n} onOpen={onOpen} />
            </li>
          ))}
        </Card>
      )}
    </AccountShell>
  );
}
