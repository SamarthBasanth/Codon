import { runInSandbox, sandboxConfigured } from "@/server/sandbox";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Health probe for the E2B sandbox. Without `?run=1` it only reports whether the
 * key is configured (cheap). With `?run=1` it executes a trivial program in a
 * real microVM end-to-end (uses a little free-tier time) so we can confirm the
 * production path works.
 */
export async function GET(req: Request) {
  const configured = sandboxConfigured();
  const run = new URL(req.url).searchParams.get("run") === "1";
  if (!configured) return Response.json({ ok: false, configured: false });
  if (!run) return Response.json({ ok: true, configured: true, note: "add ?run=1 to execute a test" });
  try {
    const r = await runInSandbox(
      "print(sum(int(x) for x in INPUT_DATA.split()))",
      "10 20 12",
      [],
    );
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
