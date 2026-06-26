/* Verification engine — shared types. */

export type ToleranceKind = "exact" | "numeric" | "structural" | "checksum";

export interface NumericTolerance {
  atol: number;
  rtol: number;
}

export interface Comparison {
  name: string;
  kind: ToleranceKind;
  /** Author-declared expected output (text/JSON/CSV or a hex checksum). */
  expected: string;
  /** Actual output produced by the sandbox run. */
  actual: string;
  /** Optional override for numeric comparisons. */
  tolerance?: NumericTolerance;
  /** Optional override for structural float comparisons. */
  floatAtol?: number;
}

export interface DiffResult {
  name: string;
  kind: ToleranceKind;
  status: "match" | "mismatch";
  detail: string;
  tolerance?: string;
  maxAbsDelta?: number;
}

export interface VerificationReport {
  pass: boolean;
  diffs: DiffResult[];
  expectedOutputHash: string;
  actualOutputHash: string;
  comparedAt: string;
}
