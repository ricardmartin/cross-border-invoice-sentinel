import type { CountryPack, ExtractedDocument, ReconciliationLine, ValidationIssue } from '@sentinel/core';

/**
 * What to circle on the original: the printed text behind each error, as the read transcribed it.
 * The viewer finds it on the page (PDF text layer or OCR); nothing here knows where it is.
 */
export interface Highlight {
  /** Number shown on the page and next to the error it belongs to. */
  n: number;
  /** As printed, e.g. "660,42" or "B12345674". */
  text: string;
  /** Amounts match on their digits ("1 234,56" = "1.234,56" = "123456"); ids on letters and digits. */
  kind: 'amount' | 'text';
  label: string;
}

export interface HighlightPlan {
  highlights: Highlight[];
  /** Index in `issues` → highlight number. */
  byIssue: Map<number, number>;
  /** Invoice line index → highlight number (delivery-note discrepancies). */
  byLine: Map<number, number>;
}

export function planHighlights(
  doc: ExtractedDocument | null,
  issues: ValidationIssue[],
  pack: CountryPack | null,
  reconciliation: ReconciliationLine[] = [],
  /** Label of a line that does not match its delivery note, in the interface language. */
  deliveryMismatch: (description: string) => string = (d) => `"${d}": does not match the delivery note`,
): HighlightPlan {
  const plan: HighlightPlan = { highlights: [], byIssue: new Map(), byLine: new Map() };
  if (!doc) return plan;
  const amount = (n: number | null | undefined) => (n === null || n === undefined ? null : pack ? pack.formatAmount(Math.abs(n)) : Math.abs(n).toFixed(2));

  const add = (text: string | null, kind: Highlight['kind'], label: string) => {
    if (!text || (kind === 'amount' && text.replace(/\D/g, '').length < 3)) return null;
    const same = plan.highlights.find((h) => h.text === text && h.kind === kind);
    if (same) return same.n;
    const n = plan.highlights.length + 1;
    plan.highlights.push({ n, text, kind, label });
    return n;
  };

  issues.forEach((i, k) => {
    if (i.severity !== 'error') return;
    const path = i.path ?? '';
    let n: number | null = null;
    if (i.lineIndex !== null) {
      // A rate or a multiplication on one line: its printed amount identifies the row.
      const line = doc.lines[i.lineIndex];
      n = add(amount(line?.lineAmount), 'amount', i.message);
    } else if (path === 'printedTotal') {
      n = add(amount(doc.printedTotal), 'amount', i.message);
    } else if (path === 'issuer.taxId') {
      n = add(doc.issuer.taxId, 'text', i.message);
    } else if (path.startsWith('printedTaxBreakdown') || path.startsWith('printedCharges')) {
      n = add(amount(i.found), 'amount', i.message);
    }
    if (n !== null) plan.byIssue.set(k, n);
  });

  for (const l of reconciliation) {
    if (l.kind === 'MATCH' || l.invoiceLineIndex === null) continue;
    const line = doc.lines[l.invoiceLineIndex];
    const n = add(amount(line?.lineAmount), 'amount', deliveryMismatch(line?.description ?? ''));
    if (n !== null) plan.byLine.set(l.invoiceLineIndex, n);
  }
  return plan;
}
