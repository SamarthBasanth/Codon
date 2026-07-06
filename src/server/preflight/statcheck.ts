import { pFromT, pFromF, pFromChi2, pFromR, pFromZ } from "./dist";

/**
 * statcheck — recompute the p-value from a reported NHST statistic and compare
 * it to the reported p. Implements the core of:
 *   Nuijten, Hartgerink, van Assen, Epskamp & Wicherts (2016), "The prevalence
 *   of statistical reporting errors in psychology (1985–2013)", Behavior
 *   Research Methods 48, 1205–1226.  (the method behind statcheck.io)
 *
 * We flag two things the paper defines:
 *  - "inconsistency": reported p ≠ recomputed p (to the reported precision)
 *  - "decision error" (gross): significance at α=.05 flips — the serious kind.
 * Character offsets are returned so the passage can be highlighted in the text.
 */

export interface StatMatch {
  start: number;
  end: number;
  raw: string;
  test: "t" | "F" | "r" | "chi2" | "z";
  reportedP: number;
  reportedOp: "=" | "<" | ">";
  computedP: number;
  status: "consistent" | "inconsistency" | "decision-error";
  oneTailed: boolean;
  detail: string;
}

function parseP(s: string): { val: number; decimals: number } {
  const clean = s.trim();
  const val = parseFloat(clean.startsWith(".") ? "0" + clean : clean);
  const dot = clean.indexOf(".");
  const decimals = dot >= 0 ? clean.length - dot - 1 : 0;
  return { val, decimals };
}

function roundTo(x: number, d: number): number {
  const f = Math.pow(10, d);
  return Math.round(x * f) / f;
}

interface Spec {
  test: StatMatch["test"];
  re: RegExp;
  compute: (g: RegExpMatchArray) => number | null;
}

const SPECS: Spec[] = [
  {
    test: "t",
    re: /\bt\s*\(\s*(\d+(?:\.\d+)?)\s*\)\s*=\s*(-?\d*\.?\d+)\s*,\s*p\s*([=<>])\s*(\d*\.?\d+)/gi,
    compute: (g) => pFromT(Math.abs(parseFloat(g[2])), parseFloat(g[1])),
  },
  {
    test: "F",
    re: /\bF\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)\s*=\s*(-?\d*\.?\d+)\s*,\s*p\s*([=<>])\s*(\d*\.?\d+)/gi,
    compute: (g) => pFromF(parseFloat(g[3]), parseFloat(g[1]), parseFloat(g[2])),
  },
  {
    test: "r",
    re: /\br\s*\(\s*(\d+)\s*\)\s*=\s*(-?\.?\d+)\s*,\s*p\s*([=<>])\s*(\d*\.?\d+)/gi,
    compute: (g) => pFromR(parseFloat(g[2]), parseFloat(g[1])),
  },
  {
    test: "chi2",
    re: /(?:χ2|χ²|chi2|chi-square|X2)\s*\(\s*(\d+(?:\.\d+)?)\s*(?:,\s*N\s*=\s*[\d,]+\s*)?\)\s*=\s*(-?\d*\.?\d+)\s*,\s*p\s*([=<>])\s*(\d*\.?\d+)/gi,
    compute: (g) => pFromChi2(parseFloat(g[2]), parseFloat(g[1])),
  },
  {
    test: "z",
    re: /\bz\s*=\s*(-?\d*\.?\d+)\s*,\s*p\s*([=<>])\s*(\d*\.?\d+)/gi,
    compute: (g) => pFromZ(parseFloat(g[1])),
  },
];

export function runStatcheck(text: string): StatMatch[] {
  const out: StatMatch[] = [];
  for (const spec of SPECS) {
    for (const m of text.matchAll(spec.re)) {
      const computed = spec.compute(m);
      if (computed == null || !Number.isFinite(computed)) continue;
      // The last two capture groups are always [p-operator, p-value].
      const op = m[m.length - 2] as "=" | "<" | ">";
      const { val: reportedP, decimals } = parseP(m[m.length - 1]);
      const start = m.index ?? 0;
      const raw = m[0];

      let status: StatMatch["status"] = "consistent";
      let oneTailed = false;
      const alpha = 0.05;

      if (op === "=") {
        const rc = roundTo(computed, Math.max(decimals, 1));
        const rcHalf = roundTo(computed / 2, Math.max(decimals, 1));
        if (rc === reportedP) status = "consistent";
        else if (rcHalf === reportedP) {
          status = "consistent";
          oneTailed = true;
        } else {
          status = computed <= alpha === reportedP <= alpha ? "inconsistency" : "decision-error";
        }
      } else if (op === "<") {
        if (computed < reportedP) status = "consistent";
        else status = reportedP <= alpha && computed > alpha ? "decision-error" : "inconsistency";
      } else {
        if (computed > reportedP) status = "consistent";
        else status = reportedP >= alpha && computed <= alpha ? "decision-error" : "inconsistency";
      }

      const detail =
        status === "consistent"
          ? oneTailed
            ? "Consistent if one-tailed."
            : "Reported p matches the recomputed value."
          : `Reported p ${op} ${m[m.length - 1]}, but the ${labelFor(spec.test)} recomputes to p = ${computed < 0.001 ? "< .001" : computed.toFixed(3)}` +
            (status === "decision-error" ? " — this flips the significance decision at α = .05." : ".");

      out.push({
        start,
        end: start + raw.length,
        raw,
        test: spec.test,
        reportedP,
        reportedOp: op,
        computedP: computed,
        status,
        oneTailed,
        detail,
      });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

function labelFor(t: StatMatch["test"]): string {
  return t === "chi2" ? "χ² statistic" : `${t}-statistic`;
}
