"use server";

import { getSessionUser } from "./session";
import { supabaseAdmin } from "./supabase";

/**
 * Free licensing + runs, for real. A user's licensed methods and their run
 * history are stored on their Supabase Auth `user_metadata` — so a brand-new
 * account starts genuinely empty (no fake purchases), and licensing/running a
 * free method records real entries the buyer dashboard reads back.
 */
export interface RunRecord {
  at: string;
  input: string;
  durationSec: number;
  status: "succeeded";
}

export interface LicenseRecord {
  slug: string;
  title: string;
  codonId: string;
  licensedAt: string;
  runs: RunRecord[];
}

async function readLicenses(userId: string): Promise<{ meta: Record<string, unknown>; licenses: LicenseRecord[] }> {
  const { data } = await supabaseAdmin().auth.admin.getUserById(userId);
  const meta = (data?.user?.user_metadata ?? {}) as Record<string, unknown>;
  const licenses = Array.isArray(meta.licenses) ? (meta.licenses as LicenseRecord[]) : [];
  return { meta, licenses };
}

async function writeLicenses(
  userId: string,
  meta: Record<string, unknown>,
  licenses: LicenseRecord[],
): Promise<boolean> {
  const { error } = await supabaseAdmin().auth.admin.updateUserById(userId, {
    user_metadata: { ...meta, licenses },
  });
  return !error;
}

/** The signed-in user's licensed methods (newest first). Empty if none. */
export async function getMyLicenses(): Promise<LicenseRecord[]> {
  const user = await getSessionUser();
  if (!user) return [];
  try {
    const { licenses } = await readLicenses(user.id);
    return [...licenses].sort((a, b) => +new Date(b.licensedAt) - +new Date(a.licensedAt));
  } catch {
    return [];
  }
}

/** Add a free method to the user's library (idempotent). */
export async function licenseMethod(
  slug: string,
  title: string,
  codonId: string,
): Promise<{ ok: boolean; already?: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in to license a method." };
  try {
    const { meta, licenses } = await readLicenses(user.id);
    if (licenses.some((l) => l.slug === slug)) return { ok: true, already: true };
    licenses.push({ slug, title, codonId, licensedAt: new Date().toISOString(), runs: [] });
    const ok = await writeLicenses(user.id, meta, licenses);
    return ok ? { ok: true } : { ok: false, error: "Could not save license." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save license." };
  }
}

/**
 * Record a completed run against a method. Auto-licenses the method first if the
 * user hasn't already (running a free method implies access).
 */
export async function recordRun(
  slug: string,
  title: string,
  codonId: string,
  input: string,
  durationSec: number,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in to run a method." };
  try {
    const { meta, licenses } = await readLicenses(user.id);
    let lic = licenses.find((l) => l.slug === slug);
    if (!lic) {
      lic = { slug, title, codonId, licensedAt: new Date().toISOString(), runs: [] };
      licenses.push(lic);
    }
    lic.runs.push({
      at: new Date().toISOString(),
      input: input || "sample input",
      durationSec,
      status: "succeeded",
    });
    const ok = await writeLicenses(user.id, meta, licenses);
    return ok ? { ok: true } : { ok: false, error: "Could not record run." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not record run." };
  }
}
