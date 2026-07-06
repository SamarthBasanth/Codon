/**
 * Minimal, dependency-free statistical distribution functions — enough to
 * recompute two-tailed / upper-tail p-values from reported NHST statistics
 * (t, F, χ², r, z). Algorithms are the standard Numerical Recipes series /
 * continued-fraction expansions for the regularized incomplete gamma and beta
 * functions. Accurate to ~1e-10, which is far tighter than the 2–3 significant
 * digits journals report — so statcheck comparisons are sound.
 */

export function gammaln(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

// Regularized lower incomplete gamma P(a, x).
export function regGammaP(a: number, x: number): number {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 0;
  if (x < a + 1) {
    // series representation
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 0; n < 200; n++) {
      ap++;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-14) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
  }
  // continued fraction for Q, then P = 1 - Q
  const FPMIN = 1e-300;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
  return 1 - q;
}

// Regularized incomplete beta I_x(a, b).
export function regIncBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x);
  const front = Math.exp(lbeta);
  const betacf = (aa: number, bb: number, xx: number): number => {
    const FPMIN = 1e-300;
    const qab = aa + bb;
    const qap = aa + 1;
    const qam = aa - 1;
    let c = 1;
    let d = 1 - (qab * xx) / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 300; m++) {
      const m2 = 2 * m;
      let aaa = (m * (bb - m) * xx) / ((qam + m2) * (aa + m2));
      d = 1 + aaa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aaa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      h *= d * c;
      aaa = (-(aa + m) * (qab + m) * xx) / ((aa + m2) * (qap + m2));
      d = 1 + aaa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aaa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-14) break;
    }
    return h;
  };
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betacf(a, b, x)) / a;
  }
  return 1 - (Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x)) * betacf(b, a, 1 - x)) / b;
}

// Standard normal CDF via erf.
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

/** Two-tailed p from Student's t. */
export function pFromT(t: number, df: number): number {
  const x = df / (df + t * t);
  return clampP(regIncBeta(df / 2, 0.5, x));
}
/** Upper-tail p from F(df1, df2). */
export function pFromF(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  const x = df2 / (df2 + df1 * f);
  return clampP(regIncBeta(df2 / 2, df1 / 2, x));
}
/** Upper-tail p from χ²(df). */
export function pFromChi2(chi2: number, df: number): number {
  if (chi2 <= 0) return 1;
  return clampP(1 - regGammaP(df / 2, chi2 / 2));
}
/** Two-tailed p from correlation r with df = N - 2. */
export function pFromR(r: number, df: number): number {
  if (Math.abs(r) >= 1) return 0;
  const t = (r * Math.sqrt(df)) / Math.sqrt(1 - r * r);
  return pFromT(t, df);
}
/** Two-tailed p from z. */
export function pFromZ(z: number): number {
  return clampP(2 * (1 - normalCdf(Math.abs(z))));
}

function clampP(p: number): number {
  if (!Number.isFinite(p)) return NaN;
  return Math.min(1, Math.max(0, p));
}
