/**
 * Money arithmetic in integer cents. Rounding is half away from zero, so a
 * credit note (negative amounts) rounds symmetrically to its invoice.
 */

/** Strips binary float noise (0.1 + 0.2) before rounding. */
const clean = (x: number) => Number(x.toFixed(8));

export const roundHalfAway = (x: number): number => Math.sign(x) * Math.round(Math.abs(clean(x)));

export const toCents = (amount: number): number => roundHalfAway(amount * 100);
export const fromCents = (cents: number): number => cents / 100;

/** quantity × unitPrice × (1 − discount%) in cents. */
export const lineCents = (quantity: number, unitPrice: number, discountPct: number | null = null): number =>
  roundHalfAway(quantity * unitPrice * 100 * (1 - (discountPct ?? 0) / 100));

/** rate% of an amount expressed in cents. */
export const pctCents = (cents: number, ratePct: number): number => roundHalfAway((cents * ratePct) / 100);

export const sumCents = (values: number[]): number => values.reduce((a, b) => a + b, 0);
