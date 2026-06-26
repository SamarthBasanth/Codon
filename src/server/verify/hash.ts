import { createHash } from "node:crypto";

/**
 * Content-addressed hash used in the reproducibility stamp. Real SHA-256 over
 * the bytes — the same primitive a production verifier would bind into the badge.
 */
export function contentHash(input: string | Buffer, algo: "sha256" = "sha256"): string {
  return `${algo}:${createHash(algo).update(input).digest("hex")}`;
}
