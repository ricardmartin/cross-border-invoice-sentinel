import type { ExtractedDocument, ExtractedLine } from '../src';

export const line = (description: string, quantity: number, unitPrice: number, taxRate: number, lineAmount: number): ExtractedLine => ({
  description,
  quantity,
  unit: 'ud',
  unitPrice,
  discountPct: null,
  taxRate,
  lineAmount,
});

/**
 * Hand-computed valid Spanish invoice:
 *   4 %: 23,13 (12,5 × 1,85 = 23,125 → 23,13) + 24,00 = 47,13 → IVA 1,89
 *  10 %: 159,36 (6,4 × 24,90)                         → IVA 15,94
 *  21 %: 54,70 (2 × 27,35)                            → IVA 11,49
 *  Total = 261,19 + 29,32 = 290,51
 */
export const validEsInvoice = (): ExtractedDocument => ({
  docType: 'INVOICE',
  country: 'ES',
  documentNumber: 'F-2026/04512',
  issueDate: '2026-10-02',
  currency: 'EUR',
  issuer: { name: 'Distribuciones Levante S.L.', taxId: 'A28015865', address: 'Valencia' },
  recipient: { name: 'Restaurante La Barra S.L.', taxId: 'B87123451', address: 'Madrid' },
  lines: [
    line('Tomate pera', 12.5, 1.85, 4, 23.13),
    line('Pan de hogaza', 20, 1.2, 4, 24),
    line('Ternera lomo bajo', 6.4, 24.9, 10, 159.36),
    line('Detergente lavavajillas', 2, 27.35, 21, 54.7),
  ],
  printedTaxBreakdown: [
    { rate: 4, base: 47.13, tax: 1.89 },
    { rate: 10, base: 159.36, tax: 15.94 },
    { rate: 21, base: 54.7, tax: 11.49 },
  ],
  printedTotal: 290.51,
  deliveryNoteRefs: ['ALB-4512'],
});
