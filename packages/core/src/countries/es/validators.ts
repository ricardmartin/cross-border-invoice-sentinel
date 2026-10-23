import type { TaxIdCheck } from '../types';

/**
 * Spanish fiscal identifiers:
 *  - NIF (DNI):    8 digits + control letter
 *  - NIE:          X/Y/Z + 7 digits + control letter
 *  - NIF especial: K/L/M + 7 digits + control letter
 *  - CIF:          organisation letter + 7 digits + control digit or letter
 * An optional "ES" VAT prefix and separators are ignored.
 */

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const CIF_LETTERS = 'JABCDEFGHI';
/** CIF org types whose control character must be a letter / a digit; the rest accept both. */
const CIF_LETTER_CONTROL = 'PQRSNW';
const CIF_DIGIT_CONTROL = 'ABEH';

export function normalizeSpanishTaxId(raw: string): string {
  const id = raw.toUpperCase().replace(/[\s.\-/]/g, '');
  return id.startsWith('ES') && id.length === 11 ? id.slice(2) : id;
}

const dniLetter = (num: number) => DNI_LETTERS[num % 23]!;

export function cifControl(digits7: string): { digit: string; letter: string } {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    let d = Number(digits7[i]);
    if (i % 2 === 0) {
      d *= 2;
      d = Math.floor(d / 10) + (d % 10);
    }
    sum += d;
  }
  const control = (10 - (sum % 10)) % 10;
  return { digit: String(control), letter: CIF_LETTERS[control]! };
}

export function validateSpanishTaxId(raw: string): TaxIdCheck {
  const id = normalizeSpanishTaxId(raw);
  const fail = (type: string, reason: string): TaxIdCheck => ({ valid: false, type, normalized: id, reason });
  const ok = (type: string): TaxIdCheck => ({ valid: true, type, normalized: id });

  if (!id) return fail('UNKNOWN', 'Empty tax id');

  if (/^\d{8}[A-Z]$/.test(id)) {
    return dniLetter(Number(id.slice(0, 8))) === id[8] ? ok('NIF') : fail('NIF', 'NIF control letter mismatch');
  }
  if (/^[XYZ]\d{7}[A-Z]$/.test(id)) {
    const num = Number(String('XYZ'.indexOf(id[0]!)) + id.slice(1, 8));
    return dniLetter(num) === id[8] ? ok('NIE') : fail('NIE', 'NIE control letter mismatch');
  }
  if (/^[KLM]\d{7}[A-Z]$/.test(id)) {
    return dniLetter(Number(id.slice(1, 8))) === id[8] ? ok('NIF_ESPECIAL') : fail('NIF_ESPECIAL', 'Control letter mismatch');
  }
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(id)) {
    const org = id[0]!;
    const control = id[8]!;
    const expected = cifControl(id.slice(1, 8));
    const isLetter = /[A-J]/.test(control);
    if (CIF_LETTER_CONTROL.includes(org) && !isLetter) return fail('CIF', `CIF type ${org} requires a letter control`);
    if (CIF_DIGIT_CONTROL.includes(org) && isLetter) return fail('CIF', `CIF type ${org} requires a digit control`);
    return control === expected.digit || control === expected.letter ? ok('CIF') : fail('CIF', 'CIF control character mismatch');
  }
  return fail('UNKNOWN', 'Not a NIF, NIE or CIF pattern');
}
