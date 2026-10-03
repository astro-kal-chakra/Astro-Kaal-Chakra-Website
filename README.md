# Astro Web — User Website

Web version of the user app plus SEO pages. Same backend, APIs, wallet and accounts as the mobile app.

**Stack:** Next.js 16 (App Router, JavaScript) · React 19 · Tailwind CSS v4 · Socket.io client · lucide-react
**Runtime:** Node.js 24 LTS

## Getting started

```bash
cp .env.example .env.local   # optional — without NEXT_PUBLIC_API_URL the app runs on mock data
npm install
npm run dev                  # http://localhost:3000
```

Mock mode: login with any valid Indian mobile number and OTP `123456`.

## Folder structure

```
src/
├── app/                          # Routing only — pages stay thin
│   ├── [lang]/                   # Internal segment (always "en"); proxy.js rewrites clean URLs here
│   │   ├── layout.js             # <html>, fonts, providers, theme script
│   │   ├── (site)/               # Header + footer chrome
│   │   │   ├── page.js           # Home (SSR)
│   │   │   ├── astrologers/      # Listing + [slug] profile (SSG + live status)
│   │   │   ├── horoscope/        # [period]/[sign] — 96 static SEO pages
│   │   │   ├── legal/[slug]/     # Privacy, Terms, Refund, Disclaimer
│   │   │   ├── (auth)/           # login, onboarding (noindex)
│   │   │   └── (account)/        # wallet, account (noindex, AuthGuard)
│   │   └── (session)/            # Full-screen chat / call (noindex)
│   ├── sitemap.js · robots.js · manifest.js · global-not-found.js
├── proxy.js                      # Clean-URL rewrite, legacy /en|/hi redirects, optimistic auth redirects
├── config/                       # site.js (brand, env), routes.js (all paths), locale.js (formatting locale)
├── constants/                    # zodiac, astrologer enums, filters
├── lib/
│   ├── api/http.js               # fetch wrapper: cookies, 401 → refresh, ApiError
│   ├── api/services/*.service.js # One file per domain; mock fallback built in
│   ├── api/mock/                 # Mock data (removed once backend is live)
│   ├── socket/                   # Socket.io singleton + event names
│   ├── seo/                      # buildMetadata (canonical + hreflang), JSON-LD builders
│   ├── labels.js                 # Runtime label maps (enums, catalogues) + label() helper
│   └── utils/                    # cn, formatters
├── providers/                    # Theme, Toast, Socket, AppProviders
├── hooks/                        # Generic hooks (countdown, network, debounce, storage)
├── components/
│   ├── ui/                       # Design system primitives (Button, Card, Modal, ...)
│   ├── layout/                   # Header, Footer, banners, language switcher
│   └── seo/                      # JsonLd
└── features/                     # Domain modules: components + hooks + context
    ├── astrologers/  auth/  horoscope/  home/  wallet/  legal/
```

### Conventions

- **Server Components by default.** Add `"use client"` only for interactivity. Public pages are SSR/SSG for SEO; logged-in pages render client-side.
- **Never hardcode paths** — use `routes` from `@/config/routes` and `<LocaleLink>` (auto-prefixes the locale).
- **Language:** the site is authored in English. Visitors switch language with **Google Translate** (`src/features/translate`, languages in `features/translate/config.js`). URLs are locale-free (`/astrologers`); old `/en/*` and `/hi/*` links 308-redirect.
- **UI text is written inline** in components (English). Text looked up by key at runtime — status names, planet/nakshatra names, report catalogue, form option lists — lives in `src/lib/labels.js` (`label("status.online")`).
- **Translation-safe UI:** text that updates in place every second must be wrapped in `<span translate="no" className="notranslate">` (numbers) or given a changing `key` (sentences) — otherwise Google Translate freezes it. Brand name and avatar initials are `notranslate`.
- **API calls only through services** in `lib/api/services`. Components never call `fetch` directly.
- **Billing is server-side only.** Timers in the browser are display-only; balance comes from `session:billing` socket events.
- **Wallet is credited only by the backend** after the verified Cashfree webhook.
- **Auth:** tokens are httpOnly cookies set by the API. `logged_in` is a non-sensitive hint cookie for proxy redirects.
- **Gate actions, not browsing:** use `requireAuth(action)` from `useAuth()` for chat / call / recharge / save.
- **Next.js 16:** `params` / `searchParams` are Promises (`await params`); `middleware` is now `proxy.js`.

## Status

**All UI screens are built on mock data.** Every service in `src/lib/api/services/` has a mock branch (`env.useMocks`) and a real `http()` branch — set `NEXT_PUBLIC_API_URL` and implement the endpoints listed in each service's JSDoc to go live. Mock-only helpers (QA simulator panel on chat/call, mock Cashfree checkout) render only in mock mode.

| Area | Routes | Integration left |
|---|---|---|
| Public discovery | `/`, `/astrologers`, `/astrologers/[slug]` | API + Socket.io presence |
| Horoscope | `/horoscope`, `/horoscope/[period]/[sign]` | Content API |
| Free tools | `/kundli`, `/kundli-matching`, `/panchang`, `/zodiac-sign-finder`, `/numerology` | Backend calculations (finder + numerology are already real) |
| Content | `/blog`, `/blog/[slug]`, `/about`, `/how-it-works`, `/faqs`, `/contact`, `/become-astrologer` | CMS, form endpoints, document upload |
| Reports | `/reports`, `/reports/[slug]`, `/account/reports` | Report API |
| Live (phase 2) | `/live`, `/live/[id]` | Agora live streaming, socket |
| Auth | `/login`, `/onboarding` | OTP API |
| Wallet | `/wallet`, `/wallet/transactions`, `/wallet/payment/[orderId]` | Cashfree SDK (`features/wallet/lib/cashfree.js`) |
| Sessions | `/consult`, `/chat/[id]`, `/call/[id]`, `/session/[id]/summary` | Socket.io (`useSessionTransport`), Agora (`features/session/lib/rtcClient.js`) |
| Account | `/account/*` (profile, profiles, sessions, following, kundlis, referral, notifications, support, settings) | User APIs, FCM web push token |

Mock tips: OTP `123456`; demo wallet balance ₹300; chat/call screens have a flask button to simulate drops, low balance, astrologer/admin end, login expiry; `/consult?...&simulate=reject|timeout` forces outcomes.
