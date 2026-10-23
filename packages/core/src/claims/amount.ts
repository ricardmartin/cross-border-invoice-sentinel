import { fromCents, lineCents, pctCents, toCents } from '../money';
import type { ExtractedDocument } from '../schemas/extracted';
import type { ReconciliationResult } from '../schemas/reconciliation';
import type { ComputedTotals } from '../schemas/validated';

/**
 * What the restaurant can claim, computed in code (never by the LLM):
 *  - invoice-internal: printed total minus the total that its own lines justify
 *    (quantity × price, per-bracket VAT at the printed rates, plus the charges the
 *    validator computed from their rates);
 *  - delivery note: amount billed for goods not delivered, VAT included.
 * Negative differences (supplier under-billed) are not claimed.
 */
export interface ClaimAmount {
  invoiceOverbilled: number;
  deliveryOverbilled: number;
  total: number;
}

export function computeClaimAmount(
  invoice: ExtractedDocument,
  reconciliation: ReconciliationResult | null,
  charges: ComputedTotals['charges'] = { surcharges: 0, stampDuty: 0, withholdings: 0 },
): ClaimAmount {
  const byRate = new Map<number, number>();
  for (const l of invoice.lines) {
    if (l.unitPrice === null || l.taxRate === null) continue;
    byRate.set(l.taxRate, (byRate.get(l.taxRate) ?? 0) + lineCents(l.quantity, l.unitPrice, l.discountPct));
  }
  const justified = [...byRate.entries()].reduce((s, [rate, base]) => s + base + pctCents(base, rate), 0) + toCents(charges.surcharges) + toCents(charges.stampDuty);
  let invoiceCents = 0;
  if (invoice.printedTotal !== null) {
    // The printed total may be the gross total or the amount due after withholdings: measure against the closer one.
    const printed = toCents(invoice.printedTotal);
    const due = justified - toCents(charges.withholdings);
    invoiceCents = Math.max(0, Math.abs(printed - due) < Math.abs(printed - justified) ? printed - due : printed - justified);
  }
  const deliveryCents = reconciliation ? Math.max(0, toCents(reconciliation.amountAtStake)) : 0;
  return { invoiceOverbilled: fromCents(invoiceCents), deliveryOverbilled: fromCents(deliveryCents), total: fromCents(invoiceCents + deliveryCents) };
}
