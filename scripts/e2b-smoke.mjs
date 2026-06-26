// Smoke test: validate the E2B key + see the exact output shape of runCode.
// Reads E2B_API_KEY from .env.local so the key never appears in a command.
import { readFileSync } from "fs";
import { Sandbox } from "@e2b/code-interpreter";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const apiKey = (env.match(/^E2B_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!apiKey) throw new Error("E2B_API_KEY missing from .env.local");

const input = "3\n5\n7";
const code = `rows = INPUT_DATA.strip().splitlines()\nprint(f"n={len(rows)} sum={sum(int(x) for x in rows)}")\nprint("second line")`;

const t0 = Date.now();
const sbx = await Sandbox.create({ apiKey });
try {
  const b64 = Buffer.from(input, "utf8").toString("base64");
  await sbx.runCode(`import base64\nINPUT_DATA = base64.b64decode("${b64}").decode("utf-8")`);
  const exec = await sbx.runCode(code);
  console.log("=== exec.logs.stdout (raw) ===");
  console.log(JSON.stringify(exec.logs.stdout));
  console.log("=== joined('') ===");
  console.log(JSON.stringify(exec.logs.stdout.join("")));
  console.log("=== error ===", exec.error ? `${exec.error.name}: ${exec.error.value}` : "none");
  console.log("=== elapsed ms ===", Date.now() - t0);
} finally {
  await sbx.kill();
}
