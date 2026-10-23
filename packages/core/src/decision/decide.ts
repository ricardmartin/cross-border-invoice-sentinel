import type { FinalStatus } from '../schemas/status';
import type { IssueCode, ValidationReport } from '../schemas/validated';

/**
 * Pure decision logic for "extraction error vs supplier error".
 *
 * A failed validation is first blamed on the extraction and retried with the
 * concrete errors. A failure only counts as real (the document itself says it)
 * when two independent reads agree on it: same error codes, same places, same
 * printed values. Reads that keep changing, or never agree, mean we cannot
 * trust the extraction → EXTRACTION_UNCERTAIN (human review, never a claim).
 *
 * A read that passes only after being told what was wrong is not trusted on
 * its own: the feedback can lead a model to "repair" what the supplier printed
 * (e.g. recompute a tax id's control digit) instead of transcribing it. It must
 * be reproduced by a blind read, one that sees neither the feedback nor the
 * previous attempt.
 */

export interface AttemptSummary {
  index: number;
  role: 'primary' | 'escalation';
  report: ValidationReport;
  /** The read saw the previous attempt and the validator's errors. */
  withFeedback?: boolean;
}

export interface LoopConfig {
  /** Re-extractions with the primary model after the first attempt. */
  maxRetries: number;
  /** One final attempt with the stronger model when the primary never settles. */
  cascade: boolean;
}

export const DEFAULT_LOOP_CONFIG: LoopConfig = { maxRetries: 2, cascade: true };

export type StopReason = 'passed' | 'confirmed' | 'exhausted' | 'unverified';
export type NextAction =
  | { kind: 'stop'; reason: StopReason; agreeingAttempts?: [number, number] }
  /** blind: no feedback and no previous attempt, to verify a read that passed after feedback. */
  | { kind: 'retry'; role: 'primary' | 'escalation'; blind?: true };

/** Errors that a supplier can genuinely print; anything else is an extraction problem. */
const SUPPLIER_CODES = new Set<IssueCode>([
  'INVALID_TAX_ID',
  'RATE_NOT_ALLOWED',
  'LINE_MATH',
  'MISSING_BRACKET',
  'UNEXPECTED_BRACKET',
  'BRACKET_BASE_MISMATCH',
  'BRACKET_TAX_MISMATCH',
  'TOTAL_MISMATCH',
  'CHARGE_RATE_NOT_ALLOWED',
  'CHARGE_MISMATCH',
  // Not CHARGE_NOT_ALLOWED: a charge the country does not have is a misread, not something to claim.
]);

/** Stable fingerprint of a report's errors: what failed, where, and the printed value read. */
export function errorSignature(report: ValidationReport): string {
  return report.issues
    .filter((i) => i.severity === 'error')
    .map((i) => `${i.code}|${i.path ?? ''}|${i.lineIndex ?? ''}|${i.found ?? ''}`)
    .sort()
    .join('\n');
}

function findAgreement(attempts: AttemptSummary[]): [number, number] | undefined {
  const last = attempts.at(-1);
  if (!last) return undefined;
  const sig = errorSignature(last.report);
  if (!sig) return undefined;
  const earlier = attempts.slice(0, -1).find((a) => errorSignature(a.report) === sig);
  return earlier ? [earlier.index, last.index] : undefined;
}

export function nextAction(attempts: AttemptSummary[], cfg: LoopConfig = DEFAULT_LOOP_CONFIG): NextAction {
  const last = attempts.at(-1);
  if (!last) return { kind: 'retry', role: 'primary' };
  if (last.report.passed) {
    // Outside the retry budget: a verification read is always allowed, and only once (the blind read sees no feedback).
    return last.withFeedback ? { kind: 'retry', role: last.role, blind: true } : { kind: 'stop', reason: 'passed' };
  }

  const agreement = findAgreement(attempts);
  if (agreement) return { kind: 'stop', reason: 'confirmed', agreeingAttempts: agreement };

  // The blind read neither passed nor reproduced an earlier error: the corrected read stays unverified.
  if (attempts.at(-2)?.report.passed) return { kind: 'stop', reason: 'unverified' };

  const primaryRuns = attempts.filter((a) => a.role === 'primary').length;
  if (primaryRuns < 1 + cfg.maxRetries) return { kind: 'retry', role: 'primary' };
  if (cfg.cascade && !attempts.some((a) => a.role === 'escalation')) return { kind: 'retry', role: 'escalation' };
  return { kind: 'stop', reason: 'exhausted' };
}

export interface Decision {
  status: FinalStatus;
  reason: string;
}

export function decideFinalStatus(attempts: AttemptSummary[], stop: Extract<NextAction, { kind: 'stop' }>): Decision {
  const final = attempts.at(-1)!;
  const n = attempts.length;
  if (stop.reason === 'passed') {
    return {
      status: 'VALID',
      reason: n === 1 ? 'All checks passed on the first read' : `All checks passed after ${n} reads (self-corrected, confirmed by a blind read)`,
    };
  }
  if (stop.reason === 'exhausted') {
    return { status: 'EXTRACTION_UNCERTAIN', reason: `${n} reads never passed nor agreed on the same errors: needs human review` };
  }
  if (stop.reason === 'unverified') {
    return {
      status: 'EXTRACTION_UNCERTAIN',
      reason: `read #${n - 1} passed only after feedback and the blind read #${n} did not confirm it: needs human review`,
    };
  }

  const codes = [...new Set(final.report.issues.filter((i) => i.severity === 'error').map((i) => i.code))];
  const [a, b] = stop.agreeingAttempts!;
  const agreed = `reads #${a} and #${b} agree`;
  if (codes.some((c) => !SUPPLIER_CODES.has(c))) {
    return { status: 'EXTRACTION_UNCERTAIN', reason: `${agreed}, but on extraction-level problems (${codes.join(', ')})` };
  }
  if (codes.includes('INVALID_TAX_ID')) {
    return { status: 'INVALID_TAX_ID', reason: `${agreed}: the printed issuer tax id fails its checksum` };
  }
  return { status: 'SUPPLIER_DISCREPANCY', reason: `${agreed} on ${codes.join(', ')}: the document itself does not add up` };
}
