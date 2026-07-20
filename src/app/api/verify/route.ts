import { NextResponse } from "next/server";
import { verifyOutputs, type Comparison } from "@/server/verify";
import { rateLimit, clientIp } from "@/server/ratelimit";

/**
 * A live demo of the verification engine running real typed-tolerance diffs.
 * GET runs a built-in example; POST verifies caller-supplied comparisons.
 * POST is rate-limited and size-capped (it does string diffing on caller input).
 */
const DEMO: Comparison[] = [
  {
    name: "branch_probs.csv",
    kind: "numeric",
    expected: "0.812,0.067,0.041,0.080\n0.022,0.741,0.190,0.047",
    actual: "0.81203,0.06698,0.04101,0.07998\n0.02201,0.74099,0.19002,0.04699",
    tolerance: { atol: 1e-3, rtol: 1e-3 },
  },
  {
    name: "report.json",
    kind: "structural",
    expected: '{"tier_I":2,"tier_II":5,"score":0.98}',
    actual: '{"tier_I":2,"tier_II":5,"score":0.980000004}',
  },
  {
    name: "top_sequence",
    kind: "exact",
    expected: "MKTAYIAKQR",
    actual: "MKTAYIAKQR",
  },
];

const MAX_COMPARISONS = 50;
const MAX_FIELD = 262_144; // 256 KB per expected/actual string

export async function GET() {
  return NextResponse.json(verifyOutputs(DEMO));
}

export async function POST(request: Request) {
  const rl = rateLimit(`verify:${clientIp(request)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.comparisons)) {
    return NextResponse.json(
      { error: "Expected JSON body: { comparisons: Comparison[] }" },
      { status: 400 },
    );
  }
  const comparisons = body.comparisons as Comparison[];
  if (comparisons.length > MAX_COMPARISONS) {
    return NextResponse.json({ error: `Too many comparisons (max ${MAX_COMPARISONS}).` }, { status: 413 });
  }
  for (const c of comparisons) {
    if (String(c?.expected ?? "").length > MAX_FIELD || String(c?.actual ?? "").length > MAX_FIELD) {
      return NextResponse.json({ error: "A comparison field is too large (256 KB max)." }, { status: 413 });
    }
  }
  return NextResponse.json(verifyOutputs(comparisons));
}
