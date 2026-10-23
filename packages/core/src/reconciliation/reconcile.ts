import { lineAffinity } from '../catalog/catalogMatcher';
import { fromCents, lineCents, pctCents } from '../money';
import type { ExtractedDocument, ExtractedLine } from '../schemas/extracted';
import type { ReconciliationLine, ReconciliationResult } from '../schemas/reconciliation';

/**
 * Pure invoice ↔ delivery-note matching. Lines are paired through the catalog
 * matcher; quantities and (when the note is valued) prices are compared.
 * amountAtStake is what the restaurant was billed for and did not receive,
 * VAT included, in currency units (positive = overbilled).
 */

const QTY_TOL = 0.0005;
const PRICE_TOL = 0.005;
const MIN_AFFINITY = 0.5;

const grossCents = (qty: number, line: ExtractedLine) => {
  const net = lineCents(qty, line.unitPrice ?? 0, line.discountPct);
  return net + pctCents(net, line.taxRate ?? 0);
};

export interface DeliveryNoteInput {
  number: string;
  document: ExtractedDocument;
}

export function reconcile(invoice: ExtractedDocument, notes: DeliveryNoteInput[], missingNumbers: string[] = []): ReconciliationResult {
  const delivered = notes.flatMap((n, noteIdx) => n.document.lines.map((line, i) => ({ line, noteIdx, flatIdx: 0, lineIdx: i })));
  delivered.forEach((d, i) => (d.flatIdx = i));

  // Greedy best-first pairing on catalog affinity.
  const candidates: { inv: number; del: number; score: number; sku: string | null }[] = [];
  invoice.lines.forEach((l, i) =>
    delivered.forEach((d) => {
      const a = lineAffinity(l.description, d.line.description);
      if (a.score >= MIN_AFFINITY) candidates.push({ inv: i, del: d.flatIdx, score: a.score, sku: a.sku });
    }),
  );
  candidates.sort((a, b) => b.score - a.score);
  const usedInv = new Set<number>();
  const usedDel = new Set<number>();
  const lines: ReconciliationLine[] = [];

  for (const c of candidates) {
    if (usedInv.has(c.inv) || usedDel.has(c.del)) continue;
    usedInv.add(c.inv);
    usedDel.add(c.del);
    const inv = invoice.lines[c.inv]!;
    const del = delivered[c.del]!.line;
    const qtyDiff = inv.quantity - del.quantity;
    const priceDiff = del.unitPrice !== null && inv.unitPrice !== null ? inv.unitPrice - del.unitPrice : 0;
    let kind: ReconciliationLine['kind'] = 'MATCH';
    let stake = 0;
    if (Math.abs(qtyDiff) > QTY_TOL) {
      kind = 'QUANTITY_DIFF';
      stake = grossCents(qtyDiff, inv);
    } else if (Math.abs(priceDiff) > PRICE_TOL) {
      kind = 'PRICE_DIFF';
      stake = grossCents(inv.quantity, { ...inv, unitPrice: priceDiff });
    }
    lines.push({
      kind,
      sku: c.sku,
      invoiceLineIndex: c.inv,
      deliveryNoteLineIndex: c.del,
      invoiceQuantity: inv.quantity,
      deliveredQuantity: del.quantity,
      invoiceUnitPrice: inv.unitPrice,
      deliveryNoteUnitPrice: del.unitPrice,
      amountAtStake: fromCents(stake),
    });
  }

  invoice.lines.forEach((inv, i) => {
    if (usedInv.has(i)) return;
    lines.push({
      kind: 'MISSING_IN_DELIVERY_NOTE',
      sku: null,
      invoiceLineIndex: i,
      deliveryNoteLineIndex: null,
      invoiceQuantity: inv.quantity,
      deliveredQuantity: 0,
      invoiceUnitPrice: inv.unitPrice,
      deliveryNoteUnitPrice: null,
      // With a delivery note still missing, the line may well be on it: nothing can be claimed yet.
      amountAtStake: missingNumbers.length ? 0 : fromCents(grossCents(inv.quantity, inv)),
    });
  });
  delivered.forEach((d) => {
    if (usedDel.has(d.flatIdx)) return;
    lines.push({
      kind: 'MISSING_IN_INVOICE',
      sku: null,
      invoiceLineIndex: null,
      deliveryNoteLineIndex: d.flatIdx,
      invoiceQuantity: 0,
      deliveredQuantity: d.line.quantity,
      invoiceUnitPrice: null,
      deliveryNoteUnitPrice: d.line.unitPrice,
      amountAtStake: 0, // delivered but not billed: the supplier's loss, nothing to claim
    });
  });

  lines.sort((a, b) => (a.invoiceLineIndex ?? 999) - (b.invoiceLineIndex ?? 999));
  const amountAtStake = fromCents(lines.reduce((s, l) => s + Math.round(l.amountAtStake * 100), 0));
  const status = missingNumbers.length ? 'FALTAN_DOCUMENTOS' : lines.some((l) => l.kind !== 'MATCH') ? 'DISCREPANCIA' : 'SIN_DISCREPANCIA';

  return {
    status,
    invoiceNumber: invoice.documentNumber,
    deliveryNoteNumbers: [...notes.map((n) => n.number), ...missingNumbers],
    lines,
    amountAtStake,
  };
}

/** Fingerprint of the disagreement, to check that a re-read of the delivery note confirms it. */
export const reconciliationSignature = (r: ReconciliationResult) =>
  r.lines
    .filter((l) => l.kind !== 'MATCH')
    .map((l) => `${l.kind}|${l.invoiceLineIndex}|${l.deliveredQuantity}|${l.deliveryNoteUnitPrice}`)
    .sort()
    .join('\n');
