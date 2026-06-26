import { NextResponse } from "next/server";
import { verifyOutputs, type Comparison } from "@/server/verify";

/**
 * A live demo of the verification engine running real typed-tolerance diffs.
 * GET runs a built-in example; POST verifies caller-supplied comparisons.
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

export async function GET() {
  return NextResponse.json(verifyOutputs(DEMO));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.comparisons)) {
    return NextResponse.json(
      { error: "Expected JSON body: { comparisons: Comparison[] }" },
      { status: 400 },
    );
  }
  return NextResponse.json(verifyOutputs(body.comparisons as Comparison[]));
}
