import type { TaxIdCheck } from '../types';

/**
 * Danish CVR / SE number: 8 digits, first one not 0, Σ digit × (2,7,6,5,4,3,2,1) ≡ 0 (mod 11).
 * The VAT number is the CVR with a "DK" prefix.
 */

const WEIGHTS = [2, 7, 6, 5, 4, 3, 2, 1];

export const cvrValid = (digits8: string) => WEIGHTS.reduce((s, w, i) => s + w * Number(digits8[i]), 0) % 11 === 0;

export function normalizeDanishTaxId(raw: string): string {
  const id = raw.toUpperCase().replace(/[\s  .\-/]/g, '');
  return id.startsWith('DK') && id.length === 10 ? id.slice(2) : id;
}

export function validateDanishTaxId(raw: string): TaxIdCheck {
  const id = normalizeDanishTaxId(raw);
  const fail = (type: string, reason: string): TaxIdCheck => ({ valid: false, type, normalized: id, reason });

  if (!id) return fail('UNKNOWN', 'Empty tax id');
  if (!/^[1-9]\d{7}$/.test(id)) return fail('UNKNOWN', 'Expected a CVR number (8 digits, optionally DK-prefixed)');
  return cvrValid(id) ? { valid: true, type: 'CVR', normalized: id } : fail('CVR', 'CVR mod-11 check failed');
}
