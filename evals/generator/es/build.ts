import {
  computeClaimAmount,
  esPack,
  fromCents,
  lineCents,
  pctCents,
  reconcile,
  sumCents,
  toCents,
  validateDocument,
  validateSpanishTaxId,
  type ExtractedDocument,
  type ExtractedLine,
  type IssueCode,
  type ReconciliationStatus,
} from '@sentinel/core';
import { Rng } from '../rng';
import type { PlantedError, PlantedErrorType, RenderVariant } from '../types';
import { ES_RECIPIENTS, ES_SUPPLIERS, type Supplier } from './suppliers';

export interface BuiltDoc {
  id: string;
  supplier: Supplier;
  groundTruth: ExtractedDocument;
  planted: PlantedError | null;
  expectedCodes: IssueCode[];
  variant: RenderVariant;
  /** Number of the invoice a credit note rectifies (printed only). */
  rectifies: string | null;
}

type InvoicePlant = Exclude<PlantedErrorType, 'DELIVERY_SHORT' | 'DELIVERY_MISSING_PRODUCT' | 'CHARGE_AMOUNT'>;

const PLANTED_CODE: Record<InvoicePlant, IssueCode> = {
  TOTAL_OFFSET: 'TOTAL_MISMATCH',
  RATE_NOT_ALLOWED: 'RATE_NOT_ALLOWED',
  LINE_MATH: 'LINE_MATH',
  TAX_ID_CHECKSUM: 'INVALID_TAX_ID',
};

export const STAMPS = ['PAGADO', 'RECIBIDO', 'CONTABILIZADO'];
export const NOTES = ['Revisado - Juan', 'Falta 1 caja', 'Pagar día 15', 'OK cocina', 'Llamar a Marta'];

/** Recomputes the printed tax summary and total from the printed line amounts (per-bracket rounding). */
export function printSummary(doc: ExtractedDocument): void {
  const byRate = new Map<number, number>();
  for (const l of doc.lines) byRate.set(l.taxRate!, (byRate.get(l.taxRate!) ?? 0) + toCents(l.lineAmount!));
  doc.printedTaxBreakdown = [...byRate.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rate, base]) => ({ rate, base: fromCents(base), tax: fromCents(pctCents(base, rate)) }));
  doc.printedTotal = fromCents(sumCents(doc.printedTaxBreakdown.flatMap((b) => [toCents(b.base), toCents(b.tax)])));
}

function corruptTaxId(id: string): string {
  const last = id.at(-1)!;
  const replacement = /\d/.test(last) ? String((Number(last) + 3) % 10) : last === 'A' ? 'B' : 'A';
  const bad = id.slice(0, -1) + replacement;
  if (validateSpanishTaxId(bad).valid) throw new Error(`Corrupted tax id ${bad} is still valid`);
  return bad;
}

function plant(rng: Rng, doc: ExtractedDocument, type: InvoicePlant): PlantedError {
  switch (type) {
    case 'TOTAL_OFFSET': {
      const offset = rng.pick([1.5, -2, 0.9, 3.1]);
      doc.printedTotal = fromCents(toCents(doc.printedTotal!) + toCents(offset));
      return { type, description: `Printed total shifted by ${offset.toFixed(2)}` };
    }
    case 'RATE_NOT_ALLOWED': {
      const i = rng.int(0, doc.lines.length - 1);
      const line = doc.lines[i]!;
      const old = line.taxRate!;
      line.taxRate = old === 21 ? 18 : 8; // pre-2012 Spanish rates, a classic stale-ERP bug
      printSummary(doc);
      return { type, description: `Line ${i + 1} billed at ${line.taxRate} % instead of ${old} %` };
    }
    case 'LINE_MATH': {
      const i = rng.int(0, doc.lines.length - 1);
      const line = doc.lines[i]!;
      const delta = rng.pick([1, 2.5, -0.8, 1.2]);
      line.lineAmount = fromCents(toCents(line.lineAmount!) + toCents(delta));
      printSummary(doc); // ERP bug: the wrong line amount flows into the bases and the total
      return { type, description: `Line ${i + 1} amount off by ${delta.toFixed(2)} vs quantity × price` };
    }
    case 'TAX_ID_CHECKSUM': {
      const good = doc.issuer.taxId!;
      doc.issuer.taxId = corruptTaxId(good);
      return { type, description: `Issuer tax id ${doc.issuer.taxId} has a wrong control character (valid: ${good})` };
    }
  }
}

export function pickVariant(rng: Rng, supplier: Supplier): RenderVariant {
  const r = rng.next();
  // Tickets are thermal paper: always photographed or scanned.
  const mode = supplier.template === 'ticket' ? (r < 0.6 ? 'photo' : 'scan') : r < 0.4 ? 'pdf' : r < 0.7 ? 'scan' : 'photo';
  return {
    mode,
    rotation: mode === 'photo' ? rng.float(1.5, 4, 1) * (rng.chance(0.5) ? 1 : -1) : mode === 'scan' ? rng.float(0.3, 1.2, 1) * (rng.chance(0.5) ? 1 : -1) : 0,
    noise: mode !== 'pdf',
    lowRes: mode === 'photo' && rng.chance(0.5),
    stamp: rng.chance(0.3) ? rng.pick(STAMPS) : null,
    handwrittenNote: rng.chance(0.25) ? rng.pick(NOTES) : null,
  };
}

export const isoDate = (rng: Rng) => {
  const d = new Date(Date.UTC(2026, 8, 1) + rng.int(0, 44) * 86_400_000);
  return d.toISOString().slice(0, 10);
};

/** Random priced lines from a supplier's catalog (RNG call order is part of the dataset's reproducibility). */
export function makeLines(rng: Rng, supplier: Supplier, sign: 1 | -1): ExtractedLine[] {
  const items = rng.sample(supplier.catalog, rng.int(...supplier.lines));
  return items.map((it) => {
    const qty = sign * rng.float(it.qty[0], it.qty[1], it.qtyDecimals);
    const discountPct = supplier.discounts && rng.chance(0.2) ? rng.pick([5, 10]) : null;
    return {
      description: it.description,
      quantity: qty,
      unit: it.unit,
      unitPrice: it.price,
      discountPct,
      taxRate: it.rate,
      lineAmount: fromCents(lineCents(qty, it.price, discountPct)),
    };
  });
}

export function buildEsDocuments(seed: number, count: number): BuiltDoc[] {
  const rng = new Rng(seed);
  const planTypes: InvoicePlant[] = ['TOTAL_OFFSET', 'TOTAL_OFFSET', 'RATE_NOT_ALLOWED', 'RATE_NOT_ALLOWED', 'LINE_MATH', 'LINE_MATH', 'TAX_ID_CHECKSUM', 'TAX_ID_CHECKSUM'];
  const supplierAt = (n: number) => ES_SUPPLIERS[n % ES_SUPPLIERS.length]!;
  const indices = rng.sample([...Array(count).keys()], planTypes.length);
  const plantedAt = new Map(indices.map((idx, k) => [idx, planTypes[k]!]));
  // Credit notes only exist in the "clasica" template; two of them, never with a planted error.
  const creditCandidates = [...Array(count).keys()].filter((n) => supplierAt(n).template === 'clasica' && !plantedAt.has(n));
  const creditAt = new Set(rng.sample(creditCandidates, 2));

  const docs: BuiltDoc[] = [];
  for (let n = 0; n < count; n++) {
    const supplier = supplierAt(n);
    const recipient = rng.pick(ES_RECIPIENTS);
    const isCredit = creditAt.has(n);
    const sign = isCredit ? -1 : 1;

    const lines = makeLines(rng, supplier, sign);

    const groundTruth: ExtractedDocument = {
      docType: isCredit ? 'CREDIT_NOTE' : 'INVOICE',
      country: 'ES',
      documentNumber: isCredit ? `R-${supplier.numbering(n)}` : supplier.numbering(n),
      issueDate: isoDate(rng),
      currency: 'EUR',
      issuer: { name: supplier.name, taxId: supplier.taxId, address: supplier.address },
      recipient: { name: recipient.name, taxId: recipient.taxId, address: recipient.address },
      lines,
      printedTaxBreakdown: [],
      printedTotal: null,
      deliveryNoteRefs: [],
    };
    printSummary(groundTruth);

    const plantType = plantedAt.get(n);
    const planted = plantType ? plant(rng, groundTruth, plantType) : null;
    const expectedCodes: IssueCode[] = plantType ? [PLANTED_CODE[plantType]] : [];

    // Self-check: a perfect extraction must produce exactly the expected verdict.
    const report = validateDocument(groundTruth, esPack);
    const errors = report.issues.filter((i) => i.severity === 'error').map((i) => i.code);
    if (!planted && errors.length) throw new Error(`Clean doc ${n} fails validation: ${errors.join(', ')}`);
    if (planted && !errors.includes(expectedCodes[0]!)) throw new Error(`Planted ${planted.type} on doc ${n} not detected: ${errors.join(', ')}`);

    docs.push({
      id: `es-${String(n + 1).padStart(3, '0')}`,
      supplier,
      groundTruth,
      planted,
      expectedCodes,
      variant: pickVariant(rng, supplier),
      rectifies: isCredit ? supplier.numbering(n + 100) : null,
    });
  }
  return docs;
}

// ---------------------------------------------------------------------------
// Delivery-note scenarios (es-031+). Separate RNG stream so es-001..es-030 never change.
// ---------------------------------------------------------------------------

export interface DeliveryScenario {
  invoice: BuiltDoc;
  deliveryNote: BuiltDoc | null;
  expectedReconciliation: ReconciliationStatus;
  claimAmount: number;
}

type ScenarioKind = 'MATCH' | 'DELIVERY_SHORT' | 'DELIVERY_MISSING_PRODUCT' | 'NOT_RECEIVED';

export function buildEsDeliveryScenarios(seed: number, startIndex: number): DeliveryScenario[] {
  const rng = new Rng(seed);
  // Tickets (bakery) come without delivery notes.
  const suppliers = ES_SUPPLIERS.filter((s) => s.template !== 'ticket');
  const kinds: ScenarioKind[] = ['MATCH', 'MATCH', 'MATCH', 'MATCH', 'DELIVERY_SHORT', 'DELIVERY_SHORT', 'DELIVERY_MISSING_PRODUCT', 'NOT_RECEIVED'];
  const scenarios: DeliveryScenario[] = [];
  let n = startIndex;

  for (const [k, kind] of kinds.entries()) {
    const supplier = suppliers[k % suppliers.length]!;
    const recipient = rng.pick(ES_RECIPIENTS);
    let lines = makeLines(rng, supplier, 1);
    if (lines.length < 3) lines = [...lines, ...makeLines(rng, supplier, 1)].filter((l, i, all) => all.findIndex((x) => x.description === l.description) === i);
    const noteNumber = `ALB-26${String(3100 + n * 7).padStart(5, '0')}`;
    const invoiceDate = isoDate(rng);
    const noteDate = new Date(Date.parse(invoiceDate) - rng.int(0, 3) * 86_400_000).toISOString().slice(0, 10);

    const invoiceGt: ExtractedDocument = {
      docType: 'INVOICE',
      country: 'ES',
      documentNumber: supplier.numbering(n),
      issueDate: invoiceDate,
      currency: 'EUR',
      issuer: { name: supplier.name, taxId: supplier.taxId, address: supplier.address },
      recipient: { name: recipient.name, taxId: recipient.taxId, address: recipient.address },
      lines,
      printedTaxBreakdown: [],
      printedTotal: null,
      deliveryNoteRefs: [noteNumber],
    };
    printSummary(invoiceGt);

    // What the warehouse signed for: same products, quantities as delivered, no prices.
    const deliveredLines: ExtractedLine[] = lines.map((l) => ({ ...l, unitPrice: null, discountPct: null, taxRate: null, lineAmount: null }));
    let planted: PlantedError | null = null;
    if (kind === 'DELIVERY_SHORT') {
      const i = rng.int(0, deliveredLines.length - 1);
      const line = deliveredLines[i]!;
      const delivered = line.quantity > 2 ? Math.max(1, Math.round(line.quantity * rng.float(0.5, 0.85, 2))) : line.quantity - 0.5;
      planted = { type: 'DELIVERY_SHORT', description: `Line ${i + 1} "${line.description}": invoiced ${line.quantity}, delivered ${delivered}` };
      line.quantity = delivered;
    } else if (kind === 'DELIVERY_MISSING_PRODUCT') {
      const i = rng.int(0, deliveredLines.length - 1);
      planted = { type: 'DELIVERY_MISSING_PRODUCT', description: `"${deliveredLines[i]!.description}" invoiced but not on the delivery note` };
      deliveredLines.splice(i, 1);
    }

    const noteGt: ExtractedDocument = {
      ...invoiceGt,
      docType: 'DELIVERY_NOTE',
      documentNumber: noteNumber,
      issueDate: noteDate,
      lines: deliveredLines,
      printedTaxBreakdown: [],
      printedTotal: null,
      deliveryNoteRefs: [],
    };

    // Self-checks on perfect extractions.
    for (const d of [invoiceGt, noteGt]) {
      const errors = validateDocument(d, esPack).issues.filter((i) => i.severity === 'error');
      if (errors.length) throw new Error(`Scenario ${n} ${d.docType} fails validation: ${errors.map((e) => e.code).join(', ')}`);
    }
    const rec = reconcile(invoiceGt, kind === 'NOT_RECEIVED' ? [] : [{ number: noteNumber, document: noteGt }], kind === 'NOT_RECEIVED' ? [noteNumber] : []);
    const expectedReconciliation: ReconciliationStatus = kind === 'MATCH' ? 'SIN_DISCREPANCIA' : kind === 'NOT_RECEIVED' ? 'FALTAN_DOCUMENTOS' : 'DISCREPANCIA';
    if (rec.status !== expectedReconciliation) throw new Error(`Scenario ${n}: expected ${expectedReconciliation}, got ${rec.status}`);

    const invoice: BuiltDoc = {
      id: `es-${String(n).padStart(3, '0')}`,
      supplier,
      groundTruth: invoiceGt,
      planted,
      expectedCodes: [],
      variant: pickVariant(rng, supplier),
      rectifies: null,
    };
    n++;
    const deliveryNote: BuiltDoc | null =
      kind === 'NOT_RECEIVED'
        ? null
        : { id: `es-${String(n++).padStart(3, '0')}`, supplier, groundTruth: noteGt, planted: null, expectedCodes: [], variant: pickVariant(rng, supplier), rectifies: null };

    scenarios.push({ invoice, deliveryNote, expectedReconciliation, claimAmount: computeClaimAmount(invoiceGt, rec).total });
  }
  return scenarios;
}
