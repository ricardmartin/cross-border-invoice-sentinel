import type { TaxIdCheck } from '../types';

/**
 * German identifiers:
 *  - USt-IdNr.: "DE" + 9 digits, the last an ISO 7064 MOD 11,10 control
 *  - Steuernummer: printed with slashes ("12/345/67890", "123/456/78901"); its
 *    layout and check vary by Land, so only the printed shape is checked
 */

export function ustIdControl(first8: string): string {
  let product = 10;
  for (let i = 0; i < 8; i++) {
    let sum = (Number(first8[i]) + product) % 10;
    if (sum === 0) sum = 10;
    product = (2 * sum) % 11;
  }
  const check = 11 - product;
  return String(check === 10 ? 0 : check);
}

const STEUERNUMMER = /^\d{2,3}\/\d{3,4}\/\d{4,5}$/;

export function normalizeGermanTaxId(raw: string): string {
  const id = raw.toUpperCase().replace(/[\s  .\-]/g, '');
  return id.startsWith('DE') && id.length === 11 ? id.slice(2) : id;
}

export function validateGermanTaxId(raw: string): TaxIdCheck {
  const id = normalizeGermanTaxId(raw);
  const fail = (type: string, reason: string): TaxIdCheck => ({ valid: false, type, normalized: id, reason });

  if (!id) return fail('UNKNOWN', 'Empty tax id');
  if (STEUERNUMMER.test(id)) return { valid: true, type: 'STEUERNUMMER', normalized: id.replace(/\//g, '') };
  // Bare 9 digits are accepted: the "DE" prefix is sometimes printed apart from the number.
  if (/^\d{9}$/.test(id)) {
    if (id[0] === '0') return fail('UST_IDNR', 'USt-IdNr. cannot start with 0');
    return ustIdControl(id.slice(0, 8)) === id[8] ? { valid: true, type: 'UST_IDNR', normalized: id } : fail('UST_IDNR', 'USt-IdNr. control digit mismatch');
  }
  return fail('UNKNOWN', 'Expected USt-IdNr. (DE + 9 digits) or a Steuernummer (e.g. 12/345/67890)');
}
