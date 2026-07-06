"use server";

import { supabaseAdmin } from "./supabase";

export interface WaitlistInput {
  email: string;
  name?: string;
  role?: string;
  organization?: string;
  useCase?: string;
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
    const { error } = await supabaseAdmin()
      .from("preflight_waitlist")
      .insert({
        email,
        name: input.name?.trim() || null,
        role: input.role?.trim() || null,
        organization: input.organization?.trim() || null,
        use_case: input.useCase?.trim() || null,
        source: "preflight",
      });
    if (error) {
      // 23505 = unique_violation → already on the list; treat as success.
      if (error.code === "23505") return { ok: true };
      return { ok: false, error: "storage" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "storage" };
  }
}
