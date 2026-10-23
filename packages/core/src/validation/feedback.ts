import type { ValidationReport } from '../schemas/validated';

/**
 * Turns a failed report into concrete instructions for a re-extraction attempt.
 * Only errors are sent: warnings are not a reason to re-read the document.
 */
export function buildRetryFeedback(report: ValidationReport): string | null {
  const errors = report.issues.filter((i) => i.severity === 'error');
  if (!errors.length) return null;
  return [
    'Your previous extraction does not pass these deterministic checks:',
    ...errors.map((e, n) => `${n + 1}. ${e.message}`),
    '',
    'Look at the document again and re-read ONLY the fields involved (quantities, unit prices, line amounts, rates, the tax summary, the total, the tax id).',
    'If the document itself really prints these numbers, transcribe them exactly as printed: do not "fix" the supplier\'s arithmetic.',
  ].join('\n');
}
