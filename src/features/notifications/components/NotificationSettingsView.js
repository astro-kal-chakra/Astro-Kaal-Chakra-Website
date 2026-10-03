"use client";

import { useState } from "react";
import { BellRing, Info, Lock, Smartphone } from "lucide-react";
import { routes } from "@/config/routes";
import { AccountSwitch } from "@/features/account/components/AccountControls";
import { AccountShell } from "@/features/account/components/AccountShell";
import { AccountErrorState } from "@/features/account/components/AccountStates";
import { useAccountResource } from "@/features/account/hooks/useAccountResource";
import { LOCKED_PREFERENCES, NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS, notificationService } from "@/lib/api/services/notification.service";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePushPermission } from "../hooks/usePushPermission";
import { label as t } from "@/lib/labels";

const STATUS_TONE = { granted: "success", denied: "warning", default: "neutral", unsupported: "neutral", unknown: "neutral" };

function PushPermissionCard() {
  const { toast } = useToast();
  const { permission, request, needsHomeScreen } = usePushPermission();
  const [busy, setBusy] = useState(false);

  const enable = async () => {
    setBusy(true);
    const result = await request();
    setBusy(false);
    if (result === "granted") toast({ id: "push-enabled", type: "success", title: "Browser notifications enabled" });
  };

  const statusKey = permission === "unknown" ? "default" : permission;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-800 dark:text-gold-400">
          <BellRing className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Browser notifications</h2>
          <div className="mt-1" aria-live="polite">
            {permission === "unknown" ? (
              <Skeleton className="h-5 w-32 rounded-full" />
            ) : (
              <Badge tone={STATUS_TONE[permission]}>{t(`account.notificationSettings.pushStatus.${statusKey}`)}</Badge>
            )}
          </div>
        </div>
        {(permission === "default" || permission === "unknown") && (
          <Button onClick={enable} loading={busy} disabled={permission === "unknown"} variant="gold" className="w-full sm:w-auto">
            Enable browser notifications
          </Button>
        )}
      </div>

      {permission === "denied" && <p className="mt-4 text-sm text-muted">Notifications are blocked. Click the lock icon next to the address bar and allow notifications for this site.</p>}

      <p
        className={cn(
          "mt-4 flex gap-2 rounded-xl p-3 text-xs",
          needsHomeScreen ? "bg-gold-100 text-gold-700 dark:bg-gold-700/20 dark:text-gold-300" : "bg-surface-muted text-muted"
        )}
      >
        <Smartphone className="size-4 shrink-0" aria-hidden />
        <span>{"On iPhone and iPad, web push works only when this site is added to your Home Screen: tap Share, then \"Add to Home Screen\", and open it from there."}</span>
      </p>
    </Card>
  );
}

function PreferencesMatrix() {
  const { toast } = useToast();
  const { data, status, reload, mutate } = useAccountResource(() => notificationService.getPreferences());
  const [pending, setPending] = useState(null);

  const toggle = async (category, channel, enabled) => {
    const id = `${category}.${channel}`;
    setPending(id);
    mutate((p) => ({ ...p, [category]: { ...p[category], [channel]: enabled } }));
    try {
      await notificationService.updatePreference(category, channel, enabled);
      toast({ type: "success", title: "Preference saved", duration: 1500 });
    } catch {
      mutate((p) => ({ ...p, [category]: { ...p[category], [channel]: !enabled } }));
      toast({ type: "error", title: "Couldn't save. Please try again." });
    } finally {
      setPending(null);
    }
  };

  if (status === "error") return <AccountErrorState onRetry={reload} />;

  return (
    <Card className="overflow-hidden">
      <div className="hidden grid-cols-[minmax(0,1fr)_repeat(3,5.5rem)] items-center gap-2 border-b border-line bg-surface-muted px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
        <span />
        {NOTIFICATION_CHANNELS.map((c) => (
          <span key={c} className="text-center">
            {t(`account.notificationSettings.channels.${c}`)}
          </span>
        ))}
      </div>
      <ul className="divide-y divide-line">
        {NOTIFICATION_CATEGORIES.map((cat) => (
          <li key={cat} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_repeat(3,5.5rem)] sm:items-center sm:gap-2">
            <div>
              <p className="font-medium">{t(`account.notificationSettings.categories.${cat}`)}</p>
              <p className="text-sm text-muted">{t(`account.notificationSettings.categoryDesc.${cat}`)}</p>
            </div>
            {NOTIFICATION_CHANNELS.map((ch) => {
              const locked = LOCKED_PREFERENCES[cat]?.includes(ch);
              const label = `${t(`account.notificationSettings.categories.${cat}`)}: ${t(`account.notificationSettings.channels.${ch}`)}`;
              return (
                <div key={ch} className="flex items-center justify-between gap-2 sm:flex-col sm:justify-center">
                  <span className="text-sm text-muted sm:hidden">{t(`account.notificationSettings.channels.${ch}`)}</span>
                  {status === "loading" ? (
                    <Skeleton className="h-6 w-11 rounded-full" />
                  ) : (
                    <span className="flex items-center gap-1.5" title={locked ? "Always on for security" : undefined}>
                      {locked && <Lock className="size-3 text-muted" aria-hidden />}
                      <AccountSwitch
                        checked={locked ? true : Boolean(data?.[cat]?.[ch])}
                        disabled={locked || pending === `${cat}.${ch}`}
                        onChange={(v) => toggle(cat, ch, v)}
                        label={locked ? `${label} (${"Always on for security"})` : label}
                      />
                    </span>
                  )}
                </div>
              );
            })}
          </li>
        ))}
      </ul>
      <p className="flex gap-2 border-t border-line px-5 py-3 text-xs text-muted">
        <Info className="size-4 shrink-0" aria-hidden />
        <span>
          {"Promotional messages are sent only if you've given marketing consent in Settings."}{" "}
          <LocaleLink href={routes.settings} className="font-semibold text-brand-600 hover:underline dark:text-gold-400">
            Settings →
          </LocaleLink>
        </span>
      </p>
    </Card>
  );
}

export function NotificationSettingsView() {
  return (
    <AccountShell
      title="Notification settings"
      subtitle="Choose what you hear about and where."
      back={{ href: routes.notifications, label: "Notifications" }}
    >
      <div className="space-y-6">
        <PushPermissionCard />
        <PreferencesMatrix />
      </div>
    </AccountShell>
  );
}
