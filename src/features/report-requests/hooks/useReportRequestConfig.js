"use client";

import { useEffect, useState } from "react";
import { reportRequestService } from "@/lib/api/services/reportRequest.service";

const TTL_MS = 60_000;
/** One request per minute, shared by every component on the page. */
let cached = null;

function loadConfig() {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.promise;
  const promise = reportRequestService.getConfig().catch((e) => {
    cached = null; // try again next time
    throw e;
  });
  cached = { promise, at: Date.now() };
  return promise;
}

/** Forget the cached answer (e.g. after REPORTS_OFF so the order buttons hide themselves). */
export function invalidateReportRequestConfig() {
  cached = null;
}

/**
 * "Get a report from an astrologer" settings: { enabled, allowAnyExpert, products }. Undefined while loading,
 * null when it couldn't be read (treated as off, so the older report purchase flow stays in place).
 */
export function useReportRequestConfig() {
  const [config, setConfig] = useState(undefined);
  useEffect(() => {
    let alive = true;
    loadConfig()
      .then((c) => alive && setConfig(c || null))
      .catch(() => alive && setConfig(null));
    return () => {
      alive = false;
    };
  }, []);
  return config;
}

/** True when the dashboard has turned report requests on (account menu entry, etc.). */
export function useReportRequestsEnabled() {
  return Boolean(useReportRequestConfig()?.enabled);
}
