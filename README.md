# Codon

**A verified marketplace and reproducibility layer for computational-biology methods.**
GitHub stores code. Codon verifies the method, stamps the output, and licenses the run.

🔗 **Live:** https://codon-six.vercel.app

> Proprietary — © 2026 Samarth Basanth. All rights reserved. (See [LICENSE](./LICENSE).)
> This repository is private / source-available for evaluation, not for reuse.

---

## What it does

Computational-biology methods are usually published as fragile paper code that rarely reproduces. Codon turns a method into **verified, provenance-stamped, licensable software**:

**upload → execute in a real sandbox → diff against expected output → mint a citable stamp → publish → license / run → cite / embed → re-verify on a schedule.**

## Highlights (all real, not mocked)

- **Trusted server-side execution** — uploaded Python is run for real in an isolated **E2B Firecracker microVM**, server-side. The produced output, diff, and content hashes are genuine; a failing run publishes nothing and explains why.
- **In-browser previews** — methods also run client-side via **Pyodide** (CPython → WebAssembly) for instant, free "Run in browser" previews.
- **Reproducibility badge** — a live, embeddable SVG badge (`/badge/<slug>.svg`) that reflects a method's real verification status and flips if it stops reproducing.
- **Scheduled re-verification** — a daily Vercel Cron re-runs every published method in a fresh sandbox and updates the badge automatically.
- **Real auth + data** — Supabase Auth (email + Google + GitHub OAuth) and a jsonb-hybrid Postgres catalog; per-user profiles, dashboards, free licensing, and public profile pages (`/u/<handle>`).
- **Content-addressed verification** — typed-tolerance diffing (exact / numeric atol-rtol / structural / checksum) with SHA-256 hashing.

## Tech stack

- **Next.js** (App Router, React 19, Turbopack) · **TypeScript** · **Tailwind v4**
- **Supabase** (Auth + Postgres) · **E2B** (sandboxed execution) · **Pyodide** (in-browser Python)
- **Vercel** (hosting + Cron) · Framer Motion · next/font

## Architecture (high level)

```
Browser ──► Next.js (App Router, server actions)
               │
               ├─ Supabase Auth      (sessions, OAuth, profiles)
               ├─ Supabase Postgres  (methods catalog, jsonb-hybrid)
               ├─ E2B microVM         (trusted server-side verification)
               ├─ Pyodide (client)    (instant in-browser preview runs)
               └─ Vercel Cron         (nightly re-verification)
```

## Local development

```bash
npm install
# create .env.local with: SUPABASE_URL, SUPABASE_SECRET_KEY, E2B_API_KEY, CRON_SECRET
npm run dev
```

`.env.local` is git-ignored and never committed.

---

Built by **Samarth Basanth**.
