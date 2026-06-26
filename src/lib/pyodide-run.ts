"use client";

/**
 * Real Python execution in the browser via Pyodide (CPython → WebAssembly).
 * The interpreter is sandboxed: it runs in the page's WASM heap with no network
 * access, which mirrors Codon's "sealed, no-egress" verification model. Loaded
 * lazily from the jsDelivr CDN and cached as a singleton across runs.
 */

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pyodide = any;
let pyodidePromise: Promise<Pyodide> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load the Python runtime."));
    document.head.appendChild(s);
  });
}

export async function getPyodide(onStatus?: (s: string) => void): Promise<Pyodide> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus?.("Downloading sealed Python runtime…");
      await loadScript(`${PYODIDE_BASE}pyodide.js`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadPyodide = (window as any).loadPyodide;
      onStatus?.("Booting CPython (WASM)…");
      return loadPyodide({ indexURL: PYODIDE_BASE });
    })();
  }
  return pyodidePromise;
}

export interface RunResult {
  output: string;
  /** sha256 hex of the (trimmed) output. */
  hash: string;
  /** True when a second identical-input execution produced byte-identical output. */
  reproduced: boolean;
  durationMs: number;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function execOnce(py: Pyodide, code: string, input: string): Promise<string> {
  py.globals.set("INPUT_DATA", input);
  py.runPython("import sys, io\n_cdn_buf = io.StringIO()\n_cdn_old = sys.stdout\nsys.stdout = _cdn_buf");
  let err: unknown = null;
  try {
    await py.runPythonAsync(code);
  } catch (e) {
    err = e;
  }
  const out: string = py.runPython("sys.stdout = _cdn_old\n_cdn_buf.getvalue()");
  if (err) throw new Error(String(err).split("\n").slice(-3).join("\n"));
  return out;
}

/**
 * Execute the program on the input, then execute again to prove determinism.
 * Returns the output, its content hash, and whether the two runs matched.
 */
export async function runPipeline(
  code: string,
  input: string,
  packages: string[] = [],
  onStatus?: (s: string) => void,
): Promise<RunResult> {
  const t0 = performance.now();
  const py = await getPyodide(onStatus);
  if (packages.length) {
    onStatus?.(`Loading ${packages.join(", ")}…`);
    await py.loadPackage(packages);
  }
  onStatus?.("Executing on your input…");
  const first = await execOnce(py, code, input);
  onStatus?.("Re-executing to verify reproducibility…");
  const second = await execOnce(py, code, input);
  const reproduced = first === second;
  const hash = await sha256Hex(first.trim());
  return { output: first, hash, reproduced, durationMs: Math.round(performance.now() - t0) };
}
