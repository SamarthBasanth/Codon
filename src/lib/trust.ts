import type { Method } from "./mockData";

/**
 * Trust Score — a transparent, honest composite. It is NOT a black-box number:
 * it is the sum of concrete, verifiable properties of the stored verification
 * record, each shown to the user. A method that only passes some factors scores
 * lower; nothing is invented.
 */
export interface TrustFactor {
  label: string;
  met: boolean;
  points: number;
}
export interface TrustScore {
  score: number;
  max: number;
  label: "High" | "Solid" | "Partial" | "Unverified";
  factors: TrustFactor[];
}

export function trustScore(m: Method): TrustScore {
  const v = m.verification;
  const reproduced = v.status === "verified" || v.status === "external-dep";
  const allMatch = v.diff.length > 0 && v.diff.every((d) => d.status === "match");
  const sealed = /no network|network disabled|no-network|none|no egress|offline/i.test(
    `${v.resourceLimits.egress}`,
  );
  const hashed = Boolean(v.expectedOutputHash);
  const deterministic = /exact|byte-identical/i.test(v.toleranceProfile);

  const factors: TrustFactor[] = [
    { label: "Reproduced in a sealed sandbox", met: reproduced, points: 40 },
    { label: "All declared outputs match", met: allMatch, points: 25 },
    { label: "No network egress during the run", met: sealed, points: 15 },
    { label: "Content-addressed output hash", met: hashed, points: 10 },
    { label: "Deterministic (byte-identical across runs)", met: deterministic, points: 10 },
  ];

  const score = factors.reduce((a, f) => a + (f.met ? f.points : 0), 0);
  const max = factors.reduce((a, f) => a + f.points, 0);
  const label: TrustScore["label"] = !reproduced
    ? "Unverified"
    : score >= 90
      ? "High"
      : score >= 70
        ? "Solid"
        : "Partial";

  return { score, max, label, factors };
}
