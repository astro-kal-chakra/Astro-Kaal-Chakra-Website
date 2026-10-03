"use client";

import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const online = useNetworkStatus();
  if (online) return null;
  return (
    <div role="alert" className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <WifiOff className="size-4" aria-hidden />
      {"You're offline. Some features may not work until you reconnect."}
    </div>
  );
}
