import "server-only";
import { supabaseAdmin } from "./supabase";
import { runInSandbox, sandboxConfigured } from "./sandbox";
import { verifyOutputs, type ToleranceKind } from "./verify";
import type { Method } from "@/lib/mockData";

/**
 * Scheduled re-verification. Published methods that carry a runnable `runtime`
 * are re-executed in a fresh E2B microVM and re-diffed against the output they
 * were verified against. If a method stops reproducing, its status flips to
 * "failed" — which the live badge reflects automatically.
 */
type Runtime = {
  language: string;
  code: string;
  sampleInput: string;
  expectedOutput: string;
  toleranceKind: ToleranceKind;
  atol: number;
  packages: string[];
};
type StoredMethod = Method & { runtime?: Runtime; lastReverifiedAt?: string };

export interface ReverifyOutcome {
  slug: string;
  status: "verified" | "failed";
  detail: string;
}

export async function reverifyMethod(m: StoredMethod): Promise<ReverifyOutcome | null> {
  const rt = m.runtime;
  if (!rt?.code || rt.language !== "Python") return null;
  const run = await runInSandbox(rt.code, rt.sampleInput, rt.packages ?? []);
  if (run.error) {
    return { slug: m.slug, status: "failed", detail: "Runtime error: " + run.error };
  }
  const report = verifyOutputs([
    {
      name: "output",
      kind: rt.toleranceKind ?? "exact",
      expected: (rt.expectedOutput ?? "").trim(),
      actual: run.stdout.trim(),
      tolerance: { atol: rt.atol || 1e-6, rtol: 1e-3 },
    },
  ]);
  return {
    slug: m.slug,
    status: report.pass ? "verified" : "failed",
    detail: report.diffs[0]?.detail ?? (report.pass ? "Reproduced." : "Output drift beyond tolerance."),
  };
}

export async function reverifyAll(limit = 25): Promise<{
  checked: number;
  flipped: number;
  results: ReverifyOutcome[];
}> {
  if (!sandboxConfigured()) return { checked: 0, flipped: 0, results: [] };
  const { data, error } = await supabaseAdmin().from("methods").select("id, data").limit(200);
  if (error || !data) return { checked: 0, flipped: 0, results: [] };

  const rows = (data as { id: string; data: StoredMethod }[])
    .filter((r) => r.data?.runtime?.code && r.data.runtime.language === "Python")
    .slice(0, limit);

  const results: ReverifyOutcome[] = [];
  let flipped = 0;
  const now = new Date().toISOString();

  for (const r of rows) {
    const outcome = await reverifyMethod(r.data);
    if (!outcome) continue;
    results.push(outcome);
    const prev = r.data.verification?.status;
    if (prev !== outcome.status) flipped++;
    const updatedData = {
      ...r.data,
      lastReverifiedAt: now,
      verification: { ...r.data.verification, status: outcome.status, finishedAt: now },
    };
    await supabaseAdmin()
      .from("methods")
      .update({ verification: outcome.status, data: updatedData, updated_at: now.slice(0, 10) })
      .eq("id", r.id);
  }
  return { checked: results.length, flipped, results };
}
