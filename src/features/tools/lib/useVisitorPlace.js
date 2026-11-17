"use client";

import { useEffect, useState } from "react";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { IST } from "./format";

/** The browser's own IANA time zone, or null. */
function browserZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/**
 * IP location → a place the panchang can use ({ id, name, region, lat, lng, timezone }), or null to keep the
 * default city. India is always IST. Outside India the IP has no time zone, so the browser's is used; a browser
 * on India time with a foreign IP (a VPN) keeps the default city instead of mixing the two.
 */
function toPlace(loc) {
  if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number" || !loc.name) return null;
  let timezone = loc.timezone;
  if (!timezone) {
    const zone = browserZone();
    if (!zone || zone === IST || zone === "Asia/Calcutta") return null;
    timezone = zone;
  }
  return { id: `ip:${loc.lat},${loc.lng}`, name: loc.name, region: loc.region || "", lat: loc.lat, lng: loc.lng, timezone };
}

// Asked once per page load (a full reload asks again, so a changed network shows straight away)
let lookup = null;
function visitorPlace() {
  lookup ??= astroToolsService
    .getMyPlace()
    .then(toPlace)
    .catch(() => null);
  return lookup;
}

/**
 * The visitor's city from their IP. `undefined` while looking it up, then a place, or null when unknown (keep
 * the default city).
 */
export function useVisitorPlace() {
  const [place, setPlace] = useState(undefined);
  useEffect(() => {
    let live = true;
    visitorPlace().then((p) => live && setPlace(p ?? null));
    return () => {
      live = false;
    };
  }, []);
  return place;
}
