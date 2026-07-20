import { NextResponse } from "next/server";
import { getMethodDetail } from "@/server/methods";
import { toManifest } from "@/lib/manifest";

/**
 * Machine-readable Codon Verification Record (CVR) for a method.
 * Served at /methods/<slug>/manifest.json — the JSON view of the same
 * verification a human sees on the method page.
 */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const m = await getMethodDetail(slug);
  if (!m) {
    return NextResponse.json({ error: "Method not found" }, { status: 404 });
  }
  return NextResponse.json(toManifest(m), {
    headers: { "cache-control": "public, max-age=300" },
  });
}
