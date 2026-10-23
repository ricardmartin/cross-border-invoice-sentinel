import { describe, expect, it } from 'vitest';
import {
  buildClaimFacts,
  claimPassesGuardrails,
  computeClaimAmount,
  esPack,
  lineAffinity,
  matchSku,
  normalizeDocNumber,
  reconcile,
  reconciliationSignature,
  validateDocument,
  type ExtractedDocument,
} from '../src';
import { validEsInvoice } from './fixtures';

/** Unvalued delivery note with the invoice's lines, descriptions written the warehouse way. */
const deliveryNote = (inv: ExtractedDocument, edit: (d: ExtractedDocument) => void = () => {}): ExtractedDocument => {
  const d: ExtractedDocument = {
    ...inv,
    docType: 'DELIVERY_NOTE',
    documentNumber: 'ALB-4512',
    lines: inv.lines.map((l) => ({ ...l, description: `${l.description.toUpperCase()} ${l.unit?.toUpperCase() ?? ''}`, unitPrice: null, taxRate: null, lineAmount: null })),
    printedTaxBreakdown: [],
    printedTotal: null,
  };
  edit(d);
  return d;
};

describe('catalog matcher', () => {
  it('maps differently written descriptions to the same SKU', () => {
    expect(matchSku('Tomate pera')?.sku).toBe('VEG-TOMATO');
    expect(matchSku('TOMATE PERA KG')?.sku).toBe('VEG-TOMATO');
    expect(lineAffinity('Ternera lomo bajo', 'TERNERA LOMO BAJO EXTRA')).toMatchObject({ score: 1, sku: 'MEAT-BEEF-LOIN' });
    expect(lineAffinity('Tomate pera', 'Detergente lavavajillas').score).toBe(0);
  });

  it('falls back to token similarity for unknown products', () => {
    expect(lineAffinity('Trufa negra fresca', 'TRUFA NEGRA FRESCA 100G').score).toBeGreaterThan(0.5);
  });

  it('pairs the same word written with or without umlaut transliteration (de-025: an unfair claim otherwise)', () => {
    expect(lineAffinity('RINDERHUEFTE', 'RINDERHÜFTE').score).toBe(1);
    expect(lineAffinity('RINDERHUEFTE', 'RINDERHUFTE').score).toBe(1);
    expect(lineAffinity('Weißwurst', 'WEISSWURST').score).toBe(1);
    expect(lineAffinity('Smørrebrød pålæg', 'SMORREBROD PALAEG').score).toBe(1);
  });

  it('tolerates one misread letter in a long word, never in a short one', () => {
    expect(lineAffinity('Schweinenacken', 'Schweinenackan').score).toBe(1);
    expect(lineAffinity('Pollo', 'Bollo').score).toBe(0);
    expect(lineAffinity('Trufa negra', 'Trufa blanca').score).toBeLessThan(0.5);
  });

  it('normalizes delivery-note numbers', () => {
    expect(normalizeDocNumber('Albarán nº ALB-4512')).toBe('ALB4512');
    expect(normalizeDocNumber('alb 4512')).toBe('ALB4512');
    expect(normalizeDocNumber('N12')).toBe('N12');
  });
});

describe('reconcile', () => {
  const inv = validEsInvoice();

  it('finds no discrepancy when everything billed was delivered', () => {
    const r = reconcile(inv, [{ number: 'ALB-4512', document: deliveryNote(inv) }]);
    expect(r).toMatchObject({ status: 'SIN_DISCREPANCIA', amountAtStake: 0 });
    expect(r.lines.every((l) => l.kind === 'MATCH')).toBe(true);
  });

  it('prices a short delivery with VAT', () => {
    // Pan de hogaza: billed 20, delivered 18 → 2 × 1,20 = 2,40 + 4 % = 2,50
    const r = reconcile(inv, [{ number: 'ALB-4512', document: deliveryNote(inv, (d) => (d.lines[1]!.quantity = 18)) }]);
    expect(r.status).toBe('DISCREPANCIA');
    expect(r.lines.find((l) => l.kind === 'QUANTITY_DIFF')).toMatchObject({ invoiceLineIndex: 1, invoiceQuantity: 20, deliveredQuantity: 18, amountAtStake: 2.5 });
    expect(r.amountAtStake).toBe(2.5);
  });

  it('claims the full line when a product was never delivered', () => {
    // Detergente: 54,70 + 21 % = 66,19
    const r = reconcile(inv, [{ number: 'ALB-4512', document: deliveryNote(inv, (d) => d.lines.splice(3, 1)) }]);
    expect(r.lines.find((l) => l.kind === 'MISSING_IN_DELIVERY_NOTE')).toMatchObject({ invoiceLineIndex: 3, amountAtStake: 66.19 });
  });

  it('does not claim goods delivered but not billed', () => {
    const r = reconcile(inv, [
      { number: 'ALB-4512', document: deliveryNote(inv, (d) => d.lines.push({ ...d.lines[0]!, description: 'LIMON KG', quantity: 2 })) },
    ]);
    expect(r).toMatchObject({ status: 'DISCREPANCIA', amountAtStake: 0 });
  });

  it('reports missing delivery notes without claiming anything yet', () => {
    expect(reconcile(inv, [], ['ALB-9999'])).toMatchObject({ status: 'FALTAN_DOCUMENTOS', amountAtStake: 0 });
    expect(computeClaimAmount(inv, reconcile(inv, [], ['ALB-9999'])).total).toBe(0);
  });

  it('fingerprints the disagreement so a re-read can confirm it', () => {
    const a = reconcile(inv, [{ number: 'A', document: deliveryNote(inv, (d) => (d.lines[1]!.quantity = 18)) }]);
    const b = reconcile(inv, [{ number: 'A', document: deliveryNote(inv, (d) => (d.lines[1]!.quantity = 18)) }]);
    const c = reconcile(inv, [{ number: 'A', document: deliveryNote(inv, (d) => (d.lines[1]!.quantity = 19)) }]);
    expect(reconciliationSignature(a)).toBe(reconciliationSignature(b));
    expect(reconciliationSignature(a)).not.toBe(reconciliationSignature(c));
  });
});

describe('claim amount and facts', () => {
  it('claims what the printed total exceeds the lines it is built from', () => {
    expect(computeClaimAmount({ ...validEsInvoice(), printedTotal: 292.01 }, null)).toEqual({ invoiceOverbilled: 1.5, deliveryOverbilled: 0, total: 1.5 });
    expect(computeClaimAmount({ ...validEsInvoice(), printedTotal: 289.01 }, null).total).toBe(0); // under-billed: nothing to claim
  });

  it('adds delivery shortfalls', () => {
    const inv = validEsInvoice();
    const r = reconcile(inv, [{ number: 'ALB-4512', document: deliveryNote(inv, (d) => (d.lines[1]!.quantity = 18)) }]);
    expect(computeClaimAmount(inv, r)).toEqual({ invoiceOverbilled: 0, deliveryOverbilled: 2.5, total: 2.5 });
  });

  it('builds facts with local formats and guards the draft', () => {
    const inv = { ...validEsInvoice(), printedTotal: 292.01 };
    const facts = buildClaimFacts(inv, validateDocument(inv, esPack), null, esPack);
    expect(facts).toMatchObject({ language: 'Spanish', invoiceNumber: 'F-2026/04512', invoiceDate: '02/10/2026', amountClaimed: '1,50 EUR' });
    expect(claimPassesGuardrails({ subject: 'Factura F-2026/04512', body: 'Importe: 1,50 EUR' }, facts)).toBe(true);
    expect(claimPassesGuardrails({ subject: 'Factura F-2026/04512', body: 'Importe: 1,60 EUR' }, facts)).toBe(false);
    expect(claimPassesGuardrails({ subject: 'Su factura', body: 'Importe: 1,50 EUR' }, facts)).toBe(false);
  });
});
