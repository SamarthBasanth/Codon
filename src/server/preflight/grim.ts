/**
 * GRIM (Granularity-Related Inconsistency of Means) —
 *   Brown & Heathers (2017), "The GRIM Test: A Simple Technique Detects
 *   Numerous Anomalies in the Reporting of Results in Psychology", Social
 *   Psychological and Personality Science 8(4), 363–369.
 *
 * A mean of N integer responses (optionally an average of `items` integer
 * items) can only take values on a grid of size 1/(N·items). If a reported mean
 * doesn't fall on that grid (to the reported precision), it is arithmetically
 * impossible — a strong signal of a typo, error, or fabrication. GRIM is only
 * informative when N·items < 10^decimals, so we skip cases where the grid is
 * finer than the reported precision.
 */

export interface GrimMatch {
  start: number;
  end: number;
  raw: string;
  mean: number;
  n: number;
  items: number;
  consistent: boolean;
  nearest: number;
  detail: string;
}

function decimalsOf(numStr: string): number {
  const dot = numStr.indexOf(".");
  return dot >= 0 ? numStr.length - dot - 1 : 0;
}
function roundTo(x: number, d: number): number {
  const f = Math.pow(10, d);
  return Math.round((x + Number.EPSILON) * f) / f;
}

export function grimConsistent(
  meanStr: string,
  n: number,
  items = 1,
): { consistent: boolean; nearest: number; informative: boolean } {
  const decimals = decimalsOf(meanStr);
  const mean = parseFloat(meanStr);
  const NI = n * items;
  if (NI <= 0 || decimals === 0) return { consistent: true, nearest: mean, informative: false };
  if (NI >= Math.pow(10, decimals)) return { consistent: true, nearest: mean, informative: false };
  const g = 1 / NI;
  const k = Math.round(mean / g);
  // check the nearest grid points (rounding can land either side)
  const consistent = [k - 1, k, k + 1].some((kk) => roundTo(kk * g, decimals) === mean);
  const nearest = roundTo(k * g, decimals);
  return { consistent, nearest, informative: true };
}

// Pair a reported mean with a nearby N in the same clause (both orders).
const MEAN_THEN_N =
  /\b(?:M|mean)\s*=\s*(\d+\.\d+)\b[^.]{0,70}?\bN\s*=\s*(\d+)\b/gi;
const N_THEN_MEAN =
  /\bN\s*=\s*(\d+)\b[^.]{0,70}?\b(?:M|mean)\s*=\s*(\d+\.\d+)\b/gi;

export function runGrim(text: string, items = 1): GrimMatch[] {
  const out: GrimMatch[] = [];
  const seen = new Set<number>();

  const add = (start: number, raw: string, meanStr: string, n: number) => {
    if (seen.has(start)) return;
    const { consistent, nearest, informative } = grimConsistent(meanStr, n, items);
    if (!informative) return;
    seen.add(start);
    out.push({
      start,
      end: start + raw.length,
      raw,
      mean: parseFloat(meanStr),
      n,
      items,
      consistent,
      nearest,
      detail: consistent
        ? "Reported mean is arithmetically possible for this N."
        : `A mean of ${n} integer responses can't equal ${meanStr}; the nearest possible value is ${nearest}. Likely a typo or reporting error (GRIM).`,
    });
  };

  for (const m of text.matchAll(MEAN_THEN_N)) add(m.index ?? 0, m[0], m[1], parseInt(m[2], 10));
  for (const m of text.matchAll(N_THEN_MEAN)) add(m.index ?? 0, m[0], m[2], parseInt(m[1], 10));

  return out.sort((a, b) => a.start - b.start);
}
