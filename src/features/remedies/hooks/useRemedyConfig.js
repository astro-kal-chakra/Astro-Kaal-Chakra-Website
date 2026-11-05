"use client";

import { useEffect, useState } from "react";
import { remedyService } from "@/lib/api/services/remedy.service";

const TTL_MS = 60_000;
/** One request per astrologer (or "" for the global switch) per minute, shared by every component. */
const cache = new Map();

function loadConfig(astrologerId = "") {
  const hit = cache.get(astrologerId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;
  const promise = remedyService.getConfig(astrologerId || undefined).catch((e) => {
    cache.delete(astrologerId); // try again next time
    throw e;
  });
  cache.set(astrologerId, { promise, at: Date.now() });
  return promise;
}

/** Forget cached answers (e.g. after REMEDIES_OFF / NOT_ACCEPTING so the UI hides itself). */
export function invalidateRemedyConfig() {
  cache.clear();
}

/**
 * Remedy settings for an astrologer's profile (`available` = this astrologer takes requests now), or the
 * global switch when no id is given. `config` is undefined while loading and null when it couldn't be read
 * (treated as off, so nothing remedy-related shows).
 */
export function useRemedyConfig(astrologerId) {
  const key = astrologerId || "";
  const [state, setState] = useState({ key, config: undefined });
  if (state.key !== key) setState({ key, config: undefined });

  useEffect(() => {
    let alive = true;
    loadConfig(key)
      .then((config) => alive && setState({ key, config }))
      .catch(() => alive && setState({ key, config: null }));
    return () => {
      alive = false;
    };
  }, [key]);

  return state.key === key ? state.config : undefined;
}

/** True when the dashboard has turned remedies on (account menu entry, etc.). */
export function useRemediesEnabled() {
  return Boolean(useRemedyConfig()?.enabled);
}
