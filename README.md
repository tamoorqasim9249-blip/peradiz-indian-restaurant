# Peradiz Indian Restaurant — Al Olaya (Riyadh) Website

مطعم بيراديز الهندي - العليا | A premium, bilingual (Arabic/English) website for Peradiz Indian
Restaurant's Al Olaya branch in Riyadh, Saudi Arabia — including a Claude-powered AI assistant
and a contact/reservation-request flow.

Full development specification: [`CLAUDE.md`](CLAUDE.md). Original research + build plan:
`C:\Users\Cyber World\.claude\plans\role-you-are-replicated-popcorn.md`.

## What This Project Is

A production-ready Next.js marketing site for a single restaurant branch. It presents verified
brand/location/menu information (no invented facts — see [`CLAUDE.md` §2 and §21](CLAUDE.md)),
lets visitors send a contact message or a reservation *request* (staff confirm by phone — this
is not live table booking), and offers an AI chatbot grounded only in the restaurant's real,
verified data.

## Features

- Bilingual UI — English (default, LTR) and Arabic (secondary, RTL), locale-prefixed routes
  (`/en`, `/ar`)
- Home, Menu, About, Gallery, Contact, and Reservations pages
- Contact form and reservation-request form, validated and persisted to PostgreSQL
- Claude-powered chatbot (floating widget, site-wide) that answers questions using only
  verified restaurant facts and declines to guess at anything unverified (prices, exact hours,
  chef bio)
- `Restaurant` JSON-LD structured data, per-route metadata, sitemap/robots, hreflang
- Security headers, rate limiting, zod validation on every API route
- Placeholder image slots ready to be swapped for real photography with no code changes

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript, React |
| Styling | Tailwind CSS (native logical properties for RTL — no extra RTL plugin) |
| i18n | `next-intl` |
| Database | PostgreSQL |
| ORM | Prisma |
| AI | `@anthropic-ai/sdk` (Claude, model `claude-sonnet-5`) |
| Validation | `zod` |
| Forms | `react-hook-form` + `@hookform/resolvers/zod` |
| Testing | Vitest (unit) + Playwright (e2e smoke tests) |

## Installation

Prerequisites: Node.js 20+, npm, and access to a PostgreSQL database (local Postgres, or a
managed instance such as Neon/Supabase/Vercel Postgres).

```bash
npm install
```

## Environment Setup

Copy the example env file and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/peradiz` |
| `ANTHROPIC_API_KEY` | Yes (for the chatbot) | Server-only Anthropic API key — get one at https://console.anthropic.com/ |
| `NEXT_PUBLIC_SITE_URL` | Yes for correct SEO/OG URLs | e.g. `http://localhost:3000` in dev, real domain in prod |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Optional. Enables the interactive map marker; without it the location section shows a free, keyless map embed instead. See "Google Maps" below before setting a real value. |

Never commit `.env.local` — it's gitignored. `ANTHROPIC_API_KEY` is server-only and is never
sent to the browser.

### Google Maps

The location section works out of the box with no key (a free `output=embed` iframe). To
upgrade it to a real interactive map with a marker and info window, provision a **restricted**
key in [Google Cloud Console](https://console.cloud.google.com/google/maps-apis):

1. Create an API key under **APIs & Services → Credentials**.
2. **Restrict the API**: under "API restrictions", limit the key to **Maps JavaScript API**
   only.
3. **Restrict the application**: under "Application restrictions", choose **HTTP referrers** and
   add this site's own domain(s) only — e.g. `localhost:3000/*` for local dev, your real
   production domain for prod. Never leave a key unrestricted.
4. Use a **separate key per environment** (one for local dev, a different one for production) —
   never share the same key across environments.
5. Paste the restricted key into `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

This key is intentionally exposed to the browser (`NEXT_PUBLIC_*` is inlined into client code by
Next.js at build time) — the referrer + API restrictions above are its security boundary, not
secrecy. It is never the same credential class as `ANTHROPIC_API_KEY` or `DATABASE_URL`, which
must stay server-only and must never be given a `NEXT_PUBLIC_` name.

## Development

```bash
npx prisma generate        # generate the Prisma Client (run after install / schema changes)
npx prisma migrate dev     # apply the Prisma schema to your dev database
npm run dev                # start the dev server at http://localhost:3000
```

`prisma`/`@prisma/client` are pinned to the exact stable `6.19.3` release (not `^7.x`) —
Prisma 7 removed the classic `datasource { url = env("DATABASE_URL") }` + `new PrismaClient()`
pattern this project uses in favor of a `prisma.config.ts` + driver-adapter setup, which would
add a dependency and a config file this project doesn't otherwise need. Don't `npm update` past
Prisma 6 without deliberately migrating `prisma/schema.prisma` and `src/lib/prisma.ts` to that
new architecture first.

Visit `/en` (default) or `/ar`. The chatbot widget requires `ANTHROPIC_API_KEY` to respond —
without it, it shows a graceful "currently unavailable" state rather than failing the build.

Other scripts:

```bash
npm run lint        # ESLint
npm run typecheck    # tsc --noEmit
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright e2e smoke tests
npx prisma studio     # inspect ContactSubmission / ReservationRequest rows
```

## Frontend

- App Router with a `[locale]` segment (`src/app/[locale]/...`); `middleware.ts` handles
  locale routing via `next-intl` (`/` → `/ar`).
- Content (restaurant facts, menu, gallery) lives in typed TS modules under `content/`, kept
  separate from UI-chrome translation strings (`content/i18n/{ar,en}.json`) — see
  [`CLAUDE.md` §6](CLAUDE.md).
- Editing copy or swapping a placeholder image never requires touching a component: edit the
  relevant file in `content/` or drop a same-named file into `public/images/`.

### Photo Gallery

`/gallery` (`src/app/[locale]/gallery/page.tsx`) is a masonry-grid photo gallery with category
filtering (exterior, interior, dining area, signature dishes, presentation, atmosphere) and a
keyboard- and swipe-navigable lightbox (`src/components/sections/{GalleryGrid,Lightbox}.tsx`).

Several entries (`exterior-1`, `exterior-2`, `interior-1`, `interior-2`, `interior-3`,
`presentation-1`) now hold real, owner-supplied photos; the rest are still an on-brand gradient
**placeholder** — see `content/gallery/images.ts`. Real restaurant photography must come from a
license that permits redistribution (owner-supplied photos, a licensed shoot, or properly
licensed stock) — Google Maps/Instagram photos, for example, cannot be downloaded and reused
without the rights holder's permission (see CLAUDE.md §20). To add more real photos:

1. Get photography you have the rights to use (owner-supplied photos, a licensed shoot, or
   stock images licensed for this specific use).
2. Save each one at the exact path referenced by the matching entry in
   `content/gallery/images.ts` (or add a new entry there) — no component changes needed.
3. Update that entry's `width`/`height` to the real image's dimensions (used for the masonry
   layout and to prevent layout shift) and its `altAr`/`altEn` to describe the actual photo.

`scripts/generate-gallery-images.mjs` regenerates the placeholder set if you need to add more
before real photography is available.

## Backend

Three API routes only — `POST /api/contact`, `POST /api/reservations`, `POST /api/chat`
(streaming). Every route validates input with `zod`, rate-limits per IP, and checks
`Origin`/`Referer` as CSRF defense-in-depth on state-changing routes. See
[`CLAUDE.md` §7 and §9](CLAUDE.md).

## Database

PostgreSQL via Prisma, two models: `ContactSubmission` and `ReservationRequest` (schema in
[`prisma/schema.prisma`](prisma/schema.prisma), documented in
[`CLAUDE.md` §8](CLAUDE.md)). Menu, gallery, and restaurant-fact content is intentionally
**not** database-backed — it's static, version-controlled, and equally easy to edit without the
overhead of an admin CRUD system.

```bash
npx prisma migrate dev --name <change-description>   # create + apply a migration
npx prisma studio                                     # browse data
```

## AI Chatbot

The chatbot (`/api/chat`) calls the Claude API server-side only, streaming its reply to the
`ChatWidget`. Its system prompt is built exclusively from `content/restaurant-facts.ts` and
`content/menu/items.ts` — it cannot answer with a fact those files don't contain, and it's
instructed to say "please call the restaurant" rather than guess at prices, full weekly hours,
or chef identity. It has no tool-use/function-calling ability and cannot take actions (no
bookings, no emails) — full rules in [`CLAUDE.md` §11](CLAUDE.md).

Requires `ANTHROPIC_API_KEY` in the environment. Without it, the widget degrades gracefully
instead of erroring.

## Security

Security headers (CSP, HSTS, X-Frame-Options, etc.) are set in `next.config.ts`; every API
route validates with `zod` and is rate-limited; forms use a honeypot field instead of a paid
CAPTCHA; secrets are environment-variable-only and never logged or shipped to the client. Full
checklist in [`CLAUDE.md` §10](CLAUDE.md). Run the `security-review` skill for a dedicated audit
pass before shipping any change touching auth, forms, or the chatbot.

## Testing

```bash
npm run test        # Vitest: zod schemas, chatbot system-prompt regression guard, JSON-LD shape,
                     #   the /api/* route kernel (rate limiting, origin/CSRF checks, error
                     #   envelopes never leaking secrets), and every route handler (menu,
                     #   restaurant, hours, map, contact, reservations, chat)
npm run test:e2e     # Playwright: locale/RTL + nav, contact form, reservation form, chatbot happy
                     #   path — each spec runs against both a Desktop and a Mobile Chrome project
npm run lint && npm run typecheck
```

`npm run test:e2e` starts the dev server itself (see `playwright.config.ts`) and needs the
Chromium browser installed once via `npx playwright install chromium`. Its specs mock the
contact/reservation/chat network calls (`page.route`) rather than hitting a real database or the
Anthropic API — see the comment at the top of `playwright.config.ts`.

Test scope is intentionally proportionate to a single-branch marketing site — see
[`CLAUDE.md` §19](CLAUDE.md) for what's deliberately out of scope (CI pipeline, visual
regression, load testing) and why.

## Production Deployment

Deployment is a separate, explicitly-approved step, not bundled into the initial build. When
ready:

1. Provision a production PostgreSQL database (e.g. Neon, Supabase, or Vercel Postgres) and set
   `DATABASE_URL`.
2. Set `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_SITE_URL` (the real production domain) in the
   hosting platform's environment variable settings.
3. Run `npx prisma migrate deploy` against the production database.
4. Deploy (a Vercel MCP toolset is available in this environment on request).
5. Re-verify the SEO pass — absolute OG/canonical URLs depend on `NEXT_PUBLIC_SITE_URL` being
   correct in production.

Full details in [`CLAUDE.md` §16](CLAUDE.md).
