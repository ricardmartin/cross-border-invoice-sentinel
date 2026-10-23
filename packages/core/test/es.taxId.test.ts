import { describe, expect, it } from 'vitest';
import { cifControl, validateSpanishTaxId } from '../src/countries/es/validators';

describe('ES tax ids', () => {
  it.each([
    ['12345678Z', 'NIF'],
    ['00000000T', 'NIF'],
    ['X1234567L', 'NIE'],
    ['Y1234567X', 'NIE'],
    ['K1234567L', 'NIF_ESPECIAL'],
    ['A28015865', 'CIF'], // real public CIF, digit control
    ['Q2826000H', 'CIF'], // public body, letter control
    ['B87123451', 'CIF'],
  ])('accepts %s as %s', (id, type) => {
    expect(validateSpanishTaxId(id)).toMatchObject({ valid: true, type });
  });

  it.each([
    ['es a-28.015.865', 'A28015865'],
    ['ESA28015865', 'A28015865'],
    ['12.345.678-z', '12345678Z'],
  ])('normalizes separators, case and ES prefix: %s', (raw, normalized) => {
    expect(validateSpanishTaxId(raw)).toMatchObject({ valid: true, normalized });
  });

  it.each([
    ['12345678A', 'NIF', /letter/],
    ['X1234567A', 'NIE', /letter/],
    ['A28015866', 'CIF', /mismatch/],
    ['Q28260008', 'CIF', /requires a letter/], // Q must use a letter control
    ['A2801586E', 'CIF', /requires a digit/], // A must use a digit control
    ['I28015865', 'UNKNOWN', /pattern/], // I is not a CIF org letter
    ['1234567Z', 'UNKNOWN', /pattern/],
    ['', 'UNKNOWN', /Empty/],
  ])('rejects %s', (id, type, reason) => {
    const res = validateSpanishTaxId(id);
    expect(res.valid).toBe(false);
    expect(res.type).toBe(type);
    expect(res.reason).toMatch(reason);
  });

  it('computes CIF control digit and letter', () => {
    expect(cifControl('2801586')).toEqual({ digit: '5', letter: 'E' });
    expect(cifControl('2826000')).toEqual({ digit: '8', letter: 'H' });
  });
});
