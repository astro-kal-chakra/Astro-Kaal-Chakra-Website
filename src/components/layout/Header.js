"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, User, Wallet, X } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { LanguageToggle } from "@/features/translate/components/LanguageToggle";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const NAV = [
  { href: routes.astrologers, key: "nav.astrologers" },
  { href: routes.horoscope, key: "nav.horoscope" },
  { href: routes.kundli, key: "nav.kundli" },
  // Secondary links only show on very wide screens (always in the mobile menu + footer).
  { href: routes.kundliMatching, key: "nav.kundliMatching", wideOnly: true },
  { href: routes.panchang, key: "nav.panchang", wideOnly: true },
  { href: routes.live, key: "nav.live" },
  { href: routes.blog, key: "nav.blog" },
];

function AuthArea() {
  const locale = SITE_LOCALE;
  const { status, user, logout } = useAuth();

  if (status === "loading") return <Skeleton className="h-9 w-24 rounded-full" />;
  if (status !== "authenticated") {
    return (
      <ButtonLink href={routes.login} size="sm">
        Login
      </ButtonLink>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <LocaleLink
        href={routes.wallet}
        className="flex h-9 items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200"
      >
        <Wallet className="size-4" aria-hidden />
        <span translate="no" className="notranslate">{formatCurrency(user?.walletBalance ?? 0, locale)}</span>
      </LocaleLink>
      <LocaleLink href={routes.account} className="hidden size-9 items-center justify-center rounded-full border border-line sm:flex" aria-label="My Account">
        <User className="size-4" />
      </LocaleLink>
      <button onClick={() => logout()} className="hidden size-9 items-center justify-center rounded-full border border-line lg:flex" aria-label="Logout">
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  // Menu is "open for a given path", so navigating auto-closes it without an effect.
  const [openOn, setOpenOn] = useState(null);
  const open = openOn === pathname;
  const setOpen = (fn) => setOpenOn(fn(open) ? pathname : null);

  const isActive = (href) => pathname.startsWith(`${href}`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <button className="-ml-2 p-2 xl:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 xl:flex" aria-label="Main">
          {NAV.map((item) => (
            <LocaleLink
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                // Active: saffron text + a short saffron bar under it
                "relative whitespace-nowrap px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg",
                "after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-brand-500 after:opacity-0 after:transition-opacity",
                item.wideOnly && "hidden 2xl:block",
                isActive(item.href) && "text-accent after:opacity-100"
              )}
            >
              {t(item.key)}
            </LocaleLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {/* Phones: compact EN/हिं (guests only, logged-in header is full) · tablet+: full labels */}
          <LanguageToggle variant="compact" className={cn("md:hidden", isAuthenticated ? "hidden sm:inline-flex" : "inline-flex")} />
          <LanguageToggle className="hidden md:inline-flex" />
          <span className="hidden sm:block">
            <ThemeToggle />
          </span>
          <AuthArea />
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-surface xl:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <LocaleLink key={item.href} href={item.href} className="rounded-lg px-2 py-3 font-medium hover:bg-surface-muted">
                {t(item.key)}
              </LocaleLink>
            ))}
            {isAuthenticated && (
              <div className="mt-2 flex flex-col border-t border-line pt-2">
                <LocaleLink href={routes.account} className="flex items-center gap-2 rounded-lg px-2 py-3 font-medium hover:bg-surface-muted">
                  <User className="size-4" aria-hidden /> My Account
                </LocaleLink>
                <LocaleLink href={routes.wallet} className="flex items-center gap-2 rounded-lg px-2 py-3 font-medium hover:bg-surface-muted">
                  <Wallet className="size-4" aria-hidden /> Wallet
                </LocaleLink>
                <button onClick={() => logout()} className="flex items-center gap-2 rounded-lg px-2 py-3 text-left font-medium text-red-600 hover:bg-surface-muted">
                  <LogOut className="size-4" aria-hidden /> Logout
                </button>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-4">
              <LanguageToggle variant="block" className="flex-1" />
              <ThemeToggle />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
