import { computeClaimAmount, fromCents, reconcile, sumCents, taxRegimeFor, toCents, validateDocument, type ExtractedDocument, type IssueCode, type ReconciliationStatus } from '@sentinel/core';
import { isoDate, makeLines, NOTES, pickVariant as pickEsVariant, printSummary, STAMPS, type BuiltDoc } from './es/build';
import type { Supplier } from './es/suppliers';
import type { CountryGenConfig } from './locales';
import type { TemplateLabels } from './templates';
import { Rng } from './rng';
import type { PlantedError } from './types';

/**
 * Country-agnostic dataset builder (FR, IT and any later country). ES keeps its
 * original builder so its documents, and therefore its baseline, never move.
 */

type InvoicePlant = 'TOTAL_OFFSET' | 'RATE_NOT_ALLOWED' | 'LINE_MATH' | 'TAX_ID_CHECKSUM';
const PLANTED_CODE: Record<InvoicePlant, IssueCode> = {
  TOTAL_OFFSET: 'TOTAL_MISMATCH',
  RATE_NOT_ALLOWED: 'RATE_NOT_ALLOWED',
  LINE_MATH: 'LINE_MATH',
  TAX_ID_CHECKSUM: 'INVALID_TAX_ID',
};
const PLAN: InvoicePlant[] = ['TOTAL_OFFSET', 'TOTAL_OFFSET', 'RATE_NOT_ALLOWED', 'LINE_MATH', 'LINE_MATH', 'TAX_ID_CHECKSUM'];

export interface CountryBuild {
  docs: (BuiltDoc & {
    expectedReconciliation?: ReconciliationStatus;
    claimAmount?: number;
    deliveryNoteFor?: string;
    refDate: string;
    /** Region documents print the regional tax name. */
    labels?: Partial<TemplateLabels>;
  })[];
}

/** Same distribution as ES, with the overlay texts in the country's language. */
function localVariant(rng: Rng, cfg: CountryGenConfig, supplier: Supplier) {
  const v = pickEsVariant(rng, supplier);
  return {
    ...v,
    stamp: v.stamp ? cfg.stamps[STAMPS.indexOf(v.stamp)]! : null,
    handwrittenNote: v.handwrittenNote ? cfg.notes[NOTES.indexOf(v.handwrittenNote)]! : null,
  };
}

function plant(rng: Rng, cfg: CountryGenConfig, doc: ExtractedDocument, type: InvoicePlant): PlantedError {
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
      line.taxRate = cfg.staleRate[old] ?? old;
      printSummary(doc);
      return { type, description: `Line ${i + 1} billed at stale rate ${line.taxRate} % instead of ${old} %` };
    }
    case 'LINE_MATH': {
      const i = rng.int(0, doc.lines.length - 1);
      const delta = rng.pick([1, 2.5, -0.8, 1.2]);
      doc.lines[i]!.lineAmount = fromCents(toCents(doc.lines[i]!.lineAmount!) + toCents(delta));
      printSummary(doc);
      return { type, description: `Line ${i + 1} amount off by ${delta.toFixed(2)} vs quantity × price` };
    }
    case 'TAX_ID_CHECKSUM': {
      const good = doc.issuer.taxId!;
      doc.issuer.taxId = cfg.corruptTaxId(good);
      return { type, description: `Issuer tax id ${doc.issuer.taxId} has a wrong control (valid: ${good})` };
    }
  }
}

function invoiceOf(cfg: CountryGenConfig, rng: Rng, supplierIdx: number, n: number, sign: 1 | -1): ExtractedDocument {
  const supplier = cfg.suppliers[supplierIdx]!;
  const recipient = rng.pick(cfg.recipients);
  const doc: ExtractedDocument = {
    docType: sign < 0 ? 'CREDIT_NOTE' : 'INVOICE',
    country: cfg.code,
    documentNumber: supplier.numbering(n),
    issueDate: isoDate(rng),
    currency: cfg.pack.currency,
    issuer: { name: supplier.name, taxId: supplier.taxId, address: supplier.address },
    recipient: { name: recipient.name, taxId: recipient.taxId, address: recipient.address },
    lines: makeLines(rng, supplier, sign),
    printedTaxBreakdown: [],
    printedTotal: null,
    deliveryNoteRefs: [],
  };
  printSummary(doc);
  return doc;
}

const selfCheck = (cfg: CountryGenConfig, doc: ExtractedDocument, expected: IssueCode | null, label: string) => {
  const errors = validateDocument(doc, cfg.pack).issues.filter((i) => i.severity === 'error').map((i) => i.code);
  if (!expected && errors.length) throw new Error(`${label}: clean document fails validation (${errors.join(', ')})`);
  if (expected && !errors.includes(expected)) throw new Error(`${label}: planted ${expected} not detected (${errors.join(', ') || 'pass'})`);
};

/**
 * `baseCount` standalone documents (6 planted errors, 1 credit note) followed by
 * delivery scenarios: 2 matching, 1 short delivery, 1 missing product.
 */
export function buildCountryDataset(cfg: CountryGenConfig, seed: number, baseCount: number): CountryBuild {
  const rng = new Rng(seed);
  const prefix = cfg.code.toLowerCase();
  const id = (n: number) => `${prefix}-${String(n).padStart(3, '0')}`;
  const plantedAt = new Map(rng.sample([...Array(baseCount).keys()], PLAN.length).map((idx, k) => [idx, PLAN[k]!]));
  const creditAt = rng.sample([...Array(baseCount).keys()].filter((i) => !plantedAt.has(i)), 1)[0];
  const docs: CountryBuild['docs'] = [];

  for (let n = 0; n < baseCount; n++) {
    const supplierIdx = n % cfg.suppliers.length;
    const gt = invoiceOf(cfg, rng, supplierIdx, n, n === creditAt ? -1 : 1);
    const plantType = plantedAt.get(n);
    const planted = plantType ? plant(rng, cfg, gt, plantType) : null;
    selfCheck(cfg, gt, plantType ? PLANTED_CODE[plantType] : null, id(n + 1));
    docs.push({
      id: id(n + 1),
      supplier: cfg.suppliers[supplierIdx]!,
      groundTruth: gt,
      planted,
      expectedCodes: plantType ? [PLANTED_CODE[plantType]] : [],
      variant: localVariant(rng, cfg, cfg.suppliers[supplierIdx]!),
      rectifies: null,
      refDate: gt.issueDate,
    });
  }

  const kinds = ['MATCH', 'MATCH', 'DELIVERY_SHORT', 'DELIVERY_MISSING_PRODUCT'] as const;
  let n = baseCount + 1;
  for (const [k, kind] of kinds.entries()) {
    const supplierIdx = k % cfg.suppliers.length;
    const supplier = cfg.suppliers[supplierIdx]!;
    const inv = invoiceOf(cfg, rng, supplierIdx, n, 1);
    const noteNumber = cfg.deliveryNoteNumber(n);
    inv.deliveryNoteRefs = [noteNumber];
    const noteDate = new Date(Date.parse(inv.issueDate) - rng.int(0, 3) * 86_400_000).toISOString().slice(0, 10);
    const delivered = inv.lines.map((l) => ({ ...l, unitPrice: null, discountPct: null, taxRate: null, lineAmount: null }));
    let planted: PlantedError | null = null;
    if (kind === 'DELIVERY_SHORT') {
      const i = rng.int(0, delivered.length - 1);
      const line = delivered[i]!;
      const got = line.quantity > 2 ? Math.max(1, Math.round(line.quantity * rng.float(0.5, 0.85, 2))) : line.quantity - 0.5;
      planted = { type: 'DELIVERY_SHORT', description: `"${line.description}": invoiced ${line.quantity}, delivered ${got}` };
      line.quantity = got;
    } else if (kind === 'DELIVERY_MISSING_PRODUCT') {
      const i = rng.int(0, delivered.length - 1);
      planted = { type: 'DELIVERY_MISSING_PRODUCT', description: `"${delivered[i]!.description}" invoiced but not delivered` };
      delivered.splice(i, 1);
    }
    const note: ExtractedDocument = { ...inv, docType: 'DELIVERY_NOTE', documentNumber: noteNumber, issueDate: noteDate, lines: delivered, printedTaxBreakdown: [], printedTotal: null, deliveryNoteRefs: [] };
    selfCheck(cfg, inv, null, `${id(n)} invoice`);
    selfCheck(cfg, note, null, `${id(n + 1)} delivery note`);
    const rec = reconcile(inv, [{ number: noteNumber, document: note }]);
    const expectedReconciliation: ReconciliationStatus = kind === 'MATCH' ? 'SIN_DISCREPANCIA' : 'DISCREPANCIA';
    if (rec.status !== expectedReconciliation) throw new Error(`${id(n)}: expected ${expectedReconciliation}, got ${rec.status}`);

    const invoiceId = id(n++);
    docs.push({
      id: invoiceId,
      supplier,
      groundTruth: inv,
      planted,
      expectedCodes: [],
      variant: localVariant(rng, cfg, supplier),
      rectifies: null,
      refDate: noteDate,
      expectedReconciliation,
      claimAmount: computeClaimAmount(inv, rec).total,
    });
    docs.push({ id: id(n++), supplier, groundTruth: note, planted: null, expectedCodes: [], variant: localVariant(rng, cfg, supplier), rectifies: null, refDate: noteDate, deliveryNoteFor: invoiceId });
  }
  docs.push(...buildRegionalDocs(cfg, seed + 500, n).docs);
  docs.push(...buildChargeDocs(cfg, seed + 700, docs.length + 1).docs);
  if (cfg.controlCode) {
    for (const d of docs) if (d.groundTruth.docType !== 'DELIVERY_NOTE') d.groundTruth.documentControlCode = cfg.controlCode(d.groundTruth);
  }
  return { docs };
}

/**
 * Invoices delivered to restaurants in the pack's tax regions, numbered from `firstN`
 * with their own RNG stream. Clean ones must pass under the regional rates (an unfair
 * claim if the regime is ignored); the second of each region keeps one mainland rate.
 */
export function buildRegionalDocs(cfg: CountryGenConfig, seed: number, firstN: number): CountryBuild {
  const rng = new Rng(seed);
  const prefix = cfg.code.toLowerCase();
  const docs: CountryBuild['docs'] = [];
  let n = firstN;
  for (const region of cfg.regions ?? []) {
    for (let k = 0; k < region.count; k++) {
      const id = `${prefix}-${String(n).padStart(3, '0')}`;
      const supplier = region.suppliers[k % region.suppliers.length]!;
      const recipient = region.recipients[k % region.recipients.length]!;
      const lines = makeLines(rng, supplier, 1).map((l) => ({ ...l, taxRate: region.rateMap[l.taxRate!] ?? l.taxRate }));
      const doc: ExtractedDocument = {
        docType: 'INVOICE',
        country: cfg.code,
        documentNumber: supplier.numbering(n),
        issueDate: isoDate(rng),
        currency: cfg.pack.currency,
        issuer: { name: supplier.name, taxId: supplier.taxId, address: supplier.address },
        recipient: { ...recipient },
        lines,
        printedTaxBreakdown: [],
        printedTotal: null,
        deliveryNoteRefs: [],
      };
      const regime = taxRegimeFor(doc, cfg.pack);
      // Some templates do not print the client address: the supplier's must lead to the same region.
      const bySupplier = taxRegimeFor({ ...doc, recipient: { ...doc.recipient, address: null } }, cfg.pack);
      if (regime.region?.id !== region.id || bySupplier.region?.id !== region.id) {
        throw new Error(`${id}: resolves to ${regime.id} (client) / ${bySupplier.id} (supplier), expected region ${region.id}`);
      }

      let planted: PlantedError | null = null;
      if (k === 1) {
        const mainlandOf = (rate: number) => Number(Object.entries(region.rateMap).find(([, r]) => r === rate)![0]);
        const legalHere = (l: (typeof lines)[number]) => regime.allowedTaxRates.includes(mainlandOf(l.taxRate!));
        let i = rng.int(0, lines.length - 1);
        // Some mainland rates are also legal in the region (IPSI 4 %): plant on a line whose mainland rate is not.
        if (legalHere(lines[i]!)) i = lines.findIndex((l) => !legalHere(l));
        if (i < 0) throw new Error(`${id}: no line can carry a mainland rate that is wrong in ${region.id}`);
        const mainland = mainlandOf(lines[i]!.taxRate!);
        planted = { type: 'RATE_NOT_ALLOWED', description: `Line ${i + 1} billed at the mainland rate ${mainland} % instead of ${lines[i]!.taxRate} % (${regime.label})` };
        lines[i]!.taxRate = mainland;
      }
      printSummary(doc);
      selfCheck(cfg, doc, planted ? 'RATE_NOT_ALLOWED' : null, id);
      docs.push({
        id,
        supplier,
        groundTruth: doc,
        planted,
        expectedCodes: planted ? ['RATE_NOT_ALLOWED'] : [],
        variant: localVariant(rng, cfg, supplier),
        rectifies: null,
        refDate: doc.issueDate,
        labels: region.labels,
      });
      n++;
    }
  }
  return { docs };
}


/**
 * Invoices with surcharges, withholdings or stamp duty (cfg.charges), numbered from `firstN` with their
 * own RNG stream so every earlier document keeps its bytes. The printed total is the amount due: bases +
 * VAT + surcharges + stamp duty − withholdings. Clean ones must pass (ignoring the rows would be an unfair
 * claim); planted ones shift the total or over-charge a surcharge.
 */
export function buildChargeDocs(cfg: CountryGenConfig, seed: number, firstN: number): CountryBuild {
  const rng = new Rng(seed);
  const prefix = cfg.code.toLowerCase();
  const docs: CountryBuild['docs'] = [];
  (cfg.charges ?? []).forEach((sc, k) => {
    const n = firstN + k;
    const id = `${prefix}-${String(n).padStart(3, '0')}`;
    const doc: ExtractedDocument = {
      docType: 'INVOICE',
      country: cfg.code,
      documentNumber: sc.supplier.numbering(n),
      issueDate: isoDate(rng),
      currency: cfg.pack.currency,
      issuer: { name: sc.supplier.name, taxId: sc.supplier.taxId, address: sc.supplier.address },
      recipient: { ...sc.recipient },
      lines: makeLines(rng, sc.supplier, 1),
      printedTaxBreakdown: [],
      printedTotal: null,
      deliveryNoteRefs: [],
    };
    printSummary(doc);
    const charges = sc.charges(doc);
    let planted: PlantedError | null = null;
    if (sc.plant === 'CHARGE_AMOUNT') {
      const ch = charges.find((c) => c.kind === 'SURCHARGE')!;
      ch.amount = fromCents(toCents(ch.amount) + 100);
      planted = { type: 'CHARGE_AMOUNT', description: `"${ch.label}" printed 1.00 above rate × base` };
    }
    doc.printedCharges = charges;
    doc.printedTotal = fromCents(toCents(doc.printedTotal!) + sumCents(charges.map((c) => (c.kind === 'WITHHOLDING' ? -1 : 1) * toCents(c.amount))));
    if (sc.plant === 'TOTAL_OFFSET') {
      doc.printedTotal = fromCents(toCents(doc.printedTotal) + 150);
      planted = { type: 'TOTAL_OFFSET', description: 'Printed total shifted by 1.50' };
    }
    const expected: IssueCode[] = !planted ? [] : planted.type === 'CHARGE_AMOUNT' ? ['CHARGE_MISMATCH', 'TOTAL_MISMATCH'] : ['TOTAL_MISMATCH'];
    const errors = [...new Set(validateDocument(doc, cfg.pack).issues.filter((i) => i.severity === 'error').map((i) => i.code))].sort();
    if (errors.join() !== [...expected].sort().join()) throw new Error(`${id}: expected [${expected.join(', ')}], validator says [${errors.join(', ')}]`);
    docs.push({
      id,
      supplier: sc.supplier,
      groundTruth: doc,
      planted,
      expectedCodes: expected,
      variant: localVariant(rng, cfg, sc.supplier),
      rectifies: null,
      refDate: doc.issueDate,
      labels: sc.labels,
    });
  });
  return { docs };
}
