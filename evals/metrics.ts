import type { CountryPack, ExtractedDocument, ExtractedLine } from '@sentinel/core';

/**
 * Extraction metrics against ground truth. Numbers match within 0,01;
 * text matches after normalisation (case, accents, punctuation, spacing).
 */

export const NUM_TOL = 0.01;

export const normText = (s: string | null | undefined): string =>
  (s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    // Letters NFD does not decompose; "ß" also upper-cases to "SS" on a printed document.
    .replace(/ß/g, 'ss')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const numEq = (a: number | null, b: number | null) => (a === null || b === null ? a === b : Math.abs(a - b) <= NUM_TOL + 1e-9);

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = a.length;
  const n = b.length;
  if (!m || !n) return 0;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[n]! / Math.max(m, n);
}

export const HEADER_FIELDS = [
  'docType',
  'documentNumber',
  'issueDate',
  'currency',
  'issuer.name',
  'issuer.taxId',
  'recipient.name',
  'recipient.taxId',
  'printedTaxBreakdown',
  'printedCharges',
  'printedTotal',
  'documentControlCode',
] as const;
export const LINE_FIELDS = ['description', 'quantity', 'unitPrice', 'discountPct', 'taxRate', 'lineAmount'] as const;

export interface FieldResult {
  field: string;
  ok: boolean;
  expected: unknown;
  got: unknown;
}

export interface DocComparison {
  exact: boolean;
  header: FieldResult[];
  lines: { tp: number; fp: number; fn: number; fieldHits: Record<(typeof LINE_FIELDS)[number], number>; gtLines: number };
  mismatches: string[];
}

const lineFieldOk = (field: (typeof LINE_FIELDS)[number], gt: ExtractedLine, got: ExtractedLine) =>
  field === 'description' ? normText(gt.description) === normText(got.description) : numEq(gt[field], got[field]);

export function compareDocuments(gt: ExtractedDocument, got: ExtractedDocument, pack: CountryPack): DocComparison {
  const taxId = (v: string | null) => (v ? pack.validateTaxId(v).normalized : null);
  const docNo = (v: string) => v.toUpperCase().replace(/\s+/g, '');
  const breakdownEq = () =>
    gt.printedTaxBreakdown.length === got.printedTaxBreakdown.length &&
    gt.printedTaxBreakdown.every((b) => got.printedTaxBreakdown.some((g) => numEq(g.rate, b.rate) && numEq(g.base, b.base) && numEq(g.tax, b.tax)));

  // Absent (documents transcribed before these fields existed) means none.
  const gtCharges = gt.printedCharges ?? [];
  const gotCharges = got.printedCharges ?? [];
  const chargesEq = () =>
    gtCharges.length === gotCharges.length &&
    gtCharges.every((c) => gotCharges.some((g) => g.kind === c.kind && numEq(g.rate, c.rate) && numEq(g.amount, c.amount)));
  const controlCode = (v: string | null | undefined) => (v ?? '').toUpperCase().replace(/^ATCUD\s*:?/, '').replace(/\s+/g, '') || null;

  const header: FieldResult[] = [
    { field: 'docType', ok: gt.docType === got.docType, expected: gt.docType, got: got.docType },
    { field: 'documentNumber', ok: docNo(gt.documentNumber) === docNo(got.documentNumber), expected: gt.documentNumber, got: got.documentNumber },
    { field: 'issueDate', ok: gt.issueDate === got.issueDate, expected: gt.issueDate, got: got.issueDate },
    { field: 'currency', ok: gt.currency === got.currency, expected: gt.currency, got: got.currency },
    { field: 'issuer.name', ok: normText(gt.issuer.name) === normText(got.issuer.name), expected: gt.issuer.name, got: got.issuer.name },
    { field: 'issuer.taxId', ok: taxId(gt.issuer.taxId) === taxId(got.issuer.taxId), expected: gt.issuer.taxId, got: got.issuer.taxId },
    { field: 'recipient.name', ok: normText(gt.recipient.name) === normText(got.recipient.name), expected: gt.recipient.name, got: got.recipient.name },
    { field: 'recipient.taxId', ok: taxId(gt.recipient.taxId) === taxId(got.recipient.taxId), expected: gt.recipient.taxId, got: got.recipient.taxId },
    { field: 'printedTaxBreakdown', ok: breakdownEq(), expected: gt.printedTaxBreakdown, got: got.printedTaxBreakdown },
    { field: 'printedCharges', ok: chargesEq(), expected: gtCharges, got: gotCharges },
    { field: 'printedTotal', ok: numEq(gt.printedTotal, got.printedTotal), expected: gt.printedTotal, got: got.printedTotal },
    {
      field: 'documentControlCode',
      ok: controlCode(gt.documentControlCode) === controlCode(got.documentControlCode),
      expected: gt.documentControlCode ?? null,
      got: got.documentControlCode ?? null,
    },
  ];

  // Pair lines by description similarity (greedy, best first), then score each pair field by field.
  const candidates: { i: number; j: number; s: number }[] = [];
  gt.lines.forEach((g, i) => got.lines.forEach((p, j) => candidates.push({ i, j, s: similarity(normText(g.description), normText(p.description)) })));
  candidates.sort((a, b) => b.s - a.s);
  const usedGt = new Set<number>();
  const usedGot = new Set<number>();
  const pairs: [number, number][] = [];
  for (const c of candidates) {
    if (c.s < 0.6 || usedGt.has(c.i) || usedGot.has(c.j)) continue;
    usedGt.add(c.i);
    usedGot.add(c.j);
    pairs.push([c.i, c.j]);
  }

  const fieldHits = Object.fromEntries(LINE_FIELDS.map((f) => [f, 0])) as DocComparison['lines']['fieldHits'];
  const mismatches: string[] = header.filter((h) => !h.ok).map((h) => `${h.field}: expected ${JSON.stringify(h.expected)}, got ${JSON.stringify(h.got)}`);
  let tp = 0;
  for (const [i, j] of pairs) {
    const g = gt.lines[i]!;
    const p = got.lines[j]!;
    let allOk = true;
    for (const f of LINE_FIELDS) {
      if (lineFieldOk(f, g, p)) fieldHits[f]++;
      else {
        allOk = false;
        mismatches.push(`lines[${i}].${f}: expected ${JSON.stringify(g[f])}, got ${JSON.stringify(p[f])}`);
      }
    }
    if (allOk) tp++;
  }
  gt.lines.forEach((g, i) => !usedGt.has(i) && mismatches.push(`lines[${i}] missing: "${g.description}"`));
  got.lines.forEach((p, j) => !usedGot.has(j) && mismatches.push(`extra line: "${p.description}"`));

  const fp = got.lines.length - tp;
  const fn = gt.lines.length - tp;
  return {
    exact: header.every((h) => h.ok) && fp === 0 && fn === 0,
    header,
    lines: { tp, fp, fn, fieldHits, gtLines: gt.lines.length },
    mismatches,
  };
}

export function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)]!;
}

export const f1 = (tp: number, fp: number, fn: number) => (tp + fp + fn === 0 ? 1 : (2 * tp) / (2 * tp + fp + fn));
