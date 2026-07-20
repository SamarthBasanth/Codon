import { getAllMethods } from "@/server/methods";
import { toManifest } from "@/lib/manifest";

/**
 * Corpus export — the whole verified catalog as JSON Lines (one CVR per line).
 * The machine-ingestible form of the archive: a consumer pulls every method's
 * verification record in a single request.
 *
 *   GET /api/corpus            → all methods
 *   GET /api/corpus?verified=1 → only reproduced/verified methods
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const verifiedOnly = ["1", "true"].includes((url.searchParams.get("verified") || "").toLowerCase());

  let methods = await getAllMethods();
  if (verifiedOnly) {
    methods = methods.filter(
      (m) => m.verification.status === "verified" || m.verification.status === "external-dep",
    );
  }

  const body = methods.map((m) => JSON.stringify(toManifest(m))).join("\n") + "\n";
  return new Response(body, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
