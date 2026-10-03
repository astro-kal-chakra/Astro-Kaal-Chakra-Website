"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Skeleton";
import { SITE_LOCALE } from "@/config/locale";

/**
 * Auth guard for full-screen sessions. Unlike the account AuthGuard it does
 * NOT navigate away when the login expires mid-session: the screen stays
 * mounted behind a "login expired" overlay so the user can log back in and
 * carry on without losing the chat.
 */
export function SessionAuthGate({ children }) {
  const { status, requireAuth } = useAuth();
  const locale = SITE_LOCALE;
  const router = useRouter();
  const pathname = usePathname();
  const [wasAuthenticated, setWasAuthenticated] = useState(false);

  // Adjust state during render: remember that this screen had a live login.
  if (status === "authenticated" && !wasAuthenticated) setWasAuthenticated(true);

  useEffect(() => {
    if (status === "guest" && !wasAuthenticated) {
      router.replace(`${routes.login}?next=${encodeURIComponent(pathname + location.search)}`);
    }
  }, [status, wasAuthenticated, locale, pathname, router]);

  if (!wasAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {children}
      {status === "guest" && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="session-login-expired"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
        >
          <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-200">
              <LogIn className="size-7" aria-hidden />
            </div>
            <h2 id="session-login-expired" className="text-lg font-semibold">
              Your login has expired
            </h2>
            <p className="mt-1 text-sm text-muted">Log in again to continue this session. Your conversation is safe.</p>
            <Button className="mt-5 w-full" size="lg" onClick={() => requireAuth(null, "expired")}>
              Log in again
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
