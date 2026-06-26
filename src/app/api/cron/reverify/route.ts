import { reverifyAll } from "@/server/reverify";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled re-verification endpoint. Triggered by Vercel Cron (see vercel.json).
 * Vercel automatically sends `Authorization: Bearer <CRON_SECRET>`, which we
 * require so the endpoint can't be run by anyone else.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const summary = await reverifyAll(25);
    return Response.json({ ok: true, ...summary, at: new Date().toISOString() });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
