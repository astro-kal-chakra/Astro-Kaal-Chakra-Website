"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Skeleton";

/**
 * A page type that exists but an item that doesn't (e.g. /astrologers/unknown-name, an old blog post):
 * take the visitor straight to the home page instead of showing a dead end.
 */
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <main className="container-page flex flex-1 flex-col items-center justify-center gap-3 py-20 text-sm text-muted">
      <Spinner />
      <p>Taking you to the home page…</p>
    </main>
  );
}
