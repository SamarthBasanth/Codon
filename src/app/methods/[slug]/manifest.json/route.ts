import { NextResponse } from "next/server";
import { getMethodDetail } from "@/server/methods";
import { SITE_URL } from "@/lib/site";

/**
 * Machine-readable Codon Verification Record (CVR) for a method.
 * Served at /methods/<slug>/manifest.json — the JSON view of the same
 * verification a human sees on the method page. Honest by construction: it
 * exposes exactly the stored record (status, hashes, typed diff), and flags
 * that some reference methods verify by held-out validation rather than by
 * hashing stdout.
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

  const v = m.verification;
  const manifest = {
    schema: "codon.verification-record/v1",
    codonId: m.codonId,
    slug: m.slug,
    title: m.title,
    version: m.version,
    url: `${SITE_URL}/methods/${m.slug}`,
    language: m.language,
    fields: m.fields,
    verification: {
      status: v.status,
      reproduced: v.status === "verified" || v.status === "external-dep",
      verifier: v.verifierVersion,
      baseImage: v.baseImage,
      toleranceProfile: v.toleranceProfile,
      hashes: {
        input: v.inputHash || null,
        expectedOutput: v.expectedOutputHash || null,
        actualOutput: v.actualOutputHash || null,
        imageDigest: v.imageDigest || null,
      },
      diff: v.diff,
      notes: v.notes ?? null,
    },
    license: m.license,
    provenance: {
      host: "Codon",
      note: "Content-addressed verification record. Hashes are SHA-256 of the declared/produced outputs where applicable; some reference methods verify by held-out validation rather than by hashing stdout (see verification.notes).",
    },
  };

  return NextResponse.json(manifest, {
    headers: { "cache-control": "public, max-age=300" },
  });
}
