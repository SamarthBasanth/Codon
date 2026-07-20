"use server";

import { createHash } from "node:crypto";
import { getSessionUser } from "./session";
import { rateLimit } from "./ratelimit";
import { runInSandbox, sandboxConfigured } from "./sandbox";
import { getMethodDetail } from "./methods";
import { resolvePipeline } from "@/lib/pipelines";
import { supabaseAdmin } from "./supabase";

export interface CloudRunResult {
  ok: boolean;
  error?: "auth" | "unconfigured" | "not-runnable" | "limit" | "exec" | "unknown";
  message?: string;
  stdout?: string;
  hash?: string;
  reproducesReference?: boolean;
  durationMs?: number;
  remaining?: number;
}

const DAILY_CAP = 8;

function supaOk(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

/**
 * Run a real (non-browser) method on demand in the E2B cloud sandbox. This is
 * the metered rail for library methods (scanpy etc.) that can't run in Pyodide.
 * Gated on a real session (E2B costs money) + a per-user daily cap, and diffs
 * the output against the method's verified reference when the sample is used.
 */
export async function runMethodInCloud(slug: string, input: string): Promise<CloudRunResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "auth" };

  // Burst gate on top of the durable daily cap (E2B costs money).
  const rl = rateLimit(`cloudrun:${user.id}`, 5, 60_000);
  if (!rl.ok) {
    return { ok: false, error: "limit", message: "Too many runs in a short window — try again in a moment.", remaining: 0 };
  }

  if (!sandboxConfigured()) return { ok: false, error: "unconfigured", message: "Cloud sandbox is not configured." };

  const method = await getMethodDetail(slug);
  if (!method) return { ok: false, error: "not-runnable", message: "Method not found." };
  const pipeline = resolvePipeline(method as Parameters<typeof resolvePipeline>[0]);
  if (!pipeline || pipeline.language !== "Python") {
    return { ok: false, error: "not-runnable", message: "This method has no cloud-runnable build." };
  }

  // Daily cap (graceful: if the table isn't there yet, just run without metering).
  let remaining = DAILY_CAP - 1;
  if (supaOk()) {
    try {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      const { count } = await supabaseAdmin()
        .from("cloud_runs")
        .select("*", { count: "exact", head: true })
        .eq("user_email", user.email)
        .gte("created_at", since.toISOString());
      const used = count ?? 0;
      if (used >= DAILY_CAP) {
        return { ok: false, error: "limit", message: `You've used your ${DAILY_CAP} free cloud runs today.`, remaining: 0 };
      }
      remaining = DAILY_CAP - used - 1;
    } catch {
      /* table missing — allow the run */
    }
  }

  const dataFiles =
    (method as { runtime?: { files?: { path: string; content: string }[] } }).runtime?.files ?? [];
  const run = await runInSandbox(pipeline.code, input ?? "", pipeline.packages ?? [], dataFiles);
  if (run.error) {
    return { ok: false, error: "exec", message: run.error, durationMs: run.durationMs };
  }
  const stdout = run.stdout.trim();
  const hash = "sha256:" + createHash("sha256").update(stdout, "utf8").digest("hex");
  const ref = pipeline.expectedOutput?.trim();
  const usedSample = !input?.trim() || input.trim() === (pipeline.sampleInput ?? "").trim();
  const reproducesReference = Boolean(ref && usedSample && stdout === ref);

  if (supaOk()) {
    try {
      await supabaseAdmin()
        .from("cloud_runs")
        .insert({ user_email: user.email, method_slug: slug, reproduced: reproducesReference });
    } catch {
      /* best-effort */
    }
  }

  return { ok: true, stdout, hash, reproducesReference, durationMs: run.durationMs, remaining };
}
