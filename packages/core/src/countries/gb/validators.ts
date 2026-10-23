import type { TaxIdCheck } from '../types';

/**
 * UK VAT registration number: 9 digits (12 with a 3-digit branch suffix),
 * optionally "GB"-prefixed ("XI" in Northern Ireland). Σ first 7 digits × weights 8..2,
 * plus the last two digits as a number, must be ≡ 0 (mod 97) or, for numbers issued
 * since 2010, ≡ 0 after adding 55 ("9755" scheme).
 */

export function ukVatValid(digits9: string): boolean {
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(digits9[i]) * (8 - i);
  sum += Number(digits9.slice(7));
  return sum % 97 === 0 || (sum + 55) % 97 === 0;
}

export function normalizeBritishTaxId(raw: string): string {
  const id = raw.toUpperCase().replace(/[\s  .\-/]/g, '');
  return /^(GB|XI)\d/.test(id) ? id.slice(2) : id;
}

export function validateBritishTaxId(raw: string): TaxIdCheck {
  const id = normalizeBritishTaxId(raw);
  const fail = (type: string, reason: string): TaxIdCheck => ({ valid: false, type, normalized: id, reason });

  if (!id) return fail('UNKNOWN', 'Empty tax id');
  if (!/^\d{9}(\d{3})?$/.test(id)) return fail('UNKNOWN', 'Expected a UK VAT number (GB + 9 digits)');
  return ukVatValid(id.slice(0, 9)) ? { valid: true, type: 'VAT_GB', normalized: id } : fail('VAT_GB', 'VAT number mod-97 check failed');
}
