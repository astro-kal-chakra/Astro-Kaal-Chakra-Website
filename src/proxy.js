import { NextResponse } from "next/server";
import { AUTH_HINT_COOKIE } from "@/config/site";
import { GUEST_ONLY_PREFIXES, PROTECTED_PREFIXES } from "@/config/routes";
import { defaultLocale } from "@/config/locale";

/** Old locale-prefixed URLs (/en/..., /hi/...) permanently redirect to clean URLs. */
const LEGACY_PREFIXES = ["en", "hi"];

const startsWithAny = (path, prefixes) => prefixes.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * 1. Redirect legacy /en and /hi URLs to clean ones.
 * 2. Optimistic auth redirects using a non-sensitive hint cookie
 *    (real authorization is always enforced by the backend API).
 * 3. Rewrite clean URLs to the internal app/[lang] tree.
 */
export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (LEGACY_PREFIXES.includes(first)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(first.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  const loggedIn = request.cookies.has(AUTH_HINT_COOKIE);

  if (!loggedIn && startsWithAny(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (loggedIn && startsWithAny(pathname, GUEST_ONLY_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals, metadata files and anything with a file extension.
  matcher: ["/((?!api|_next|_vercel|sitemap.xml|robots.txt|manifest.webmanifest|.*\\..*).*)"],
};
