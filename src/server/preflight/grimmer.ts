/**
 * GRIMMER (Granularity-Related Inconsistency of Means Mapped to Error Repeats) —
 *   Anaya (2016), "The GRIMMER test: A method for testing the validity of
 *   reported measures of variability", PeerJ Preprints 4:e2400v1.
 *   Extends GRIM from means to standard deviations.
 *
 * For N integer responses with a reported mean, the sum S = round(mean·N) is
 * fixed. The sum of squares SS then satisfies two sound *necessary* conditions:
 *   (a) parity:  SS ≡ S (mod 2)   [since k² ≡ k (mod 2)]
 *   (b) minimum: SS ≥ minSS(S, N) [integers can't be more equal than balanced]
 * We map the reported SD (to its rounding precision) to an SS interval and flag
 * the SD as impossible only when NO integer SS in that interval satisfies (a),
 * or the whole interval falls below minSS. Conservative by design — it never
 * false-flags a value that could be real (that finer search is SPRITE's job).
 */

function decimalsOf(numStr: string): number {
  const dot = numStr.indexOf(".");
  return dot >= 0 ? numStr.length - dot - 1 : 0;
}
function roundTo(x: number, d: number): number {
  const f = Math.pow(10, d);
  return Math.round((x + Number.EPSILON) * f) / f;
}

// GRIM (needed as a precondition — an impossible mean is reported separately).
export function meanIsGrimConsistent(meanStr: string, n: number, items = 1): boolean {
  const decimals = decimalsOf(meanStr);
  if (decimals === 0) return true;
  const mean = parseFloat(meanStr);
  const NI = n * items;
  if (NI <= 0 || NI >= Math.pow(10, decimals)) return true; // not informative
  const g = 1 / NI;
  const k = Math.round(mean / g);
  return [k - 1, k, k + 1].some((kk) => roundTo(kk * g, decimals) === mean);
}

function minSumSquares(sum: number, n: number): number {
  // integers as balanced as possible around sum/n
  const q = Math.floor(sum / n);
  const r = sum - q * n; // 0..n-1
  return (n - r) * q * q + r * (q + 1) * (q + 1);
}

export interface GrimmerResult {
  consistent: boolean;
  informative: boolean;
  reason: string;
}

export function grimmerCheck(
  meanStr: string,
  sdStr: string,
  n: number,
  items = 1,
): GrimmerResult {
  const sdDec = decimalsOf(sdStr);
  const mean = parseFloat(meanStr);
  const sd = parseFloat(sdStr);
  if (n < 2 || sdDec === 0 || items !== 1) {
    return { consistent: true, informative: false, reason: "" };
  }
  // Only informative for modest N (grid coarse enough to matter).
  if (n >= Math.pow(10, sdDec) * 2) {
    return { consistent: true, informative: false, reason: "" };
  }
  const sum = Math.round(mean * n);
  const half = 0.5 * Math.pow(10, -sdDec);
  const sdLo = Math.max(0, sd - half);
  const sdHi = sd + half;
  // Sample SD (ddof = n-1): SS = (n-1)·SD² + sum²/n
  const base = (sum * sum) / n;
  const ssLo = (n - 1) * sdLo * sdLo + base;
  const ssHi = (n - 1) * sdHi * sdHi + base;
  const minSS = minSumSquares(sum, n);

  if (ssHi < minSS - 1e-9) {
    return {
      consistent: false,
      informative: true,
      reason: `SD = ${sdStr} is too small: no set of ${n} integers with mean ${meanStr} can vary that little (GRIMMER).`,
    };
  }

  let ok = false;
  for (let ss = Math.ceil(ssLo - 1e-9); ss <= Math.floor(ssHi + 1e-9); ss++) {
    if (ss < minSS) continue;
    if (((ss - sum) % 2 + 2) % 2 === 0) {
      ok = true;
      break;
    }
  }
  if (!ok) {
    return {
      consistent: false,
      informative: true,
      reason: `SD = ${sdStr} is impossible for ${n} integer responses with mean ${meanStr}: no valid sum-of-squares matches (GRIMMER).`,
    };
  }
  return { consistent: true, informative: true, reason: "" };
}

export interface GrimmerMatch {
  start: number;
  end: number;
  raw: string;
  detail: string;
}

// Pair "M = X … SD = Y" with a nearby N (either order).
const MEAN_SD =
  /\b(?:M|mean)\s*=\s*(\d+\.\d+)\s*[,;]?\s*(?:SD|s\.d\.|std)\s*=\s*(\d+\.\d+)/gi;

export function runGrimmer(text: string, items = 1): GrimmerMatch[] {
  const out: GrimmerMatch[] = [];
  for (const m of text.matchAll(MEAN_SD)) {
    const start = m.index ?? 0;
    // find nearest N within ~90 chars on either side
    const windowStart = Math.max(0, start - 90);
    const window = text.slice(windowStart, start + m[0].length + 90);
    const nMatch = window.match(/\bN\s*=\s*(\d+)\b/i);
    if (!nMatch) continue;
    const n = parseInt(nMatch[1], 10);
    if (!meanIsGrimConsistent(m[1], n, items)) continue; // impossible mean → GRIM already flags it
    const res = grimmerCheck(m[1], m[2], n, items);
    if (!res.informative || res.consistent) continue;
    out.push({ start, end: start + m[0].length, raw: m[0], detail: res.reason });
  }
  return out.sort((a, b) => a.start - b.start);
}
