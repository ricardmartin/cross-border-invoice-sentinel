import type { TaxIdCheck } from '../types';

/**
 * Irish VAT numbers (optionally "IE"-prefixed):
 *  - current: 7 digits + check letter, or 7 digits + check letter + "W"/"A"-"I" (since 2013)
 *  - legacy:  digit + letter/"+"/"*" + 5 digits + check letter (e.g. 8Z49289F)
 * Check letter = "WABCDEFGHIJKLMNOPQRSTUV"[(Σ digit × weight 8..2 + second letter × 9) mod 23].
 */

const CHECK_LETTERS = 'WABCDEFGHIJKLMNOPQRSTUV';

export function irishCheckLetter(digits7: string, secondLetter = ''): string {
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(digits7[i]) * (8 - i);
  if (secondLetter) sum += (secondLetter === 'W' ? 0 : secondLetter.charCodeAt(0) - 64) * 9;
  return CHECK_LETTERS[sum % 23]!;
}

export function normalizeIrishTaxId(raw: string): string {
  const id = raw.toUpperCase().replace(/[\s  .\-/]/g, '');
  return id.startsWith('IE') && id.length >= 10 ? id.slice(2) : id;
}

export function validateIrishTaxId(raw: string): TaxIdCheck {
  const id = normalizeIrishTaxId(raw);
  const fail = (type: string, reason: string): TaxIdCheck => ({ valid: false, type, normalized: id, reason });
  const ok = (): TaxIdCheck => ({ valid: true, type: 'VAT_IE', normalized: id });

  if (!id) return fail('UNKNOWN', 'Empty tax id');
  const current = /^(\d{7})([A-W])([A-IW]?)$/.exec(id);
  if (current) return irishCheckLetter(current[1]!, current[3]) === current[2] ? ok() : fail('VAT_IE', 'VAT check letter mismatch');
  const legacy = /^(\d)[A-Z+*](\d{5})([A-W])$/.exec(id);
  if (legacy) return irishCheckLetter(`0${legacy[2]}${legacy[1]}`) === legacy[3] ? ok() : fail('VAT_IE', 'VAT check letter mismatch');
  return fail('UNKNOWN', 'Expected an Irish VAT number (7 digits + 1 or 2 letters, optionally IE-prefixed)');
}
