import { z } from 'zod';

/**
 * Final decision for a processed document.
 * - VALID: extraction adds up and nothing to claim.
 * - EXTRACTION_UNCERTAIN: still inconsistent after retries (and model cascade) → human review, never a claim.
 * - SUPPLIER_DISCREPANCY: extraction is consistent, but the document or the delivery note shows a supplier error.
 * - INVALID_TAX_ID: issuer fiscal id fails format/checksum after retries.
 */
export const FinalStatusSchema = z.enum(['VALID', 'EXTRACTION_UNCERTAIN', 'SUPPLIER_DISCREPANCY', 'INVALID_TAX_ID']);
export type FinalStatus = z.infer<typeof FinalStatusSchema>;
