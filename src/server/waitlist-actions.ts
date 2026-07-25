"use server";

import { supabaseAdmin } from "./supabase";

export interface WaitlistInput {
  email: string;
  name?: string;
  role?: string;
  organization?: string;
  useCase?: string;
  /** Tags the signup so records stay separable, e.g. "preflight" or "pricing:Lab / Team". */
  source?: string;
}

export interface WaitlistResult {
  ok: boolean;
  /** "invalid" | "unconfigured" | "storage" — the form maps these to messages. */
  error?: string;
}

function configured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

/**
 * Store a Codon Preflight early-access signup. Writes to public.preflight_waitlist
 * with the service-role client (bypasses RLS). Idempotent on email (a repeat
 * signup is treated as success). Returns a coarse error code the client turns
 * into a friendly message + email fallback.
 */
export async function joinWaitlist(input: WaitlistInput): Promise<WaitlistResult> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "invalid" };
  }
  if (!configured()) {
    return { ok: false, error: "unconfigured" };
  }
  try {
    const source = input.source?.trim() || "preflight";
    const row = {
      email,
      name: input.name?.trim() || null,
      role: input.role?.trim() || null,
      organization: input.organization?.trim() || null,
      use_case: input.useCase?.trim() || null,
      source,
    };
    const { error } = await supabaseAdmin().from("preflight_waitlist").insert(row);
    if (error) {
      // 23505 = unique_violation → already on the list. Merge the latest interest
      // so the record stays useful (e.g. they later ask about a paid plan).
      if (error.code === "23505") {
        await supabaseAdmin()
          .from("preflight_waitlist")
          .update({
            source,
            ...(row.use_case ? { use_case: row.use_case } : {}),
            ...(row.organization ? { organization: row.organization } : {}),
            ...(row.role ? { role: row.role } : {}),
          })
          .eq("email", email);
        return { ok: true };
      }
      return { ok: false, error: "storage" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "storage" };
  }
}
