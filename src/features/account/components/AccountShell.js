"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { cn } from "@/lib/utils/cn";
import { maskPhone } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ACCOUNT_NAV } from "../lib/nav";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

/** Sidebar navigation (desktop). Exported so other account-area pages can reuse it. */
export function AccountSidebarNav({ className }) {
  const locale = SITE_LOCALE;
  const { user } = useAuth();
  const pathname = usePathname();
  const rel = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
  const isActive = (href) => (href === routes.account ? rel === href : rel === href || rel.startsWith(`${href}/`));

  return (
    <nav aria-label="Account navigation" className={cn("rounded-2xl border border-line bg-surface p-3 shadow-sm", className)}>
      <div className="mb-2 flex items-center gap-3 border-b border-line px-2 pb-3">
        <Avatar name={user?.name || "U"} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user?.name || "My Account"}</p>
          {user?.phone && <p className="text-xs text-muted">+91 {maskPhone(user.phone)}</p>}
        </div>
      </div>
      <ul className="space-y-0.5">
        {ACCOUNT_NAV.map(({ key, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={key}>
              <LocaleLink
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-800 dark:text-gold-300"
                    : "text-muted hover:bg-surface-muted hover:text-fg"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {t(`account.nav.${key}`)}
              </LocaleLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Layout for every account page: sticky sidebar on desktop, a back link on
 * mobile (where the dashboard itself is the menu), page heading + actions.
 * `back` ({ href, label }) overrides the back link and shows it on desktop too.
 */
export function AccountShell({ title, subtitle, actions, back, hideMobileBack = false, children }) {
  const backLink = back || { href: routes.account, label: "My Account" };

  return (
    <div className="lg:grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
      <aside className="hidden lg:block">
        <AccountSidebarNav className="sticky top-24" />
      </aside>

      <div className="min-w-0">
        {!hideMobileBack && (
          <LocaleLink
            href={backLink.href}
            className={cn("mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg", !back && "lg:hidden")}
          >
            <ArrowLeft className="size-4" aria-hidden /> {backLink.label}
          </LocaleLink>
        )}
        {title && (
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
