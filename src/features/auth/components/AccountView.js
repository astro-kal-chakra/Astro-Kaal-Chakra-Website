"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Heart, History, LogOut, MonitorSmartphone, Pencil, Sparkles, Users, Wallet } from "lucide-react";
import { routes } from "@/config/routes";
import { AccountConfirmModal } from "@/features/account/components/AccountControls";
import { AccountShell } from "@/features/account/components/AccountShell";
import { useAccountResource } from "@/features/account/hooks/useAccountResource";
import { ACCOUNT_NAV } from "@/features/account/lib/nav";
import { userService } from "@/lib/api/services/user.service";
import { formatCompact, formatCurrency, maskPhone } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "../context/AuthProvider";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const MENU = ACCOUNT_NAV.filter((item) => item.key !== "dashboard");

const STATS = [
  { key: "totalSessions", label: "sessions", icon: History, href: routes.sessions },
  { key: "totalMinutes", label: "minutes", icon: Clock, href: routes.sessions },
  { key: "following", label: "following", icon: Heart, href: routes.following },
  { key: "birthProfiles", label: "profiles", icon: Users, href: routes.birthProfiles },
];

function QuickStats() {
  const locale = SITE_LOCALE;
  const { data, status, reload } = useAccountResource(() => userService.getStats());

  return (
    <section aria-labelledby="stats-title">
      <h2 id="stats-title" className="sr-only">
        Your activity
      </h2>
      {status === "error" ? (
        <Card className="flex items-center justify-between gap-3 p-4 text-sm" role="alert">
          <span className="text-muted">{"Couldn't load this"}</span>
          <Button size="sm" variant="outline" onClick={reload}>
            Try again
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(({ key, label, icon: Icon, href }) => (
            <LocaleLink key={key} href={href} className="rounded-2xl border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
              <Icon className="mb-2 size-5 text-brand-500 dark:text-gold-400" aria-hidden />
              {status === "loading" ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="font-display text-2xl font-bold">{formatCompact(data?.[key] ?? 0, locale)}</p>
              )}
              <p className="text-xs text-muted">{t(`account.dashboard.stats.${label}`)}</p>
            </LocaleLink>
          ))}
        </div>
      )}
    </section>
  );
}

export function AccountView() {
  const locale = SITE_LOCALE;
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [confirm, setConfirm] = useState(null); // null | "single" | "all"
  const [busy, setBusy] = useState(false);

  const doLogout = async () => {
    setBusy(true);
    await logout({ allDevices: confirm === "all" });
    toast({ id: "logged-out", type: "success", title: "You've been logged out" });
    router.replace("/"); // routes.home with the locale prefix
  };

  const name = user?.name || "there";

  return (
    <AccountShell hideMobileBack>
      <div className="space-y-6">
        {/* Profile header */}
        <Card className="bg-cosmic overflow-hidden border-0 p-5 text-white sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={user?.name || "U"} size={72} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-2xl font-semibold">{`Namaste, ${name}`}</h1>
              <p className="text-sm text-white/90">+91 {maskPhone(user?.phone)}</p>
            </div>
            <ButtonLink href={routes.profile} size="sm" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Pencil className="size-3.5" aria-hidden /> Edit profile
            </ButtonLink>
          </div>

          {/* Wallet shortcut */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-brand-600">
              <Wallet className="size-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-xs text-white/90">Wallet balance</p>
              <p className="text-xl font-bold">{formatCurrency(user?.walletBalance ?? 0, locale)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={routes.walletTransactions} size="sm" variant="ghost" className="text-white hover:bg-white/10">
                Transactions
              </ButtonLink>
              <ButtonLink href={routes.wallet} size="sm" variant="light">
                Recharge
              </ButtonLink>
            </div>
          </div>
        </Card>

        {!user?.profileComplete && (
          <Card className="flex flex-col gap-3 border-gold-400/50 bg-gold-100/60 p-4 sm:flex-row sm:items-center dark:bg-gold-700/15">
            <Sparkles className="size-6 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
            <div className="flex-1">
              <p className="font-semibold">Complete your profile</p>
              <p className="text-sm text-muted">Add your birth details so astrologers can give you accurate guidance.</p>
            </div>
            <ButtonLink href={routes.profile} size="sm" variant="gold">
              Add details
            </ButtonLink>
          </Card>
        )}

        <QuickStats />

        {/* Menu: list on mobile, grid of cards on desktop */}
        <section aria-labelledby="menu-title">
          <h2 id="menu-title" className="mb-3 text-lg font-semibold">
            Manage your account
          </h2>
          <Card as="nav" aria-label="Account navigation" className="divide-y divide-line overflow-hidden lg:hidden">
            {MENU.map(({ key, href, icon: Icon }) => (
              <LocaleLink key={key} href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-muted">
                <Icon className="size-5 shrink-0 text-brand-500 dark:text-gold-400" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{t(`account.nav.${key}`)}</span>
                  <span className="block truncate text-xs text-muted">{t(`account.navDesc.${key}`)}</span>
                </span>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </LocaleLink>
            ))}
          </Card>
          <div className="hidden grid-cols-2 gap-3 lg:grid xl:grid-cols-3">
            {MENU.map(({ key, href, icon: Icon }) => (
              <LocaleLink
                key={key}
                href={href}
                className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-800 dark:text-gold-400">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold group-hover:text-brand-600 dark:group-hover:text-gold-400">{t(`account.nav.${key}`)}</span>
                  <span className="block text-xs text-muted">{t(`account.navDesc.${key}`)}</span>
                </span>
              </LocaleLink>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={() => setConfirm("single")}>
            <LogOut className="size-4" aria-hidden /> Logout
          </Button>
          <Button variant="ghost" className="flex-1 text-red-600 dark:text-red-400" onClick={() => setConfirm("all")}>
            <MonitorSmartphone className="size-4" aria-hidden /> Logout from all devices
          </Button>
        </div>
      </div>

      <AccountConfirmModal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={doLogout}
        loading={busy}
        title={confirm === "all" ? "Log out from all devices?" : "Log out?"}
        description={confirm === "all" ? "This ends your session on every phone, tablet and browser where you're logged in, including this one." : "You'll need to log in again with an OTP to chat or call."}
        confirmLabel={confirm === "all" ? "Logout from all devices" : "Logout"}
      />
    </AccountShell>
  );
}
