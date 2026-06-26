import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export interface SessionUser {
  id: string;
  email: string;
}

/**
 * Reads the httpOnly session cookie and validates it against Supabase Auth.
 * Returns the user or null. Server-only; safe to call from server actions,
 * server components, and route handlers.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get("sb-access-token")?.value;
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) return null;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}
