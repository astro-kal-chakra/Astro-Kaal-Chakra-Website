"use client";

import Link from "next/link";

/**
 * App link. URLs are locale-free (/astrologers); kept as a wrapper so every
 * internal link goes through one place if locale prefixes ever come back.
 */
export function LocaleLink(props) {
  return <Link {...props} />;
}
