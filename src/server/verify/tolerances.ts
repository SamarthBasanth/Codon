import type { DiffResult, NumericTolerance } from "./types";

/** Pull every numeric token out of text (handles CSV, matrices, scientific). */
export function parseNumbers(text: string): number[] {
  const m = text.match(/-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/g);
  return m ? m.map(Number).filter((n) => Number.isFinite(n)) : [];
}

export function compareExact(name: string, expected: string, actual: string): DiffResult {
  const match = expected.trim() === actual.trim();
  return {
    name,
    kind: "exact",
    status: match ? "match" : "mismatch",
    detail: match ? "Byte-for-byte identical." : "Strings differ.",
    tolerance: "exact",
  };
}

export function compareNumeric(
  name: string,
  expected: string,
  actual: string,
  tol: NumericTolerance,
): DiffResult {
  const a = parseNumbers(expected);
  const b = parseNumbers(actual);
  const tolStr = `atol ${tol.atol} / rtol ${tol.rtol}`;

  if (a.length !== b.length) {
    return {
      name,
      kind: "numeric",
      status: "mismatch",
      detail: `Element count differs (${a.length} vs ${b.length}).`,
      tolerance: tolStr,
    };
  }

  let maxAbs = 0;
  let fails = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]);
    if (d > maxAbs) maxAbs = d;
    if (d > tol.atol + tol.rtol * Math.abs(a[i])) fails++;
  }

  const match = fails === 0;
  return {
    name,
    kind: "numeric",
    status: match ? "match" : "mismatch",
    detail: match
      ? `${a.length} values within tolerance (max abs Δ = ${maxAbs.toExponential(1)}).`
      : `${fails}/${a.length} values exceed tolerance (max abs Δ = ${maxAbs.toExponential(1)}).`,
    tolerance: tolStr,
    maxAbsDelta: maxAbs,
  };
}

function walk(
  expected: unknown,
  actual: unknown,
  path: string,
  out: string[],
  atol: number,
): void {
  if (typeof expected === "number" && typeof actual === "number") {
    if (Math.abs(expected - actual) > atol) out.push(`${path} (${expected}≠${actual})`);
    return;
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      out.push(`${path}.length (${expected.length}≠${actual.length})`);
      return;
    }
    expected.forEach((v, i) => walk(v, actual[i], `${path}[${i}]`, out, atol));
    return;
  }
  if (expected && actual && typeof expected === "object" && typeof actual === "object") {
    const eObj = expected as Record<string, unknown>;
    const aObj = actual as Record<string, unknown>;
    const aKeys = new Set(Object.keys(aObj));
    for (const k of Object.keys(eObj)) {
      if (!aKeys.has(k)) {
        out.push(`${path}.${k} (missing)`);
        continue;
      }
      walk(eObj[k], aObj[k], `${path}.${k}`, out, atol);
    }
    return;
  }
  if (expected !== actual) out.push(path);
}

export function compareStructural(
  name: string,
  expected: string,
  actual: string,
  floatAtol = 1e-6,
): DiffResult {
  let e: unknown;
  let a: unknown;
  try {
    e = JSON.parse(expected);
    a = JSON.parse(actual);
  } catch {
    return {
      name,
      kind: "structural",
      status: "mismatch",
      detail: "Could not parse JSON.",
      tolerance: `exact keys; floats atol ${floatAtol}`,
    };
  }
  const out: string[] = [];
  walk(e, a, "$", out, floatAtol);
  const match = out.length === 0;
  return {
    name,
    kind: "structural",
    status: match ? "match" : "mismatch",
    detail: match
      ? "All keys and values match."
      : `${out.length} mismatch(es): ${out.slice(0, 3).join(", ")}${out.length > 3 ? "…" : ""}`,
    tolerance: `exact keys; floats atol ${floatAtol}`,
  };
}

export function compareChecksum(name: string, expected: string, actual: string): DiffResult {
  const match = expected.trim() === actual.trim();
  return {
    name,
    kind: "checksum",
    status: match ? "match" : "mismatch",
    detail: match ? "Checksums identical." : "Checksum mismatch.",
    tolerance: "checksum",
  };
}
