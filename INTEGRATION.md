# Codon — integration guide

Status: **Phase 1 frontend complete and running** (`npm run dev` → http://localhost:3000),
plus the groundwork that makes the incoming Claude Design visuals a drop-in and gives the
product real backend logic. Everything here runs locally on mock data — no external services.

---

## 1. Dropping in the Claude Design hero / visuals

The landing hero is isolated behind a single slot.

- **Swap point:** [`src/components/hero/`](src/components/hero/). `page.tsx` imports only
  `Hero` from the barrel ([`index.ts`](src/components/hero/index.ts)).
- To use the generated version: paste it as `src/components/hero/hero.tsx` (or add
  `hero-v2.tsx` and change the one re-export in `index.ts`). Nothing else changes.
- If it needs cursor motion, mark it `"use client"` and compose the primitives below.

### Motion primitives ([`src/components/motion/`](src/components/motion/))
All are `prefers-reduced-motion` aware (they no-op or fall back gracefully).

| Primitive | Use |
|---|---|
| `<Spotlight />` | Fixed radial glow that follows the cursor — drop near the top of the hero |
| `<Tilt>` | 3D tilt-toward-cursor wrapper — wrap the central artifact card |
| `<Float>` | Gentle drift for orbiting pop-out chips (ORCID, hash, lock, DOI) |
| `<ScanBeam />` | The emerald "verification scan" sweep — put inside a `relative overflow-hidden` card |
| `<Reveal>` | Scroll-triggered fade + rise for sections (e.g. the verify flow) |
| `useMouse()` | Normalized cursor position for custom parallax |

```tsx
import { Spotlight, Tilt, Float, ScanBeam } from "@/components/motion";
```

### Design tokens to match (already in [`globals.css`](src/app/globals.css))
- bg `#08090b` · surface `#101216` · border `#20242b`
- brand emerald `#14b885` (`bg-brand`, `text-brand`, `border-brand`)
- accent `#818cf8` · text `#f4f5f6` · muted `#9098a3`
- fonts: `--font-sans` (Geist), `--font-mono` (Geist Mono)

Use the semantic classes (`bg-card`, `text-muted-foreground`, `border-border`, `text-brand`)
so the visuals inherit light/dark automatically.

---

## 2. The backend that's already real

### Verification engine — [`src/server/verify/`](src/server/verify/)
Not mocked. Real typed-tolerance comparison + content hashing:
- `compareExact`, `compareNumeric` (atol/rtol over parsed matrices), `compareStructural`
  (deep JSON with float tolerance), `compareChecksum`
- `verifyOutputs(comparisons)` → `{ pass, diffs, expectedOutputHash, actualOutputHash }`
- `contentHash()` — real SHA-256 (the stamp primitive)

### Server data layer — [`src/server/methods.ts`](src/server/methods.ts)
Async, filterable, DB-ready. **This is the only seam to swap when the DB goes live.**

### API routes (live now — try them)
```bash
curl localhost:3000/api/methods                 # list + ?q= &field= &language= &verified=true &sort=runs
curl localhost:3000/api/methods/cellineage-vi   # one method (full detail)
curl "localhost:3000/api/search?q=docking"      # search
curl localhost:3000/api/verify                  # runs the real engine on a demo → pass/fail + deltas
```

---

## 3. Turning on the database (Phase 2)

The canonical data model is authored at [`prisma/schema.prisma`](prisma/schema.prisma)
(Postgres + enums) with a seed ([`prisma/seed.ts`](prisma/seed.ts)) that maps the current
dataset in. It's intentionally **not wired yet** — the app runs on mock data so the demo needs
nothing. To go live:

```bash
npm i -D prisma && npm i @prisma/client
# set DATABASE_URL in .env.local (see .env.example) — Neon/Supabase free, or local Docker
npx prisma migrate dev --name init
npx prisma db seed
```
Then change the bodies of `src/server/methods.ts` to query Prisma. Pages and routes don't change.

---

## 4. Commands
```bash
npm run dev      # http://localhost:3000
npm run build    # production build (37 static pages)
npx tsc --noEmit # type-check
```
