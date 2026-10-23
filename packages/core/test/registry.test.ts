import { describe, expect, it } from 'vitest';
import {
  countriesForTaxId,
  esPack,
  fromCents,
  getCountryPack,
  hasCountryPack,
  lineCents,
  pctCents,
  registerCountryPack,
  roundHalfAway,
  toCents,
  UnknownCountryError,
} from '../src';

describe('country registry', () => {
  it('resolves packs case-insensitively', () => {
    expect(getCountryPack('es')).toBe(esPack);
    expect(hasCountryPack('ES')).toBe(true);
  });

  it('throws a typed error for unknown countries', () => {
    expect(() => getCountryPack('NL')).toThrow(UnknownCountryError);
  });

  it('rejects duplicate and malformed packs at registration', () => {
    expect(() => registerCountryPack(esPack)).toThrow(/already registered/);
    expect(() => registerCountryPack({ ...esPack, code: 'XX', version: 'v1' })).toThrow();
    expect(() => registerCountryPack({ ...esPack, code: 'YY', allowedTaxRates: [] })).toThrow();
  });

  it('infers candidate countries from a tax id', () => {
    expect(countriesForTaxId('A28015865')).toEqual(['ES']);
    expect(countriesForTaxId('ESA28015865')).toEqual(['ES']);
    expect(countriesForTaxId('FR19812345676')).toEqual(['FR']);
    expect(countriesForTaxId('IT01987654322')).toEqual(['IT']);
    expect(countriesForTaxId('B00000001')).toEqual([]);
  });

  it('exposes the ES prompt context (markdown text)', () => {
    expect(esPack.promptContext).toContain('Base imponible');
    expect(esPack.promptContext).toContain('Albarán');
  });
});

describe('money', () => {
  it('rounds half away from zero, symmetric for credit notes', () => {
    expect(roundHalfAway(2.5)).toBe(3);
    expect(roundHalfAway(-2.5)).toBe(-3);
    expect(lineCents(12.5, 1.85)).toBe(2313);
    expect(lineCents(-12.5, 1.85)).toBe(-2313);
  });

  it('is immune to binary float noise', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(1.005)).toBe(101);
    expect(lineCents(3, 0.1)).toBe(30);
    expect(fromCents(29032)).toBe(290.32);
  });

  it('computes percentage of cents', () => {
    expect(pctCents(4713, 4)).toBe(189);
    expect(pctCents(5470, 21)).toBe(1149);
    expect(pctCents(1050, 21)).toBe(221); // 220,5 → 221
  });
});
