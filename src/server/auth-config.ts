import "server-only";

/**
 * Asks Supabase Auth which external providers are actually enabled (toggled on
 * *and* configured with credentials). Used so the sign-in page only shows OAuth
 * buttons that will work — instead of redirecting to a raw "provider is not
 * enabled" error.
 */
export async function getEnabledOAuthProviders(): Promise<{ google: boolean; github: boolean }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return { google: false, github: false };
  try {
    const r = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    if (!r.ok) return { google: false, github: false };
    const j = (await r.json()) as { external?: Record<string, boolean> };
    const ext = j.external ?? {};
    return { google: Boolean(ext.google), github: Boolean(ext.github) };
  } catch {
    return { google: false, github: false };
  }
}
