import type { TaxIdCheck } from '../types';

/**
 * French identifiers:
 *  - SIREN: 9 digits, Luhn
 *  - SIRET: 14 digits (SIREN + NIC), Luhn — except La Poste (SIREN 356000000),
 *    whose SIRETs are valid when the digit sum is a multiple of 5
 *  - TVA intracommunautaire: "FR" + 2-digit key + SIREN, key = (12 + 3 × (SIREN mod 97)) mod 97
 */

export const luhnValid = (digits: string): boolean => {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
};

export const tvaKey = (siren: string) => String((12 + 3 * (Number(siren) % 97)) % 97).padStart(2, '0');

const LA_POSTE_SIREN = '356000000';

export function normalizeFrenchTaxId(raw: string): string {
  return raw.toUpperCase().replace(/[\s  .\-/]/g, '');
}

export function validateFrenchTaxId(raw: string): TaxIdCheck {
  const id = normalizeFrenchTaxId(raw);
  const fail = (type: string, reason: string): TaxIdCheck => ({ valid: false, type, normalized: id, reason });
  const ok = (type: string): TaxIdCheck => ({ valid: true, type, normalized: id });

  if (!id) return fail('UNKNOWN', 'Empty tax id');
  if (/^\d{9}$/.test(id)) return luhnValid(id) ? ok('SIREN') : fail('SIREN', 'SIREN Luhn checksum failed');
  if (/^\d{14}$/.test(id)) {
    if (id.startsWith(LA_POSTE_SIREN)) {
      const sum = [...id].reduce((s, d) => s + Number(d), 0);
      return sum % 5 === 0 ? ok('SIRET') : fail('SIRET', 'La Poste SIRET digit sum is not a multiple of 5');
    }
    return luhnValid(id) ? ok('SIRET') : fail('SIRET', 'SIRET Luhn checksum failed');
  }
  if (/^FR[0-9A-Z]{2}\d{9}$/.test(id)) {
    const key = id.slice(2, 4);
    const siren = id.slice(4);
    if (!luhnValid(siren)) return fail('TVA_FR', 'Embedded SIREN fails its Luhn checksum');
    // Alphanumeric keys exist for some non-SIREN-based numbers and cannot be verified offline.
    if (/^\d{2}$/.test(key) && key !== tvaKey(siren)) return fail('TVA_FR', `TVA key ${key} does not match SIREN`);
    return ok('TVA_FR');
  }
  return fail('UNKNOWN', 'Expected SIREN (9 digits), SIRET (14 digits) or FR + key + SIREN');
}
