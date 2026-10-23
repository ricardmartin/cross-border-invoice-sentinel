import { describe, expect, it } from 'vitest';
import { buildRetryFeedback, esPack, validateDocument, type ExtractedDocument } from '../src';
import { line, validEsInvoice } from './fixtures';

const run = (doc: ExtractedDocument, tolerance?: number) => validateDocument(doc, esPack, { tolerance });
const codes = (doc: ExtractedDocument) => run(doc).issues.map((i) => i.code);

describe('validateDocument (ES pack)', () => {
  it('passes a correct invoice with no issues and recomputes the totals', () => {
    const r = run(validEsInvoice());
    expect(r.issues).toEqual([]);
    expect(r).toMatchObject({ passed: true, taxIdValid: true, taxIdType: 'CIF', taxMathPassed: true, delta: 0, packCode: 'ES' });
    expect(r.computed).toMatchObject({ subtotal: 261.19, taxTotal: 29.32, total: 290.51 });
    expect(r.computed.brackets.map((b) => [b.rate, b.base, b.tax])).toEqual([
      [4, 47.13, 1.89],
      [10, 159.36, 15.94],
      [21, 54.7, 11.49],
    ]);
  });

  it('flags a line whose quantity × price does not match, with a concrete message', () => {
    const doc = validEsInvoice();
    doc.lines[1]!.lineAmount = 25;
    const r = run(doc);
    const lineIssue = r.issues.find((i) => i.code === 'LINE_MATH')!;
    expect(lineIssue).toMatchObject({ lineIndex: 1, expected: 24, found: 25 });
    expect(lineIssue.message).toBe('Line 2 ("Pan de hogaza"): 20 × 1,20 = 24,00 ≠ 25,00 printed');
    expect(r.taxMathPassed).toBe(false);
  });

  it('applies line discounts', () => {
    const doc = validEsInvoice();
    doc.lines[1] = { ...line('Pan de hogaza', 20, 1.2, 4, 21.6), discountPct: 10 };
    doc.printedTaxBreakdown[0] = { rate: 4, base: 44.73, tax: 1.79 };
    doc.printedTotal = 288.01;
    expect(run(doc).issues).toEqual([]);
  });

  it('flags a non-Spanish VAT rate even when the printed totals are consistent with it', () => {
    const doc = validEsInvoice();
    doc.lines[3]!.taxRate = 25;
    doc.printedTaxBreakdown[2] = { rate: 25, base: 54.7, tax: 13.68 };
    doc.printedTotal = 292.7;
    // Error for the illegal rate; the product-family hint adds a soft warning (detergent → 21 %).
    expect(codes(doc)).toEqual(['RATE_NOT_ALLOWED', 'RATE_CATEGORY_SUSPECT']);
  });

  it('flags a total shifted by 1,50 and reports Δ', () => {
    const doc = validEsInvoice();
    doc.printedTotal = 292.01;
    const r = run(doc);
    expect(codes(doc)).toEqual(['TOTAL_MISMATCH']);
    expect(r.delta).toBe(1.5);
    expect(r.issues[0]!.message).toContain('Δ 1,50');
  });

  it('accepts Δ up to the 0,02 tolerance and rejects 0,03', () => {
    const doc = validEsInvoice();
    doc.printedTotal = 290.53;
    expect(run(doc).passed).toBe(true);
    doc.printedTotal = 290.54;
    expect(codes(doc)).toEqual(['TOTAL_MISMATCH']);
    expect(run(doc, 0.05).passed).toBe(true);
  });

  it('flags a wrong tax amount in the printed breakdown and the total it inflates', () => {
    const doc = validEsInvoice();
    doc.printedTaxBreakdown[1]!.tax = 16.94; // supplier typed 16,94 instead of 15,94 and carried it to the total
    doc.printedTotal = 291.51;
    expect(codes(doc)).toEqual(['BRACKET_TAX_MISMATCH', 'TOTAL_MISMATCH']);
    expect(run(doc).delta).toBe(1);
  });

  it('accepts suppliers that round VAT per line instead of per bracket', () => {
    // 10 lines of 0,15 at 10 %: per line 0,015 → 0,02 each = 0,20; per bracket 1,50 × 10 % = 0,15.
    const doc: ExtractedDocument = {
      ...validEsInvoice(),
      lines: Array.from({ length: 10 }, (_, i) => line(`Sobre de azúcar ${i + 1}`, 1, 0.15, 10, 0.15)),
      printedTaxBreakdown: [{ rate: 10, base: 1.5, tax: 0.2 }],
      printedTotal: 1.7,
    };
    const r = run(doc);
    expect(r.issues).toEqual([]);
    expect(r.computed.brackets[0]).toMatchObject({ tax: 0.2, rounding: 'per_line' });
  });

  it('flags a bracket that is printed but used by no line, and one that is missing', () => {
    const doc = validEsInvoice();
    doc.printedTaxBreakdown[1]!.rate = 5;
    expect(codes(doc).sort()).toEqual(['MISSING_BRACKET', 'UNEXPECTED_BRACKET']);
  });

  it('flags an invalid issuer tax id without touching the tax math', () => {
    const doc = validEsInvoice();
    doc.issuer.taxId = 'A28015866';
    const r = run(doc);
    expect(r).toMatchObject({ passed: false, taxIdValid: false, taxMathPassed: true });
    expect(codes(doc)).toEqual(['INVALID_TAX_ID']);
  });

  it('requires prices on invoices but not on unvalued delivery notes', () => {
    const unpriced = validEsInvoice().lines.map((l) => ({ ...l, unitPrice: null, taxRate: null, lineAmount: null }));
    const note: ExtractedDocument = { ...validEsInvoice(), docType: 'DELIVERY_NOTE', lines: unpriced, printedTaxBreakdown: [], printedTotal: null };
    expect(run(note)).toMatchObject({ passed: true, delta: null });

    const invoice: ExtractedDocument = { ...note, docType: 'INVOICE' };
    expect(codes(invoice).every((c) => c === 'MISSING_FIELD')).toBe(true);
    expect(run(invoice).passed).toBe(false);
  });

  it('validates credit notes with negative amounts symmetrically', () => {
    const inv = validEsInvoice();
    const credit: ExtractedDocument = {
      ...inv,
      docType: 'CREDIT_NOTE',
      lines: inv.lines.map((l) => ({ ...l, quantity: -l.quantity, lineAmount: -l.lineAmount! })),
      printedTaxBreakdown: inv.printedTaxBreakdown.map((b) => ({ ...b, base: -b.base, tax: -b.tax })),
      printedTotal: -290.51,
    };
    expect(run(credit).issues).toEqual([]);
  });

  it('flags currency and date problems', () => {
    const doc = validEsInvoice();
    doc.currency = 'GBP';
    doc.issueDate = '2026-02-30';
    expect(codes(doc).sort()).toEqual(['CURRENCY_MISMATCH', 'INVALID_DATE']);
    doc.issueDate = '02/10/2026'; // schema requires ISO even if the pack could parse it
    expect(codes(doc)).toContain('INVALID_DATE');
  });

  it('returns SCHEMA issues instead of throwing on malformed input', () => {
    const doc = { ...validEsInvoice(), lines: [] };
    const r = run(doc);
    expect(r.passed).toBe(false);
    expect(r.taxMathPassed).toBe(false);
    expect(r.issues[0]).toMatchObject({ code: 'SCHEMA', path: 'lines' });
  });

  it('warns (without failing) when a product family suggests another rate', () => {
    const doc = validEsInvoice();
    doc.lines[3] = line('Cerveza Mahou 33cl', 24, 0.9, 10, 21.6);
    doc.printedTaxBreakdown = [
      { rate: 4, base: 47.13, tax: 1.89 },
      { rate: 10, base: 180.96, tax: 18.1 },
    ];
    doc.printedTotal = 248.08;
    const r = run(doc);
    expect(r.passed).toBe(true);
    expect(r.issues).toEqual([expect.objectContaining({ code: 'RATE_CATEGORY_SUSPECT', severity: 'warning', lineIndex: 3, expected: 21 })]);
  });

  it('warns when the document prints no tax breakdown at all', () => {
    const doc = { ...validEsInvoice(), printedTaxBreakdown: [] };
    const r = run(doc);
    expect(r.passed).toBe(true);
    expect(codes(doc)).toEqual(['NO_TAX_BREAKDOWN']);
  });
});

describe('buildRetryFeedback', () => {
  it('returns null when the report passed', () => {
    expect(buildRetryFeedback(run(validEsInvoice()))).toBeNull();
  });

  it('lists only errors, numbered, for the next extraction attempt', () => {
    const doc = validEsInvoice();
    doc.lines[1]!.lineAmount = 25;
    doc.lines[2]!.description = 'Cerveza artesana'; // 10 % on beer: warning only
    const feedback = buildRetryFeedback(run(doc))!;
    expect(feedback).toContain('1. Line 2 ("Pan de hogaza"): 20 × 1,20 = 24,00 ≠ 25,00 printed');
    expect(feedback).not.toContain('poco habitual');
  });
});
