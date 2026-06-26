import "server-only";
import { Sandbox } from "@e2b/code-interpreter";

/**
 * Trusted server-side execution via E2B. User code runs in an ephemeral
 * Firecracker microVM (isolated from our infra), separate from the app plane —
 * the authoritative verifier behind the reproducibility badge. The input is
 * injected as the INPUT_DATA global via base64 so no escaping/injection is
 * possible, and the sandbox is always killed afterward.
 */
export interface SandboxResult {
  stdout: string;
  stderr: string;
  error: string | null;
  durationMs: number;
}

export function sandboxConfigured(): boolean {
  return Boolean(process.env.E2B_API_KEY);
}

export async function runInSandbox(
  code: string,
  input: string,
  packages: string[] = [],
): Promise<SandboxResult> {
  const apiKey = process.env.E2B_API_KEY;
  if (!apiKey) throw new Error("Sandbox is not configured (E2B_API_KEY missing).");

  const t0 = Date.now();
  const sbx = await Sandbox.create({ apiKey });
  try {
    if (packages.length) {
      const list = packages.map((p) => JSON.stringify(p)).join(", ");
      await sbx.runCode(
        `import sys, subprocess\nsubprocess.run([sys.executable, "-m", "pip", "install", "-q", ${list}], check=False)`,
      );
    }
    const b64 = Buffer.from(input ?? "", "utf8").toString("base64");
    await sbx.runCode(`import base64\nINPUT_DATA = base64.b64decode("${b64}").decode("utf-8")`);
    const exec = await sbx.runCode(code);
    return {
      stdout: (exec.logs?.stdout ?? []).join(""),
      stderr: (exec.logs?.stderr ?? []).join(""),
      error: exec.error ? `${exec.error.name}: ${exec.error.value}` : null,
      durationMs: Date.now() - t0,
    };
  } finally {
    try {
      await sbx.kill();
    } catch {
      /* best-effort cleanup */
    }
  }
}
