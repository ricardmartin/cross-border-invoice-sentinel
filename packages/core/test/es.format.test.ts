import { describe, expect, it } from 'vitest';
import { FormatError } from '../src';
import { formatSpanishAmount, parseSpanishAmount, parseSpanishDate } from '../src/countries/es/format';

describe('ES amounts', () => {
  it.each([
    ['1.234,56 €', 1234.56],
    ['1234,56', 1234.56],
    ['1.234.567,89 EUR', 1234567.89],
    ['1 234,56', 1234.56],
    ['0,5', 0.5],
    ['1,235', 1.235], // €/kg unit price: comma is always decimal in ES
    ['1.234', 1234], // dot + 3 digits = thousands
    ['1234.56', 1234.56], // foreign decimal point, unambiguous
    ['1,234.56', 1234.56],
    ['12,50-', -12.5], // ERP credit-note style
    ['(12,50)', -12.5],
    ['-3,00 €', -3],
    ['€ 42', 42],
  ])('parses %s → %d', (raw, expected) => {
    expect(parseSpanishAmount(raw)).toBeCloseTo(expected, 10);
  });

  it.each(['abc', '', '12,', '1,2,3', '1.23.4', '1.234,5.6', '12,50 kg'])('rejects %j', (raw) => {
    expect(() => parseSpanishAmount(raw)).toThrow(FormatError);
  });

  it('formats with grouping and two decimals', () => {
    expect(formatSpanishAmount(1234.5)).toBe('1.234,50');
    expect(formatSpanishAmount(9)).toBe('9,00');
  });
});

describe('ES dates', () => {
  it.each([
    ['03/10/2026', '2026-10-03'],
    ['3-10-26', '2026-10-03'],
    ['03.10.2026', '2026-10-03'],
    ['2026-10-03', '2026-10-03'],
    ['3 de octubre de 2026', '2026-10-03'],
    ['03-oct-2026', '2026-10-03'],
    ['3 oct. 2026', '2026-10-03'],
    ['29/02/2028', '2028-02-29'],
  ])('parses %s → %s', (raw, iso) => {
    expect(parseSpanishDate(raw)).toBe(iso);
  });

  it.each(['31/02/2026', '29/02/2026', '2026-13-01', '3 de brumario de 2026', 'ayer'])('rejects %s', (raw) => {
    expect(parseSpanishDate(raw)).toBeNull();
  });
});
