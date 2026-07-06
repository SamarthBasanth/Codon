/**
 * Citation integrity — extract DOIs from the text and verify them against
 * Crossref (api.crossref.org), the canonical DOI metadata registry. A DOI that
 * doesn't resolve is a strong integrity signal (fabricated / mistyped reference);
 * Crossref also surfaces retraction relations. Network failures degrade to
 * "unchecked" rather than a false flag. Honest by construction: we only assert
 * what Crossref returns.
 */

export interface DoiMatch {
  start: number;
  end: number;
  doi: string;
}

const DOI_RE = /\b10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/g;

export function extractDois(text: string): DoiMatch[] {
  const out: DoiMatch[] = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(DOI_RE)) {
    // strip trailing punctuation the regex may greedily include
    let doi = m[0].replace(/[.,;)\]]+$/, "");
    const start = m.index ?? 0;
    const key = doi.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ start, end: start + doi.length, doi });
  }
  return out;
}

export type DoiStatus = "resolves" | "missing" | "retracted" | "unchecked";

export interface DoiResult extends DoiMatch {
  status: DoiStatus;
  title?: string;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "CodonPreflight/1.0 (mailto:hello@codon-six.vercel.app)" },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function checkDoi(match: DoiMatch): Promise<DoiResult> {
  const res = await fetchWithTimeout(
    `https://api.crossref.org/works/${encodeURIComponent(match.doi)}`,
    4500,
  );
  if (!res) return { ...match, status: "unchecked" };
  if (res.status === 404) return { ...match, status: "missing" };
  if (!res.ok) return { ...match, status: "unchecked" };
  try {
    const body = (await res.json()) as {
      message?: {
        title?: string[];
        "update-to"?: { type?: string }[];
        relation?: Record<string, unknown>;
      };
    };
    const msg = body.message ?? {};
    const retracted = (msg["update-to"] ?? []).some((u) => /retract/i.test(u.type ?? ""));
    return {
      ...match,
      status: retracted ? "retracted" : "resolves",
      title: msg.title?.[0],
    };
  } catch {
    return { ...match, status: "unchecked" };
  }
}

// Check a capped set of DOIs concurrently (politeness + latency).
export async function checkDois(matches: DoiMatch[], limit = 8): Promise<DoiResult[]> {
  const slice = matches.slice(0, limit);
  const results = await Promise.all(slice.map(checkDoi));
  const rest: DoiResult[] = matches.slice(limit).map((m) => ({ ...m, status: "unchecked" }));
  return [...results, ...rest];
}
