/**
 * AI-generated-text heuristics — HONEST screening, not proof.
 *
 * There is no reliable, general detector of machine-generated text: OpenAI
 * retired its own classifier (2023) for low accuracy, and Sadasivan et al.
 * (2023, arXiv:2303.11156, "Can AI-Generated Text Be Reliably Detected?") show
 * detectors are brittle and can be evaded. So we DO NOT claim to "detect AI."
 * Instead we surface transparent, inspectable signals a human editor can weigh:
 *   • low burstiness (uniform sentence length — a known LLM tendency)
 *   • high density of clichéd "LLM-tell" phrases
 * Each flagged phrase is annotated with its location for human review.
 */

export interface PhraseFlag {
  start: number;
  end: number;
  phrase: string;
}

export interface AiSignal {
  score: number; // 0–100 heuristic screening score (higher = more worth a look)
  burstiness: number; // sentence-length coefficient of variation (higher = more human-like)
  phraseFlags: PhraseFlag[];
  detail: string;
}

// Phrases over-represented in LLM prose (curated from public detector write-ups).
const TELLS = [
  "delve into",
  "it is important to note",
  "it is worth noting",
  "a testament to",
  "plays a (?:pivotal|crucial|significant) role",
  "navigating the",
  "in today'?s (?:world|landscape)",
  "rich tapestry",
  "tapestry of",
  "underscore(?:s|d)? the importance",
  "leverage(?:s|d)? the",
  "the realm of",
  "meticulous(?:ly)?",
  "furthermore,? it",
  "in conclusion,",
  "paves the way",
  "unlock(?:ing)? the potential",
  "at the forefront of",
  "shed light on",
];

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .filter((s) => s.trim().length > 0);
}

export function aiHeuristics(text: string): AiSignal {
  const sentences = splitSentences(text);
  const lens = sentences.map((s) => s.split(/\s+/).length).filter((n) => n > 1);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const variance = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1);
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coefficient of variation

  const phraseFlags: PhraseFlag[] = [];
  for (const t of TELLS) {
    const re = new RegExp(`\\b(${t})\\b`, "gi");
    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0;
      phraseFlags.push({ start, end: start + m[0].length, phrase: m[0] });
    }
  }

  const words = Math.max(1, text.split(/\s+/).length);
  const phraseDensity = (phraseFlags.length / words) * 1000; // per 1000 words

  // Composite screening score: low burstiness + high cliché density → higher.
  const burstScore = cv < 0.35 ? 45 : cv < 0.5 ? 25 : cv < 0.65 ? 10 : 0;
  const phraseScore = Math.min(45, phraseDensity * 9);
  const score = Math.round(Math.min(100, burstScore + phraseScore));

  const detail =
    `Heuristic screen only (detectors are unreliable). Sentence-length burstiness ` +
    `CV = ${cv.toFixed(2)} (${cv < 0.4 ? "unusually uniform" : "within human range"}); ` +
    `${phraseFlags.length} clichéd phrase${phraseFlags.length === 1 ? "" : "s"} flagged for human review.`;

  return {
    score,
    burstiness: Number(cv.toFixed(2)),
    phraseFlags: phraseFlags.sort((a, b) => a.start - b.start),
    detail,
  };
}
