import { z } from 'zod';

export const IssueCodeSchema = z.enum([
  'SCHEMA',
  'MISSING_FIELD',
  'INVALID_TAX_ID',
  'INVALID_DATE',
  'CURRENCY_MISMATCH',
  'RATE_NOT_ALLOWED',
  'LINE_MATH',
  'NO_TAX_BREAKDOWN',
  'MISSING_BRACKET',
  'UNEXPECTED_BRACKET',
  'BRACKET_BASE_MISMATCH',
  'BRACKET_TAX_MISMATCH',
  'TOTAL_MISMATCH',
  'RATE_CATEGORY_SUSPECT',
  /** A surcharge / withholding / stamp duty the country does not have (a misread). */
  'CHARGE_NOT_ALLOWED',
  'CHARGE_RATE_NOT_ALLOWED',
  /** Charge base or amount does not follow from the document. */
  'CHARGE_MISMATCH',
  /** Warning: the charge adds up but is unusual for a restaurant (recargo, bollo not due). */
  'CHARGE_NOTICE',
  /** Warning: tax-authority control code (PT ATCUD) missing or inconsistent. */
  'CONTROL_CODE',
]);
export type IssueCode = z.infer<typeof IssueCodeSchema>;

/** Codes that mean "the numbers do not add up". */
export const TAX_MATH_CODES: ReadonlySet<IssueCode> = new Set([
  'RATE_NOT_ALLOWED',
  'LINE_MATH',
  'MISSING_BRACKET',
  'UNEXPECTED_BRACKET',
  'BRACKET_BASE_MISMATCH',
  'BRACKET_TAX_MISMATCH',
  'TOTAL_MISMATCH',
  'CHARGE_RATE_NOT_ALLOWED',
  'CHARGE_MISMATCH',
]);

export const ValidationIssueSchema = z.object({
  code: IssueCodeSchema,
  severity: z.enum(['error', 'warning']),
  /** Human/LLM readable, with amounts in the country's number format. Fed back to the model on retry. */
  message: z.string(),
  path: z.string().nullable(),
  lineIndex: z.number().int().nullable(),
  expected: z.number().nullable(),
  found: z.number().nullable(),
});
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

export const ComputedBracketSchema = z.object({
  rate: z.number(),
  base: z.number(),
  tax: z.number(),
  /** How the tax was rounded to match the document: once per bracket, or per line then summed. */
  rounding: z.enum(['per_bracket', 'per_line']),
});
export type ComputedBracket = z.infer<typeof ComputedBracketSchema>;

export const ComputedTotalsSchema = z.object({
  lines: z.array(z.object({ index: z.number().int(), expectedAmount: z.number().nullable() })),
  brackets: z.array(ComputedBracketSchema),
  subtotal: z.number(),
  taxTotal: z.number(),
  /** Bases + tax + surcharges + stamp duty. */
  total: z.number(),
  /** Charges as computed from their rates and bases (not as printed); zero when the document has none. */
  charges: z
    .object({ surcharges: z.number(), stampDuty: z.number(), withholdings: z.number() })
    .default({ surcharges: 0, stampDuty: 0, withholdings: 0 }),
  /** total − withholdings: what the restaurant pays the supplier. */
  amountDue: z.number().nullable().default(null),
});
export type ComputedTotals = z.infer<typeof ComputedTotalsSchema>;

export const ValidationReportSchema = z.object({
  packCode: z.string(),
  packVersion: z.string(),
  /** Rates applied: the pack code, or pack + region ("PT-AZORES"); null when the document did not parse. */
  taxRegime: z.string().nullable().default(null),
  /** No error-severity issue at all. */
  passed: z.boolean(),
  taxIdValid: z.boolean(),
  taxIdType: z.string().nullable(),
  /** No error among TAX_MATH_CODES. */
  taxMathPassed: z.boolean(),
  /** |computed total - printed total|, null when no total is printed. */
  delta: z.number().nullable(),
  computed: ComputedTotalsSchema,
  issues: z.array(ValidationIssueSchema),
});
export type ValidationReport = z.infer<typeof ValidationReportSchema>;
