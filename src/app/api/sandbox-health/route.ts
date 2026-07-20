import { runInSandbox, sandboxConfigured } from "@/server/sandbox";
import { getSessionUser } from "@/server/session";
import { rateLimit, clientIp } from "@/server/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Health probe for the E2B sandbox. Without `?run=1` it only reports whether the
 * key is configured (cheap, open). With `?run=1` it executes a trivial program
 * in a real microVM — which costs money — so that path is gated: a signed-in
 * user, or a monitor presenting the cron secret, and rate-limited either way.
 */
export async function GET(req: Request) {
  const configured = sandboxConfigured();
  const run = new URL(req.url).searchParams.get("run") === "1";
  if (!configured) return Response.json({ ok: false, configured: false });
  if (!run) return Response.json({ ok: true, configured: true, note: "add ?run=1 to execute a test" });

  const user = await getSessionUser();
  const auth = req.headers.get("authorization");
  const cronOk = Boolean(process.env.CRON_SECRET) && auth === `Bearer ${process.env.CRON_SECRET}`;
  if (!user && !cronOk) {
    return Response.json(
      { ok: false, error: "auth", note: "sign in (or use the cron secret) to execute a live sandbox run" },
      { status: 401 },
    );
  }

  const key = user ? `sbh:${user.id}` : `sbh:ip:${clientIp(req)}`;
  const rl = rateLimit(key, 5, 60_000);
  if (!rl.ok) {
    return Response.json(
      { ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs },
      { status: 429, headers: { "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  try {
    const r = await runInSandbox("print(sum(int(x) for x in INPUT_DATA.split()))", "10 20 12", []);
    return Response.json({
      ok: r.error === null && r.stdout.trim() === "42",
      output: r.stdout.trim(),
      error: r.error,
      elapsedMs: r.durationMs,
    });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
