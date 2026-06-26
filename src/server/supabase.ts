import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase server clients.
 *
 * Values come exclusively from environment variables (.env.local, git-ignored) —
 * keys are NEVER hardcoded here. `import "server-only"` makes importing this file
 * into a Client Component a build error, which keeps the secret key out of any
 * browser bundle.
 *
 * Note on the SDK: the Supabase "Connect" dialog suggests `@supabase/server` +
 * `withSupabase`, which targets Supabase Edge Functions (Deno fetch handlers).
 * This app is Next.js App Router, so the idiomatic equivalent is to call these
 * factories from route handlers / server components and gate with your own auth.
 */

function need(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing env var ${name}. Add it to .env.local (git-ignored) — see .env.example.`,
    );
  }
  return v;
}

/**
 * RLS-scoped client using the publishable key. Respects row-level security;
 * safe for reads/writes that should be governed by your RLS policies.
 */
export function supabaseAnon(): SupabaseClient {
  return createClient(need("SUPABASE_URL"), need("SUPABASE_PUBLISHABLE_KEY"), {
    auth: { persistSession: false },
  });
}

/**
 * Admin client using the secret key. BYPASSES row-level security — server-only,
 * use sparingly (e.g. trusted background jobs), and never return it to a client.
 */
export function supabaseAdmin(): SupabaseClient {
  return createClient(need("SUPABASE_URL"), need("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false },
  });
}
