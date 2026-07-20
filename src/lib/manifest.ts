import type { Method } from "./mockData";
import { SITE_URL } from "./site";

/**
 * Codon Verification Record (CVR) — the machine-readable form of a method's
 * verification. Shared by the per-method manifest route and the corpus export
 * so both emit identical, honest records straight from stored data.
 */
export function toManifest(m: Method) {
  const v = m.verification;
  return {
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
}
