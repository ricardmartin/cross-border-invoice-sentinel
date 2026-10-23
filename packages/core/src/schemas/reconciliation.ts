import { z } from 'zod';

/** Invoice ↔ delivery note matching (implemented in phase 4; contract fixed now). */

export const ReconciliationStatusSchema = z.enum(['SIN_DISCREPANCIA', 'DISCREPANCIA', 'FALTAN_DOCUMENTOS']);
export type ReconciliationStatus = z.infer<typeof ReconciliationStatusSchema>;

export const LineMatchKindSchema = z.enum(['MATCH', 'QUANTITY_DIFF', 'PRICE_DIFF', 'MISSING_IN_DELIVERY_NOTE', 'MISSING_IN_INVOICE']);

export const ReconciliationLineSchema = z.object({
  kind: LineMatchKindSchema,
  sku: z.string().nullable(),
  invoiceLineIndex: z.number().int().nullable(),
  deliveryNoteLineIndex: z.number().int().nullable(),
  invoiceQuantity: z.number().nullable(),
  deliveredQuantity: z.number().nullable(),
  invoiceUnitPrice: z.number().nullable(),
  deliveryNoteUnitPrice: z.number().nullable(),
  /** Net amount billed in excess for this line (positive = supplier overbilled). */
  amountAtStake: z.number(),
});
export type ReconciliationLine = z.infer<typeof ReconciliationLineSchema>;

export const ReconciliationResultSchema = z.object({
  status: ReconciliationStatusSchema,
  invoiceNumber: z.string(),
  deliveryNoteNumbers: z.array(z.string()),
  lines: z.array(ReconciliationLineSchema),
  amountAtStake: z.number(),
});
export type ReconciliationResult = z.infer<typeof ReconciliationResultSchema>;
