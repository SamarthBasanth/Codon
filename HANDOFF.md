# Codon — Project Handoff & Operating Manual

> Read this first if you're resuming work (new Claude Code session, new machine, or future you).
> It explains what Codon is, what's real vs. simulated, where everything lives, the keys you need
> (and how to get them safely), and how to run / deploy / continue.

**Live:** https://codon-six.vercel.app · **Owner:** Samarth Basanth · **License:** Proprietary (see `LICENSE`)

---

## 1. What Codon is

A verified marketplace + reproducibility layer for computational-biology methods. The core loop:

> **upload → execute in a real sandbox → diff vs expected → mint a citable stamp → publish → license / run → cite / embed → re-verify on a schedule.**

Tagline: *GitHub stores code. Codon verifies the method, stamps the output, and licenses the run.*

---

## 2. Status — what is REAL vs SIMULATED

**Real (works end-to-end):**
- **Auth** — Supabase Auth: email/password + Google + GitHub OAuth. Real sessions via httpOnly cookies.
- **Trusted verification** — uploaded Python is executed **server-side in an E2B Firecracker microVM** (`src/server/sandbox.ts`), diffed against the declared expected output. Genuine output + SHA-256 hashes. Confirmed live (`/api/sandbox-health?run=1`).
- **In-browser runs** — methods also run client-side via **Pyodide** (CPython→WASM) for instant free previews (`src/lib/pyodide-run.ts`).
- **Reproducibility badge** — live embeddable SVG at `/badge/<slug>.svg`, reflects real status.
- **Scheduled re-verification** — daily Vercel Cron (`/api/cron/reverify`, `vercel.json`) re-runs published methods in E2B and flips the badge if one breaks.
- **Catalog** — 3 curated sample pipelines (in code) + real user uploads (in Supabase). All "Free by Codon" (MIT).
- **Profiles, dashboards, free licensing, public profile pages** (`/u/<handle>`) — all real, backed by Supabase.
- **Public access** — the badge is meant to travel, so all public-facing surfaces are open to anonymous visitors: landing, `/browse`, `/methods/*` + reports, `/labs/*`, `/institutions/*`, `/u/*`, `/badge/*`. Only `/dashboard/*`, `/profile`, `/upload` are auth-gated (`src/proxy.ts`). License/run actions still require a real session server-side.
- **SEO + social** — `robots.txt` + a dynamic `sitemap.xml` (static pages + every method/lab/institution, hourly revalidate). Root + per-method Open Graph/Twitter metadata, and a dynamic branded OG card per method (`methods/[slug]/opengraph-image.tsx`) showing title, summary, and the live verified pill.
- **Mobile** — the landing (injected v4 HTML) is fully responsive (hero stacks, nav collapses, 3D badge fits, no horizontal scroll), and the seller/buyer dashboard tables reflow into stacked cards on phones. App pages are Tailwind-responsive.
- **3D badge** — the orbiting "codon ✓ VERIFIED" pill is the landing embed-band centerpiece and also leads the `/verification` badge section (`src/components/badge-orbit.tsx`). Per-method embed snippet (`EmbedBadge`) on every method page.

**Simulated / not yet built:**
- Heavy/native pipelines beyond what E2B's image has pre-installed (numpy/pandas/scipy/sklearn ARE pre-installed; extra via the upload "packages" field → `pip install`).
- Payments (Stripe) — intentionally none; everything is free today.
- Multi-file method uploads / large datasets via object storage.
- Full-text search/discovery at scale.

---

## 3. Architecture

```
Browser ──► Next.js 16 (App Router, React 19, server actions, Turbopack)
               ├─ Supabase Auth       sessions, OAuth, profiles (in user_metadata)
               ├─ Supabase Postgres   methods catalog (jsonb-hybrid: queryable cols + `data` jsonb)
               ├─ E2B microVM          trusted server-side verification (server-only)
               ├─ Pyodide (client)     instant in-browser preview runs
               └─ Vercel Cron          nightly re-verification → badge flips
```

Key conventions:
- **Next.js 16 breaking changes** (see `AGENTS.md`): middleware is **`src/proxy.ts`** (not `middleware.ts`); `params`/`searchParams` are **async** (await them). Read `node_modules/next/dist/docs/` before non-trivial Next work.
- **Tailwind v4** (CSS `@theme`, semantic tokens in `src/app/globals.css`: brand/surface/danger/success/etc.).
- **`freeByCodon()`** (`src/lib/mockData.ts`) normalizes every method to free + MIT + Codon attribution on read.
- Secret-bearing modules use `import "server-only"` so they can't be bundled to the client.

---

## 4. Repo map (where things live)

```
src/
  app/
    page.tsx                      landing (v4 "CodonLanding" injected HTML + paper theme)
    verification/page.tsx         "How it works" + the badge section (BadgeMint animation, embed)
    badge/[id]/route.ts           LIVE SVG badge endpoint
    robots.ts / sitemap.ts        crawl policy + dynamic sitemap of public pages
    methods/[slug]/page.tsx       method detail (run, license, cite, embed badge, source)
    methods/[slug]/opengraph-image.tsx  dynamic branded social-share card
    browse/page.tsx               catalog grid
    upload/page.tsx               "List a method" (maxDuration=60 for E2B)
    profile/page.tsx              edit profile
    u/[handle]/page.tsx           PUBLIC profile (verified methods)
    dashboard/seller|buyer        personal dashboard + library (real data)
    api/cron/reverify/route.ts    scheduled re-verification (CRON_SECRET-gated)
    api/sandbox-health/route.ts   E2B health probe (?run=1 executes)
  components/
    upload-wizard.tsx             upload flow → server-side E2B verify
    run-button.tsx                Pyodide in-browser run modal
    license-panel.tsx, license-button.tsx, embed-badge.tsx, badge-mint.tsx, profile-editor.tsx …
    landing/                      v4 landing: landing-markup.ts (HTML), landing-runtime.ts (JS), codon-landing.tsx
  server/                         (all server-only)
    sandbox.ts                    E2B microVM runner  ← trusted execution
    method-actions.ts             submitMethod() — upload → E2B verify → publish
    reverify.ts                   reverifyAll() — re-run + flip status
    methods.ts                    data layer (catalog = curated 3 + DB uploads)
    profile-actions.ts            get/update profile (user_metadata)
    license-actions.ts            free licensing + run records (user_metadata)
    auth-actions.ts, session.ts, supabase.ts, verify/  (typed-tolerance diff + hashing)
  lib/
    pipelines.ts                  3 curated runnable Python pipelines + resolvePipeline()
    pyodide-run.ts                client-side Pyodide runner
    mockData.ts                   types, taxonomies, curated methods, freeByCodon()
    utils.ts                      cn, formatters, initialsOf, handleFrom
supabase/schema.sql               DB schema (institutions/sellers/methods) + RLS + seed
vercel.json                       cron schedule
```

---

## 5. Keys & environment (the safe part)

**Never commit real secrets.** They live only in (a) Vercel's encrypted env store and (b) your local git-ignored `.env.local`. The repo ships `.env.example` (placeholders only).

| Var | Purpose | Where to get / manage |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL (not secret) | `https://ijfgonujgdytykfyxjlf.supabase.co` |
| `SUPABASE_SECRET_KEY` | Service key, bypasses RLS, **server-only** | Supabase → Settings → API Keys (rotate here if leaked) |
| `SUPABASE_JWKS_URL` | JWT verification | derived from project URL |
| `E2B_API_KEY` | Trusted sandbox execution | https://e2b.dev/dashboard → API Keys |
| `CRON_SECRET` | Auth for `/api/cron/*` (Vercel sends as Bearer) | any random hex; set same value in Vercel |

**To recreate `.env.local` on a fresh checkout (recommended):**
```bash
npm i -g vercel        # if needed
vercel login
vercel link            # choose the "codon" project (scope: samarth-basanth-s-projects)
vercel env pull .env.local   # pulls the real encrypted values down (stays git-ignored)
```
Or manually `cp .env.example .env.local` and paste values from your password manager / Vercel dashboard.

**Deploy token:** deploys use a Vercel access token (a secret — kept by the owner, NOT in the repo). Create one at Vercel → Account → Tokens.

---

## 6. External services / accounts

- **Supabase** project `ijfgonujgdytykfyxjlf` — Auth + Postgres. Schema in `supabase/schema.sql` (run in SQL editor if re-seeding). OAuth providers (Google, GitHub) are configured in Supabase → Auth → Providers; callback URL `https://ijfgonujgdytykfyxjlf.supabase.co/auth/v1/callback`. Google OAuth app is in "Testing" mode (add test users) — GitHub OAuth app: client id `Ov23li…`.
- **E2B** — sandbox provider (free tier). Key in env.
- **Vercel** — project `codon`, scope `samarth-basanth-s-projects`, alias `codon-six.vercel.app`. Cron registered via `vercel.json`. Env vars set encrypted.
- **GitHub** — backup repo `https://github.com/SamarthBasanth/Codon.git` (keep **Private** — proprietary source).

---

## 7. Run / build / deploy

```bash
npm install
npm run dev                 # http://localhost:3000
npx tsc --noEmit            # type-check
npm run build               # production build (must pass before deploy)
# deploy (owner runs, with their Vercel token):
npx vercel deploy --prod --yes --token <VERCEL_TOKEN> --scope samarth-basanth-s-projects
```

---

## 8. How to resume in a NEW Claude Code terminal

1. `git clone https://github.com/SamarthBasanth/Codon.git && cd Codon`
2. `npm install`
3. Recreate secrets: `vercel link && vercel env pull .env.local`  (or `cp .env.example .env.local` + paste values)
4. `npm run dev` to verify it boots.
5. Read **this file** + **`AGENTS.md`** for context and Next.js-16 gotchas, then continue.

---

## 9. Roadmap (next bets — product decisions, not plumbing)

These remaining items need an **owner action / account** (not just code):
- **Payments / paid tier (Stripe)** — requires a Stripe account + keys. Intentionally not built yet.
- **Move Google OAuth out of "Testing"** — done in Google Cloud Console + Supabase (OAuth consent screen verification), not in this repo. Until then Google sign-in only works for allow-listed test users; email/password + GitHub OAuth work for everyone.
- **Multi-file methods + larger inputs via object storage (S3/R2)** — needs a storage provider account + keys.

Pure-code follow-ups (no account needed):
- Search & discovery improvements as the catalog grows.
- A `twitter-image` variant (currently Twitter falls back to the OG card, which is fine).
