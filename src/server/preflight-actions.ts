"use server";

import { analyze, type AnalysisReport } from "./preflight/analyze";

export interface AnalyzeResult {
  ok: boolean;
  report?: AnalysisReport;
  error?: string;
}

/**
 * Run the real Preflight integrity engine over a pasted manuscript excerpt.
 * Caps input length; the engine itself does statcheck + GRIM + Crossref DOI
 * checks + heuristic AI-text screening, returning annotated findings.
 */
export async function analyzeManuscript(text: string): Promise<AnalyzeResult> {
  const t = (text ?? "").slice(0, 24000);
  if (t.trim().length < 40) {
    return { ok: false, error: "Paste at least a paragraph — results and methods sections work best." };
  }
  try {
    const report = await analyze(t);
    return { ok: true, report };
  } catch {
    return { ok: false, error: "Something went wrong analyzing that text. Try a shorter excerpt." };
  }
}
