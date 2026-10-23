import type { TaxIdCheck } from '../types';

/**
 * Italian identifiers:
 *  - Partita IVA: 11 digits, Luhn-like control digit (optionally "IT"-prefixed as a VAT number)
 *  - Codice Fiscale (persons): 16 chars, control letter from the odd/even tables;
 *    companies use an 11-digit numeric codice fiscale identical in form to a Partita IVA
 */

export function partitaIvaControl(first10: string): string {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let d = Number(first10[i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

const ODD: Record<string, number> = {
  0: 1, 1: 0, 2: 5, 3: 7, 4: 9, 5: 13, 6: 15, 7: 17, 8: 19, 9: 21,
  A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18,
  N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
};
const evenValue = (c: string) => (/\d/.test(c) ? Number(c) : c.charCodeAt(0) - 65);

export function codiceFiscaleControl(first15: string): string {
  let sum = 0;
  for (let i = 0; i < 15; i++) sum += i % 2 === 0 ? ODD[first15[i]!]! : evenValue(first15[i]!);
  return String.fromCharCode(65 + (sum % 26));
}

export function normalizeItalianTaxId(raw: string): string {
  const id = raw.toUpperCase().replace(/[\s.\-/]/g, '');
  return id.startsWith('IT') && id.length === 13 ? id.slice(2) : id;
}

const CF_PATTERN = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-EHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;

export function validateItalianTaxId(raw: string): TaxIdCheck {
  const id = normalizeItalianTaxId(raw);
  const fail = (type: string, reason: string): TaxIdCheck => ({ valid: false, type, normalized: id, reason });
  const ok = (type: string): TaxIdCheck => ({ valid: true, type, normalized: id });

  if (!id) return fail('UNKNOWN', 'Empty tax id');
  if (/^\d{11}$/.test(id)) {
    return partitaIvaControl(id.slice(0, 10)) === id[10] ? ok('PARTITA_IVA') : fail('PARTITA_IVA', 'Partita IVA control digit mismatch');
  }
  if (CF_PATTERN.test(id)) {
    return codiceFiscaleControl(id.slice(0, 15)) === id[15] ? ok('CODICE_FISCALE') : fail('CODICE_FISCALE', 'Codice Fiscale control letter mismatch');
  }
  return fail('UNKNOWN', 'Expected Partita IVA (11 digits) or Codice Fiscale (16 characters)');
}
