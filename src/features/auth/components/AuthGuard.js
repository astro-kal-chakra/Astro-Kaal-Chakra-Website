"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/Skeleton";
import { useAuth } from "../context/AuthProvider";
import { SITE_LOCALE } from "@/config/locale";

/**
 * Client-side guard for the logged-in area. proxy.js already redirects
 * optimistically; this covers expired sessions detected after load.
 */
export function AuthGuard({ children }) {
  const { status } = useAuth();
  const locale = SITE_LOCALE;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "guest") router.replace(`${routes.login}?next=${encodeURIComponent(pathname)}`);
  }, [status, locale, pathname, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  return children;
}
