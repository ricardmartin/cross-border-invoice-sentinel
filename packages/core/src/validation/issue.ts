import type { ValidationIssue } from '../schemas/validated';

export const issue = (
  code: ValidationIssue['code'],
  severity: ValidationIssue['severity'],
  message: string,
  extra: Partial<Pick<ValidationIssue, 'path' | 'lineIndex' | 'expected' | 'found'>> = {},
): ValidationIssue => ({ code, severity, message, path: null, lineIndex: null, expected: null, found: null, ...extra });
