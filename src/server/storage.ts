import "server-only";
import { supabaseAdmin } from "./supabase";

/**
 * Object storage for method data files (Supabase Storage). Small text files are
 * also kept inline in the method's runtime for fast re-runs; this bucket is the
 * durable copy and the path for larger inputs. Everything is best-effort: if the
 * bucket or Supabase isn't available, the caller falls back to inline content.
 */
const BUCKET = "method-files";

function configured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

async function ensureBucket(): Promise<void> {
  try {
    await supabaseAdmin().storage.createBucket(BUCKET, { public: false });
  } catch {
    /* already exists or insufficient perms — upload will surface real errors */
  }
}

/** Upload a method data file; returns its storage path, or null on failure. */
export async function putMethodFile(
  slug: string,
  name: string,
  content: string,
): Promise<string | null> {
  if (!configured()) return null;
  const path = `${slug}/${name}`;
  const body = new Blob([content], { type: "text/plain" });
  try {
    const first = await supabaseAdmin().storage.from(BUCKET).upload(path, body, { upsert: true });
    if (!first.error) return path;
    // Bucket may not exist yet — create it once and retry.
    await ensureBucket();
    const retry = await supabaseAdmin().storage.from(BUCKET).upload(path, body, { upsert: true });
    return retry.error ? null : path;
  } catch {
    return null;
  }
}

/** Download a method data file by storage path; null if unavailable. */
export async function getMethodFile(path: string): Promise<string | null> {
  if (!configured()) return null;
  try {
    const { data, error } = await supabaseAdmin().storage.from(BUCKET).download(path);
    if (error || !data) return null;
    return await data.text();
  } catch {
    return null;
  }
}
