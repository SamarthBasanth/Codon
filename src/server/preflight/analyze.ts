import { runStatcheck } from "./statcheck";
import { runGrim } from "./grim";
import { runGrimmer } from "./grimmer";
import { extractDois, checkDois } from "./citations";
import { aiHeuristics } from "./aiheuristics";

export type Severity = "fail" | "warn" | "info";
export type Category = "statistics" | "grim" | "citation" | "ai-text";

export interface Finding {
  start: number;
  end: number;
  snippet: string;
  category: Category;
  severity: Severity;
  title: string;
  reason: string;
  method: string;
  citation: string;
}

export interface CheckSummary {
  id: string;
  label: string;
  live: boolean;
  method: string;
  citation: string;
  status: "pass" | "warn" | "fail" | "skip";
  summary: string;
}

export interface AnalysisReport {
  findings: Finding[];
  checks: CheckSummary[];
  integrityScore: number;
  aiScore: number;
  burstiness: number;
  statsChecked: number;
  doisChecked: number;
  chars: number;
}

/**
 * Run every Preflight check over a manuscript excerpt and return annotated
 * findings (with character offsets), per-check summaries, and an integrity
 * score. statcheck, GRIM, and DOI resolution are real and deterministic; the
 * AI-text pass is an honest heuristic screen. Each finding carries the method
 * and the paper that backs it.
 */
export async function analyze(text: string): Promise<AnalysisReport> {
  const findings: Finding[] = [];

  // 1) statcheck — recomputed p-values
  const stat = runStatcheck(text);
  const statBad = stat.filter((s) => s.status !== "consistent");
  for (const s of statBad) {
    findings.push({
      start: s.start,
      end: s.end,
      snippet: s.raw,
      category: "statistics",
      severity: s.status === "decision-error" ? "fail" : "warn",
      title: s.status === "decision-error" ? "Statistical decision error" : "Statistical inconsistency",
      reason: s.detail,
      method: "statcheck",
      citation: "Nuijten et al., 2016, Behavior Research Methods",
    });
  }

  // 2) GRIM — impossible means
  const grim = runGrim(text).filter((g) => !g.consistent);
  for (const g of grim) {
    findings.push({
      start: g.start,
      end: g.end,
      snippet: g.raw,
      category: "grim",
      severity: "fail",
      title: "Impossible mean (GRIM)",
      reason: g.detail,
      method: "GRIM",
      citation: "Brown & Heathers, 2017, Soc. Psych. & Personality Science",
    });
  }

  // 2b) GRIMMER — impossible standard deviations
  const grimmer = runGrimmer(text);
  for (const g of grimmer) {
    findings.push({
      start: g.start,
      end: g.end,
      snippet: g.raw,
      category: "grim",
      severity: "fail",
      title: "Impossible SD (GRIMMER)",
      reason: g.detail,
      method: "GRIMMER",
      citation: "Anaya, 2016, PeerJ Preprints",
    });
  }

  // 3) Citation integrity — Crossref DOI resolution
  const dois = extractDois(text);
  const doiResults = await checkDois(dois);
  for (const d of doiResults) {
    if (d.status === "missing") {
      findings.push({
        start: d.start,
        end: d.end,
        snippet: d.doi,
        category: "citation",
        severity: "fail",
        title: "Reference does not resolve",
        reason: `DOI ${d.doi} returns 404 from Crossref — the cited work may not exist or is mistyped.`,
        method: "Crossref",
        citation: "Crossref REST API (api.crossref.org)",
      });
    } else if (d.status === "retracted") {
      findings.push({
        start: d.start,
        end: d.end,
        snippet: d.doi,
        category: "citation",
        severity: "fail",
        title: "Cited work is retracted",
        reason: `DOI ${d.doi} is flagged as retracted in Crossref — citing it as support is an integrity risk.`,
        method: "Crossref",
        citation: "Crossref / Retraction Watch",
      });
    }
  }

  // 4) AI-text — honest heuristic phrase flags
  const ai = aiHeuristics(text);
  for (const p of ai.phraseFlags) {
    findings.push({
      start: p.start,
      end: p.end,
      snippet: p.phrase,
      category: "ai-text",
      severity: "info",
      title: "Clichéd phrasing (AI-tell)",
      reason: `“${p.phrase}” is over-represented in machine-generated prose — worth a human read (heuristic, not proof).`,
      method: "heuristic",
      citation: "Sadasivan et al., 2023, arXiv:2303.11156",
    });
  }

  const missingOrRetracted = doiResults.filter(
    (d) => d.status === "missing" || d.status === "retracted",
  ).length;

  const checks: CheckSummary[] = [
    {
      id: "statistics",
      label: "Statistical consistency",
      live: true,
      method: "statcheck",
      citation: "Nuijten et al., 2016",
      status: statBad.some((s) => s.status === "decision-error")
        ? "fail"
        : statBad.length
          ? "warn"
          : stat.length
            ? "pass"
            : "skip",
      summary: stat.length
        ? `${stat.length} reported test${stat.length === 1 ? "" : "s"} recomputed · ${statBad.length} inconsistent`
        : "No reported NHST statistics found in the text.",
    },
    {
      id: "grim",
      label: "Impossible means & SDs (GRIM/GRIMMER)",
      live: true,
      method: "GRIM / GRIMMER",
      citation: "Brown & Heathers 2017; Anaya 2016",
      status: grim.length || grimmer.length ? "fail" : "pass",
      summary:
        grim.length || grimmer.length
          ? `${grim.length} impossible mean${grim.length === 1 ? "" : "s"}, ${grimmer.length} impossible SD${grimmer.length === 1 ? "" : "s"}`
          : "No GRIM/GRIMMER inconsistencies detected.",
    },
    {
      id: "citation",
      label: "Citation integrity",
      live: true,
      method: "Crossref",
      citation: "Crossref REST API",
      status: missingOrRetracted ? "fail" : dois.length ? "pass" : "skip",
      summary: dois.length
        ? `${dois.length} DOI${dois.length === 1 ? "" : "s"} checked · ${missingOrRetracted} unresolved/retracted`
        : "No DOIs found to verify.",
    },
    {
      id: "ai-text",
      label: "AI-generated text",
      live: false,
      method: "heuristic screen",
      citation: "Sadasivan et al., 2023",
      status: ai.score >= 55 ? "warn" : "pass",
      summary: ai.detail,
    },
  ];

  let score = 100;
  for (const f of findings) score -= f.severity === "fail" ? 15 : f.severity === "warn" ? 8 : 2;
  score = Math.max(0, Math.min(100, score));

  return {
    findings: findings.sort((a, b) => a.start - b.start),
    checks,
    integrityScore: score,
    aiScore: ai.score,
    burstiness: ai.burstiness,
    statsChecked: stat.length,
    doisChecked: dois.length,
    chars: text.length,
  };
}
