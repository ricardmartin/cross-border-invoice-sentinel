import { fromCents, lineCents, pctCents, toCents } from '../money';
import type { ContractCheckLine, ContractCheckResult, ContractLineMatch } from '../schemas/contracts';
import type { ExtractedDocument } from '../schemas/extracted';
import type { ReconciliationResult } from '../schemas/reconciliation';

/**
 * Pure: invoice lines vs the clauses the contracts service matched. A line is only claimable
 * when the clause is settled (MATCHED), in the invoice's currency and unit, and the invoiced
 * unit price is above the agreed one. Anything doubtful is UNVERIFIED, never a claim.
 *
 * No double counting with the delivery-note reconciliation: the overcharge applies to what
 * remains after it, i.e. the delivered quantity and, when the valued note shows a lower
 * price, that price.
 */

const normUnit = (u: string | null | undefined) => (u ?? '').toLowerCase().replace(/[.\s]/g, '');
/** An unprinted unit is taken as the contract's only within this price ratio. */
const UNPRINTED_UNIT_BAND = 1.5;

export function checkContractPrices(invoice: ExtractedDocument, matches: ContractLineMatch[], reconciliation: ReconciliationResult | null = null): ContractCheckResult {
  const lines: ContractCheckLine[] = invoice.lines.map((line, i) => {
    const m = matches.find((x) => x.index === i);
    const base = { invoiceLineIndex: i, clauseId: null, clauseTitle: null, contractKind: null, invoiceUnitPrice: line.unitPrice, agreedUnitPrice: null, quantity: null, amountAtStake: 0 };
    if (!m || m.outcome === 'NO_CONTRACT') return { ...base, kind: 'NO_CONTRACT' as const, note: m?.reason ?? 'not checked' };
    if (m.outcome === 'AMBIGUOUS' || !m.clause) return { ...base, kind: 'UNVERIFIED' as const, note: m.reason };

    const c = m.clause;
    const clause = { ...base, clauseId: c.id, clauseTitle: c.title, contractKind: c.contractKind, agreedUnitPrice: c.price.amount };
    if (line.unitPrice === null) return { ...clause, kind: 'UNVERIFIED' as const, note: 'invoice line has no unit price' };
    if (c.price.currency !== invoice.currency) return { ...clause, kind: 'UNVERIFIED' as const, note: `contract in ${c.price.currency}, invoice in ${invoice.currency}` };
    if (!c.price.unit) return { ...clause, kind: 'UNVERIFIED' as const, note: 'clause has no selling unit' };
    const unitPrinted = normUnit(line.unit) !== '';
    if (unitPrinted && normUnit(c.price.unit) !== normUnit(line.unit)) {
      return { ...clause, kind: 'UNVERIFIED' as const, note: `contract unit "${c.price.unit}" vs invoice unit "${line.unit}"` };
    }
    // Many invoices print no unit: assume the contract's selling unit only when the prices are of the same magnitude
    // (a box billed against a per-unit price would be far outside the band).
    if (!unitPrinted && (line.unitPrice > c.price.amount * UNPRINTED_UNIT_BAND || line.unitPrice < c.price.amount / UNPRINTED_UNIT_BAND)) {
      return { ...clause, kind: 'UNVERIFIED' as const, note: `unit not printed and ${line.unitPrice} is far from the agreed ${c.price.amount} per ${c.price.unit}` };
    }

    const rec = reconciliation?.lines.find((l) => l.invoiceLineIndex === i);
    const quantity =
      rec?.kind === 'MISSING_IN_DELIVERY_NOTE' && rec.amountAtStake > 0
        ? 0 // the whole line is already claimed as not delivered
        : rec?.kind === 'QUANTITY_DIFF' && rec.deliveredQuantity !== null
          ? Math.min(line.quantity, rec.deliveredQuantity)
          : line.quantity;
    const price = rec?.kind === 'PRICE_DIFF' && rec.deliveryNoteUnitPrice !== null ? Math.min(line.unitPrice, rec.deliveryNoteUnitPrice) : line.unitPrice;
    const diffCents = toCents(price) - toCents(c.price.amount);
    if (toCents(line.unitPrice) < toCents(c.price.amount)) return { ...clause, quantity, kind: 'BELOW_CONTRACT' as const, note: m.reason };
    if (diffCents <= 0) return { ...clause, quantity, kind: 'AT_CONTRACT' as const, note: m.reason };

    const net = lineCents(quantity, fromCents(diffCents), line.discountPct);
    const stake = net + pctCents(net, line.taxRate ?? 0);
    return { ...clause, quantity, kind: 'ABOVE_CONTRACT' as const, amountAtStake: fromCents(stake), note: m.reason };
  });
  return { lines, amountAtStake: fromCents(lines.reduce((s, l) => s + toCents(l.amountAtStake), 0)) };
}
