import { describe, expect, it } from 'vitest';
import { computeClaimAmount, decideFinalStatus, esPack, ExtractionOutputSchema, StoredExtractionSchema, frPack, itPack, nextAction, ptPack, validateDocument, type ExtractedDocument, type PrintedCharge } from '../src';
import { line, validEsInvoice } from './fixtures';

const codes = (d: ExtractedDocument, pack = esPack) => validateDocument(d, pack).issues.map((i) => [i.code, i.severity]);
const withCharges = (charges: PrintedCharge[], printedTotal: number, d = validEsInvoice()): ExtractedDocument => ({ ...d, printedCharges: charges, printedTotal });

/**
 * validEsInvoice: bases 4 % 47,13 · 10 % 159,36 · 21 % 54,70 = 261,19; IVA 29,32; total 290,51.
 * Recargo: 47,13 × 0,5 % = 0,24 · 159,36 × 1,4 % = 2,23 · 54,70 × 5,2 % = 2,84 → total 295,82.
 * IRPF 15 % on 261,19 = 39,18 → amount due 251,33.
 */
const recargo = (amount21 = 2.84): PrintedCharge[] => [
  { kind: 'SURCHARGE', label: 'R.E. 0,5 %', rate: 0.5, base: 47.13, amount: 0.24 },
  { kind: 'SURCHARGE', label: 'R.E. 1,4 %', rate: 1.4, base: 159.36, amount: 2.23 },
  { kind: 'SURCHARGE', label: 'R.E. 5,2 %', rate: 5.2, base: 54.7, amount: amount21 },
];
const irpf = (rate = 15, amount = 39.18): PrintedCharge => ({ kind: 'WITHHOLDING', label: `Retención IRPF ${rate} %`, rate, base: 261.19, amount });

describe('recargo de equivalencia (ES)', () => {
  it('adds up: passes, with one notice for a human (restaurants are normally not in the regime)', () => {
    const r = validateDocument(withCharges(recargo(), 295.82), esPack);
    expect(r.passed).toBe(true);
    expect(r.issues.map((i) => [i.code, i.severity])).toEqual([['CHARGE_NOTICE', 'warning']]);
    expect(r.computed.charges.surcharges).toBe(5.31);
    expect(r.computed.total).toBe(295.82);
  });

  it('ignoring it would have been an unfair claim: the same total without the rows fails', () => {
    expect(codes({ ...validEsInvoice(), printedTotal: 295.82 })).toContainEqual(['TOTAL_MISMATCH', 'error']);
  });

  it('an over-charged surcharge is a supplier error, and only the excess is claimed', () => {
    const doc = withCharges(recargo(3.84), 296.82);
    const r = validateDocument(doc, esPack);
    expect(r.issues.filter((i) => i.severity === 'error').map((i) => i.code).sort()).toEqual(['CHARGE_MISMATCH', 'TOTAL_MISMATCH']);
    expect(computeClaimAmount(doc, null, r.computed.charges).total).toBe(1);
  });

  it('a surcharge rate that belongs to no IVA rate, or to one no line uses', () => {
    expect(codes(withCharges([{ kind: 'SURCHARGE', label: 'R.E. 4 %', rate: 4, base: 54.7, amount: 2.19 }], 292.7))).toContainEqual([
      'CHARGE_RATE_NOT_ALLOWED',
      'error',
    ]);
    const only21 = { ...validEsInvoice(), lines: [line('Detergente lavavajillas', 2, 27.35, 21, 54.7)], printedTaxBreakdown: [{ rate: 21, base: 54.7, tax: 11.49 }] };
    expect(codes(withCharges([{ kind: 'SURCHARGE', label: 'R.E. 1,4 %', rate: 1.4, base: 54.7, amount: 0.77 }], 66.96, only21))).toContainEqual([
      'CHARGE_MISMATCH',
      'error',
    ]);
  });
});

describe('retención IRPF (ES)', () => {
  it('the printed total may be the amount due after the withholding, or the gross total', () => {
    expect(validateDocument(withCharges([irpf()], 251.33), esPack)).toMatchObject({ passed: true, computed: { amountDue: 251.33, total: 290.51 } });
    expect(validateDocument(withCharges([irpf()], 290.51), esPack).passed).toBe(true);
  });

  it('a wrong amount or a rate that does not exist', () => {
    expect(codes(withCharges([irpf(15, 40.18)], 250.33))).toContainEqual(['CHARGE_MISMATCH', 'error']);
    expect(codes(withCharges([irpf(18, 47.01)], 243.5))).toContainEqual(['CHARGE_RATE_NOT_ALLOWED', 'error']);
  });

  it('the claim is measured against the amount due when that is what the document prints', () => {
    const doc = withCharges([irpf()], 252.83);
    const r = validateDocument(doc, esPack);
    expect(r.issues.map((i) => i.code)).toEqual(['TOTAL_MISMATCH']);
    expect(computeClaimAmount(doc, null, r.computed.charges).total).toBe(1.5);
  });

  it('the total message names the charges (it is the retry feedback)', () => {
    const msg = validateDocument(withCharges([irpf()], 252.83), esPack).issues[0]!.message;
    expect(msg).toContain('− withholdings 39,18 = 251,33');
  });
});

describe('charges a country does not have', () => {
  const frDoc = (): ExtractedDocument => ({
    ...validEsInvoice(),
    country: 'FR',
    issuer: { name: 'Fournisseur', taxId: 'FR40303265045', address: null },
    lines: [line('Lessive', 2, 27.35, 20, 54.7)],
    printedTaxBreakdown: [{ rate: 20, base: 54.7, tax: 10.94 }],
    printedTotal: 65.64,
  });

  it('are a misread, never a supplier error: two agreeing reads end in human review', () => {
    const doc = withCharges([{ kind: 'WITHHOLDING', label: 'Retenue', rate: 15, base: 54.7, amount: 8.21 }], 57.43, frDoc());
    const report = validateDocument(doc, frPack);
    expect(report.issues.map((i) => i.code)).toContain('CHARGE_NOT_ALLOWED');
    const attempts = [1, 2].map((index) => ({ index, role: 'primary' as const, report }));
    const stop = nextAction(attempts);
    expect(stop).toMatchObject({ kind: 'stop', reason: 'confirmed' });
    expect(decideFinalStatus(attempts, stop as Extract<typeof stop, { kind: 'stop' }>).status).toBe('EXTRACTION_UNCERTAIN');
  });
});

describe("ritenuta d'acconto and bollo (IT)", () => {
  const itDoc = (rate: number, amount: number): ExtractedDocument => ({
    ...validEsInvoice(),
    country: 'IT',
    issuer: { name: 'Studio HACCP', taxId: '07643520567', address: null },
    lines: [line('Consulenza HACCP', 1, amount, rate, amount)],
    printedTaxBreakdown: [{ rate, base: amount, tax: (amount * rate) / 100 }],
    printedTotal: amount + (amount * rate) / 100,
  });

  it('ritenuta 20 %: Netto a pagare = totale − ritenuta', () => {
    const doc = withCharges([{ kind: 'WITHHOLDING', label: "Ritenuta d'acconto 20 %", rate: 20, base: 500, amount: 100 }], 510, itDoc(22, 500));
    expect(validateDocument(doc, itPack)).toMatchObject({ passed: true, computed: { total: 610, amountDue: 510 } });
  });

  it('bollo adds 2,00 and is flagged when nothing on the invoice is VAT-exempt', () => {
    const doc = withCharges([{ kind: 'STAMP_DUTY', label: 'Bollo', rate: null, base: null, amount: 2 }], 106, itDoc(4, 100));
    const r = validateDocument(doc, itPack);
    expect(r.passed).toBe(true);
    expect(r.issues.map((i) => [i.code, i.severity])).toEqual([['CHARGE_NOTICE', 'warning']]);
    expect(codes(withCharges([{ kind: 'STAMP_DUTY', label: 'Bollo', rate: null, base: null, amount: 3 }], 107, itDoc(4, 100)), itPack)).toContainEqual([
      'CHARGE_MISMATCH',
      'error',
    ]);
  });
});

describe('IPSI (Ceuta, Melilla)', () => {
  const at = (address: string, d = validEsInvoice()): ExtractedDocument => ({ ...d, recipient: { ...d.recipient, address } });
  const ipsi = (): ExtractedDocument => ({
    ...validEsInvoice(),
    lines: [line('Pan de hogaza', 20, 1.2, 0.5, 24), line('Detergente lavavajillas', 2, 27.35, 10, 54.7)],
    printedTaxBreakdown: [
      { rate: 0.5, base: 24, tax: 0.12 },
      { rate: 10, base: 54.7, tax: 5.47 },
    ],
    printedTotal: 84.29,
  });

  it('IPSI rates pass in Ceuta and Melilla, and are wrong on the mainland', () => {
    expect(validateDocument(at('C/ Real 12 · 51001 Ceuta', ipsi()), esPack)).toMatchObject({ passed: true, taxRegime: 'ES-CEUTA' });
    expect(validateDocument(at('Av. Juan Carlos I 3 · 52001 Melilla', ipsi()), esPack)).toMatchObject({ passed: true, taxRegime: 'ES-MELILLA' });
    expect(codes(at('Calle Mayor 1 · 28013 Madrid', ipsi()))).toContainEqual(['RATE_NOT_ALLOWED', 'error']);
  });

  it('IVA at 21 % in Ceuta is an error, named with the regime', () => {
    const msg = validateDocument(at('C/ Real 12 · 51001 Ceuta'), esPack).issues.find((i) => i.code === 'RATE_NOT_ALLOWED')!.message;
    expect(msg).toContain('not allowed in ES (Ceuta, IPSI)');
  });
});

describe('ATCUD (PT)', () => {
  const ptDoc = (documentControlCode: string | null, documentNumber = 'FT 2026A/1500'): ExtractedDocument => ({
    ...validEsInvoice(),
    country: 'PT',
    documentNumber,
    issuer: { name: 'Fornecedor', taxId: 'PT503504564', address: null },
    recipient: { name: 'Restaurante', taxId: null, address: '1100-285 Lisboa' },
    lines: [line('Detergente 5L', 10, 14.2, 23, 142)],
    printedTaxBreakdown: [{ rate: 23, base: 142, tax: 32.66 }],
    printedTotal: 174.66,
    documentControlCode,
  });
  const warnings = (d: ExtractedDocument) => validateDocument(d, ptPack).issues.filter((i) => i.code === 'CONTROL_CODE').map((i) => i.message);

  it('a well-formed ATCUD whose sequence is the document number', () => {
    expect(warnings(ptDoc('JFQ4K2M7-1500'))).toEqual([]);
    expect(warnings(ptDoc('ATCUD: JFQ4K2M7-1500'))).toEqual([]);
  });

  it('missing, malformed or with another sequence number: a warning, never a failed check', () => {
    expect(warnings(ptDoc(null))[0]).toContain('missing');
    expect(warnings(ptDoc('JFQ4'))[0]).toContain('is not <validation code>-<sequence number>');
    expect(warnings(ptDoc('JFQ4K2M7-1499'))[0]).toContain('does not match document number FT 2026A/1500');
    expect(validateDocument(ptDoc(null), ptPack).passed).toBe(true);
  });

  it('only invoices and credit notes carry it', () => {
    expect(warnings({ ...ptDoc(null), docType: 'DELIVERY_NOTE' })).toEqual([]);
  });
});

describe('runs suspended before extract-v3', () => {
  it('a stored read without printedCharges / documentControlCode still validates (resuming a claim review)', () => {
    const { printedCharges: _c, documentControlCode: _a, ...old } = { ...validEsInvoice(), printedCharges: [], documentControlCode: null };
    expect(ExtractionOutputSchema.safeParse(old).success).toBe(false); // the model is always asked for them
    expect(StoredExtractionSchema.parse(old)).toMatchObject({ printedCharges: [], documentControlCode: null });
  });
});
