import { describe, expect, it } from 'vitest';
import {
  applyContractCheck,
  buildClaimFacts,
  checkContractPrices,
  computeClaimAmount,
  esPack,
  validateDocument,
  type ContractLineMatch,
  type ReconciliationResult,
} from '../src';
import { validEsInvoice } from './fixtures';

const clause = (id: string, amount: number, unit: string | null = 'ud', currency = 'EUR') => ({
  id,
  contractId: id.split('#')[0]!,
  clause: id.split('#')[1]!,
  title: 'x',
  contractKind: 'framework',
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  restaurantTaxId: null,
  price: { amount, currency, unit },
});
const matched = (index: number, c: ReturnType<typeof clause>): ContractLineMatch => ({
  index,
  outcome: 'MATCHED',
  clause: c,
  reason: 'test',
  decidedBy: 'rule',
  llmCalls: 0,
  inputTokens: 0,
  outputTokens: 0,
  costUsd: 0,
  latencyMs: 1,
  threadId: `t${index}`,
});
const other = (index: number, outcome: 'NO_CONTRACT' | 'AMBIGUOUS'): ContractLineMatch => ({ ...matched(index, clause('C#1', 0)), outcome, clause: null });

/** Lines 0..3 of validEsInvoice at their invoiced prices. */
const atContract = () => [matched(0, clause('CT#3.1', 1.85)), matched(1, clause('CT#3.2', 1.2)), matched(2, clause('CT#3.3', 24.9)), matched(3, clause('CT#3.4', 27.35))];

describe('checkContractPrices', () => {
  it('finds nothing to claim when every line is at its agreed price', () => {
    const r = checkContractPrices(validEsInvoice(), atContract());
    expect(r.amountAtStake).toBe(0);
    expect(r.lines.map((l) => l.kind)).toEqual(['AT_CONTRACT', 'AT_CONTRACT', 'AT_CONTRACT', 'AT_CONTRACT']);
  });

  it('claims quantity × price difference plus VAT, in cents', () => {
    const m = atContract();
    m[2] = matched(2, clause('CT-A1#2.1', 23.5)); // invoiced 24.90: 6.4 × 1.40 = 8.96 + 10 % = 9.86 (8.96 + 0.896 → 0.90)
    const r = checkContractPrices(validEsInvoice(), m);
    expect(r.lines[2]).toMatchObject({ kind: 'ABOVE_CONTRACT', agreedUnitPrice: 23.5, amountAtStake: 9.86, clauseId: 'CT-A1#2.1' });
    expect(r.amountAtStake).toBe(9.86);
  });

  it('never claims a price below the contract (supplier undercharged)', () => {
    const m = atContract();
    m[0] = matched(0, clause('CT#3.1', 1.95));
    expect(checkContractPrices(validEsInvoice(), m).lines[0]).toMatchObject({ kind: 'BELOW_CONTRACT', amountAtStake: 0 });
  });

  it('treats ambiguity, other currencies and other units as unverified, never as a claim', () => {
    const m = atContract();
    m[0] = other(0, 'AMBIGUOUS');
    m[1] = matched(1, clause('CT#3.2', 0.5, 'ud', 'GBP'));
    m[2] = matched(2, clause('CT#3.3', 10, 'caja'));
    m[3] = other(3, 'NO_CONTRACT');
    const r = checkContractPrices(validEsInvoice(), m);
    expect(r.lines.map((l) => l.kind)).toEqual(['UNVERIFIED', 'UNVERIFIED', 'UNVERIFIED', 'NO_CONTRACT']);
    expect(r.amountAtStake).toBe(0);
  });

  it('compares units case-insensitively ("KG" = "kg")', () => {
    const doc = validEsInvoice();
    doc.lines[0]!.unit = 'KG';
    const m = atContract();
    m[0] = matched(0, clause('CT#3.1', 1.5, 'kg'));
    expect(checkContractPrices(doc, m).lines[0]!.kind).toBe('ABOVE_CONTRACT');
  });

  it('assumes the contract unit when the invoice prints none, only for prices of the same magnitude', () => {
    const doc = validEsInvoice();
    doc.lines[2]!.unit = null; // ERP templates often print no unit column
    doc.lines[3]!.unit = null;
    const m = atContract();
    m[2] = matched(2, clause('CT#3.3', 23.5, 'KG')); // 24.90 vs 23.50: same magnitude → compared
    m[3] = matched(3, clause('CT#3.4', 1.2, 'ud')); // 27.35 vs 1.20 per unit: probably a box → not compared
    const r = checkContractPrices(doc, m);
    expect(r.lines[2]).toMatchObject({ kind: 'ABOVE_CONTRACT', amountAtStake: 9.86 });
    expect(r.lines[3]!.kind).toBe('UNVERIFIED');
  });

  it('does not double count what the delivery note already claims', () => {
    const doc = validEsInvoice();
    const m = atContract();
    m[2] = matched(2, clause('CT#3.3', 23.5));
    const rec = (kind: 'QUANTITY_DIFF' | 'MISSING_IN_DELIVERY_NOTE' | 'PRICE_DIFF', delivered: number, dnPrice: number | null, stake: number): ReconciliationResult => ({
      status: 'DISCREPANCIA',
      invoiceNumber: doc.documentNumber,
      deliveryNoteNumbers: ['ALB-4512'],
      amountAtStake: stake,
      lines: [{ kind, sku: null, invoiceLineIndex: 2, deliveryNoteLineIndex: 0, invoiceQuantity: 6.4, deliveredQuantity: delivered, invoiceUnitPrice: 24.9, deliveryNoteUnitPrice: dnPrice, amountAtStake: stake }],
    });
    // 4 of 6.4 delivered: the short 2.4 is claimed by the reconciliation at 24.90; the contract only adds 4 × 1.40 + VAT.
    expect(checkContractPrices(doc, m, rec('QUANTITY_DIFF', 4, null, 65.74)).lines[2]).toMatchObject({ quantity: 4, amountAtStake: 6.16 });
    expect(checkContractPrices(doc, m, rec('MISSING_IN_DELIVERY_NOTE', 0, null, 175.3)).lines[2]!.amountAtStake).toBe(0);
    // The valued note already says 24.00: the contract adds only 24.00 → 23.50 on the full quantity.
    expect(checkContractPrices(doc, m, rec('PRICE_DIFF', 6.4, 24, 6.34)).lines[2]).toMatchObject({ amountAtStake: 3.52 });
  });
});

describe('applyContractCheck', () => {
  const overpriced = () => {
    const m = atContract();
    m[2] = matched(2, clause('CT-A1#2.1', 23.5));
    return checkContractPrices(validEsInvoice(), m);
  };

  it('turns a trusted VALID invoice billed above contract into a supplier discrepancy', () => {
    const d = applyContractCheck({ status: 'VALID', reason: 'All checks passed on the first read' }, overpriced());
    expect(d.status).toBe('SUPPLIER_DISCREPANCY');
    expect(d.reason).toContain('billed above the agreed contract price (9.86 incl. VAT; CT-A1#2.1)');
  });

  it('keeps the document reason when the invoice already had a discrepancy', () => {
    const d = applyContractCheck({ status: 'SUPPLIER_DISCREPANCY', reason: 'reads #1 and #2 agree on TOTAL_MISMATCH' }, overpriced());
    expect(d.reason).toMatch(/^reads #1 and #2 agree on TOTAL_MISMATCH; billed above/);
  });

  it('never touches an uncertain or invalid document', () => {
    for (const status of ['EXTRACTION_UNCERTAIN', 'INVALID_TAX_ID'] as const) {
      expect(applyContractCheck({ status, reason: 'r' }, overpriced())).toEqual({ status, reason: 'r' });
    }
  });

  it('names unverified lines for a person and claims nothing for them', () => {
    const m = atContract();
    m[1] = other(1, 'AMBIGUOUS');
    const d = applyContractCheck({ status: 'VALID', reason: 'ok' }, checkContractPrices(validEsInvoice(), m));
    expect(d).toEqual({ status: 'VALID', reason: 'ok; contract price not verified for line(s) 2: needs human review' });
  });

  it('a failed service is recorded, not claimed', () => {
    expect(applyContractCheck({ status: 'VALID', reason: 'ok' }, null, 'timeout')).toEqual({ status: 'VALID', reason: 'ok; contract prices not checked (timeout)' });
  });
});

describe('claim with contract issues', () => {
  it('adds the contract amount to the claim and cites the clause', () => {
    const doc = validEsInvoice();
    const m = atContract();
    m[2] = matched(2, clause('CT-ES-01-A1#2.1', 23.5));
    const contract = checkContractPrices(doc, m);
    expect(computeClaimAmount(doc, null, undefined, contract)).toEqual({ invoiceOverbilled: 0, deliveryOverbilled: 0, contractOverbilled: 9.86, total: 9.86 });
    const facts = buildClaimFacts(doc, validateDocument(doc, esPack), null, esPack, contract);
    expect(facts.amountClaimed).toBe('9,86 EUR');
    expect(facts.contractIssues).toEqual(['"Ternera lomo bajo": invoiced at 24,90 EUR, agreed price 23,50 EUR (contract CT-ES-01-A1, clause 2.1) (9,86 EUR incl. VAT)']);
  });

  it('leaves the facts of claims without contract issues unchanged (same cache key)', () => {
    const doc = validEsInvoice();
    const facts = buildClaimFacts(doc, validateDocument(doc, esPack), null, esPack, checkContractPrices(doc, atContract()));
    expect('contractIssues' in facts).toBe(false);
    expect(JSON.stringify(facts)).toBe(JSON.stringify(buildClaimFacts(doc, validateDocument(doc, esPack), null, esPack)));
  });
});
