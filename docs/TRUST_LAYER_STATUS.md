# Trust-layer / honesty pass — status

Branch: **`overhaul/trust-layer-honesty`** · local commits only, **not pushed** · not deployed (live site unchanged).
Verified: `npx tsc --noEmit` clean **and** `npm run build` passes. Node at `/opt/homebrew/bin`.

## What changed (this branch, on top of `e2cf836`)

**021b5f6 — Real-only catalog + honest landing.** A verification product cannot ship fabricated data. Removed everything invented; kept only what is genuinely real.
- `src/lib/mockData.ts`: removed 5 fabricated methods, 16 auto-generated fakes, 6 fake institutions, 8 fake labs, and every fake DOI / ORCID / review / usage stat. Catalog is now: real Scanpy (runs real Scanpy in E2B) + 3 Codon reference samples (`cellineage-vi`, `neuroseg3d`, `dockstream-ad`) honestly relabeled to describe the code they actually run. Their output hashes are **real SHA-256 of the actual stdout**, computed on the **trimmed** output to match `pyodide-run.ts` (`sha256Hex(first.trim())`) — the old fabricated hashes would have shown "doesn't reproduce" on a real Run. Institutions/sellers trimmed to Codon + Community.
- Landing (`src/components/landing/landing-markup.ts`): removed the fake "Reproduced across 214 institutions" marquee (Broad/Sanger/MIT/Stanford/Allen…), the fabricated stat counters (12,480 / 38,902 / 214), and 6 testimonial cards bylined to real institutions. Replaced with an honest "how verification works" band, an honest process-stat band (2× runs · SHA-256 · 0 egress · 100% deterministic), and a real 4-method showcase linking to the actual method pages.
- Fixed fabricated-name input placeholders.

**e29bf5f — Cardboard flagship listing.** Added the ED discrete-event simulation as a real, non-trivial method (`cardboard-ed-sim`, field "Simulation / operations"). Represented honestly from `~/cardboard/docs`: validated on the real Isfahan ED dataset (143,582 stays) by holding out 2019 Q4; three pre-registered gates (census CRPS vs seasonal-naive; LOS W1 vs M/M/c, 7/7 seeds; counterfactual boarding). Explicitly surfaces the honest boundary that it does **not** beat empirical replay on the LOS marginal (mean W1: replay 8.61, GT-perfect 9.36, DES 9.67).

**0b96f9b — Machine-readable manifest.** `/methods/<slug>/manifest.json` serves the verification record as JSON (`codon.verification-record/v1`): status, SHA-256 hashes, typed diff, license, provenance. Exposes exactly the stored record; flags held-out-validation methods that don't hash stdout.

## Honesty status
- **Rendered surfaces are clean of fabrication** (catalog, landing, institution/lab pages). Grep sweep + build route table confirm only `codon` / `community` prerender.
- **Forensics engine is genuine** — `src/server/preflight/{grim,grimmer,statcheck,citations,dist}.ts` implement the real tests (GRIM = Brown & Heathers 2017, correct grid math); `analyze.ts` honestly labels statcheck/GRIM/DOI as real+deterministic vs. the AI-text pass as a heuristic. No fix needed.
- **Known dead code (not rendered, low priority):** `landing-runtime.ts::buildInstitutions()` still contains institution wordmark strings, but there are no `[data-inst]` elements anymore, so it renders nothing. Left as-is to avoid an unused-symbol churn; safe to gut later.

## Open decisions (for owner)
1. **Positioning rewrite** — deferred by owner ("keep messaging"). The trust-layer / verified-data-for-AI-labs reframe (hero copy, README, `site.ts`) is NOT done.
2. **Deploy** — when ready: merge `overhaul/trust-layer-honesty` → `main`, push, Vercel redeploys. Nothing here is pushed.
3. **Not built (from the larger plan):** corpus export API (`/api/corpus`), Trust Score unification (execution + forensics → one record), surfacing the forensics panel on method pages, verify-as-a-service intake. Payments intentionally untouched.

## Strategic context
Codon is the chosen focus over Cardboard (same "make claims verifiable" conviction, bigger problem, real infrastructure). Research verdict: "reproducibility as a virtue" is structurally unfunded (Code Ocean pivoted away; Cascad ~€500/paper non-profit; badge efforts are grant/volunteer). The one **proven** willingness-to-pay adjacency is **AI labs paying for verified evals/data** (OpenAI funded SWE-bench Verified, FrontierMath). That, or pharma validation, is where the engine should be pointed — pending owner's customer-discovery call. Cardboard remains valuable as the flagship dogfood listing.
