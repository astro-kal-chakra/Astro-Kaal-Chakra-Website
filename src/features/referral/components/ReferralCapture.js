"use client";

import { useEffect } from "react";
import { rememberReferral } from "../lib/pending";

/** Remembers `?ref=CODE` from a friend's share link on whichever page it lands on. */
export function ReferralCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) rememberReferral(ref);
  }, []);
  return null;
}
