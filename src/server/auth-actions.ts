"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getSessionUser } from "./session";

/** Current signed-in user's email (or null) — for client UI like the nav. */
export async function currentUser(): Promise<{ email: string } | null> {
  const u = await getSessionUser();
  return u ? { email: u.email } : null;
}

export type AuthResult = { ok: true; email: string } | { ok: false; error: string };

function authClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function setSessionCookies(session: {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set("sb-access-token", session.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: session.expires_in ?? 3600,
  });
  store.set("sb-refresh-token", session.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

function configured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

/** Real sign-in against Supabase Auth. Sets an httpOnly session cookie. */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!configured()) return { ok: false, error: "Auth is not configured." };
  const supabase = authClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return { ok: false, error: error?.message ?? "Sign-in failed." };
  }
  await setSessionCookies(data.session);
  return { ok: true, email: data.user?.email ?? email };
}

/** Create a (confirmed) Supabase user, then sign them in. */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!configured()) return { ok: false, error: "Auth is not configured." };
  const supabase = authClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error && !/already|registered|exist/i.test(error.message)) {
    return { ok: false, error: error.message };
  }
  return signInWithEmail(email, password);
}

/**
 * Establish a session from OAuth tokens captured on the client (implicit flow
 * redirect fragment). The access token is validated against Supabase before we
 * trust it and set the httpOnly cookies.
 */
export async function establishSession(
  accessToken: string,
  refreshToken: string,
  expiresIn?: number,
): Promise<AuthResult> {
  if (!configured()) return { ok: false, error: "Auth is not configured." };
  const supabase = authClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return { ok: false, error: error?.message ?? "Invalid session." };
  await setSessionCookies({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
  });
  return { ok: true, email: data.user.email ?? "" };
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete("sb-access-token");
  store.delete("sb-refresh-token");
}
