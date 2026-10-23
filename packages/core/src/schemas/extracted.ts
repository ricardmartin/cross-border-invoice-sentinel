import { z } from 'zod';

/**
 * What the LLM is allowed to produce: a faithful transcription of the document.
 * Every field is nullable rather than optional so the JSON Schema sent to the
 * model stays simple and "not printed" is explicit.
 */

export const DocTypeSchema = z.enum(['INVOICE', 'DELIVERY_NOTE', 'CREDIT_NOTE', 'OTHER']);
export type DocType = z.infer<typeof DocTypeSchema>;

export const CountryCodeSchema = z.string().regex(/^[A-Z]{2}$/, 'ISO 3166-1 alpha-2 code');
export const CurrencyCodeSchema = z.string().regex(/^[A-Z]{3}$/, 'ISO 4217 code');

export const TriageResultSchema = z.object({
  docType: DocTypeSchema,
  country: CountryCodeSchema.describe("Issuer's country, inferred from tax id, currency, language and address"),
  confidence: z.number().min(0).max(1),
  signals: z.array(z.string()).describe('Evidence used, e.g. "tax id B12345674 matches ES CIF", "language: Spanish"'),
});
export type TriageResult = z.infer<typeof TriageResultSchema>;

export const PartySchema = z.object({
  name: z.string().min(1),
  taxId: z.string().nullable().describe('Fiscal identifier exactly as printed, including any country prefix'),
  address: z.string().nullable(),
});
export type Party = z.infer<typeof PartySchema>;

export const ExtractedLineSchema = z.object({
  description: z.string().min(1),
  quantity: z.number(),
  unit: z.string().nullable().describe('As printed: kg, ud, caja, L, pièce, pz...'),
  unitPrice: z.number().nullable().describe('Net unit price before tax; null if not printed (e.g. unvalued delivery note)'),
  discountPct: z.number().min(0).max(100).nullable(),
  taxRate: z.number().min(0).max(100).nullable().describe('Tax rate in percent: 10 for 10%'),
  lineAmount: z.number().nullable().describe('Net line amount before tax, exactly as printed'),
});
export type ExtractedLine = z.infer<typeof ExtractedLineSchema>;

export const PrintedTaxBracketSchema = z.object({
  rate: z.number().min(0).max(100),
  base: z.number(),
  tax: z.number(),
});
export type PrintedTaxBracket = z.infer<typeof PrintedTaxBracketSchema>;

/**
 * Rows of the summary that are neither a line nor VAT: a surcharge added to the total
 * (ES "recargo de equivalencia"), a withholding subtracted from it (ES "retención IRPF",
 * IT "ritenuta d'acconto"), a fixed stamp duty (IT "bollo"). Which kinds are legal, and
 * at what rates, comes from the country pack.
 */
export const ChargeKindSchema = z.enum(['SURCHARGE', 'WITHHOLDING', 'STAMP_DUTY']);
export type ChargeKind = z.infer<typeof ChargeKindSchema>;

export const PrintedChargeSchema = z.object({
  kind: ChargeKindSchema,
  label: z.string().describe('As printed: "Recargo de equivalencia 5,2 %", "Retención IRPF", "Ritenuta d\'acconto", "Bollo"'),
  rate: z.number().min(0).max(100).nullable().describe('Percent as printed; null for a fixed amount'),
  base: z.number().nullable().describe('Base the rate applies to, as printed; null if not printed'),
  amount: z.number().describe('Amount as printed, always positive (a withholding printed "-30,00" is 30)'),
});
export type PrintedCharge = z.infer<typeof PrintedChargeSchema>;

export const ExtractedDocumentSchema = z.object({
  docType: DocTypeSchema,
  country: CountryCodeSchema,
  documentNumber: z.string().min(1),
  issueDate: z.string().describe('ISO date YYYY-MM-DD'),
  currency: CurrencyCodeSchema,
  issuer: PartySchema,
  recipient: PartySchema,
  lines: z.array(ExtractedLineSchema).min(1),
  printedTaxBreakdown: z.array(PrintedTaxBracketSchema).describe('Tax summary table as printed; empty if none'),
  /** Optional so documents transcribed before this field existed (ground truths, stored reads) stay valid; absent = none. */
  printedCharges: z.array(PrintedChargeSchema).optional().describe('Surcharges, withholdings and stamp duties as printed; empty if none'),
  printedTotal: z.number().nullable().describe('Amount due as printed (after withholdings when the document prints one); null on unvalued delivery notes'),
  deliveryNoteRefs: z.array(z.string()).describe('Delivery note numbers referenced by an invoice; empty if none'),
  documentControlCode: z.string().nullable().optional().describe('Tax-authority control code printed on the document (PT: ATCUD), exactly as printed'),
});
export type ExtractedDocument = z.infer<typeof ExtractedDocumentSchema>;
