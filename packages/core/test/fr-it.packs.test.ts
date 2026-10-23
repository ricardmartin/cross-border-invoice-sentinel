import { describe, expect, it } from 'vitest';
import {
  codiceFiscaleControl,
  frPack,
  itPack,
  partitaIvaControl,
  tvaKey,
  validateDocument,
  validateFrenchTaxId,
  validateItalianTaxId,
  type ExtractedDocument,
} from '../src';
import { line } from './fixtures';

describe('FR tax ids', () => {
  it.each([
    ['732829320', 'SIREN'],
    ['732 829 320', 'SIREN'],
    ['73282932000074', 'SIRET'],
    ['FR44732829320', 'TVA_FR'],
    ['FR 44 732 829 320', 'TVA_FR'],
    ['35600000000001', 'SIRET'], // La Poste: digit sum 15 is a multiple of 5 (not Luhn)
  ])('accepts %s as %s', (id, type) => {
    expect(validateFrenchTaxId(id)).toMatchObject({ valid: true, type });
  });

  it.each([
    ['732829321', /Luhn/],
    ['73282932000075', /Luhn/],
    ['FR45732829320', /key 45/],
    ['FR44732829321', /SIREN/],
    ['35600000000002', /La Poste/],
    ['12345', /Expected/],
  ])('rejects %s', (id, reason) => {
    const r = validateFrenchTaxId(id);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(reason);
  });

  it('computes the TVA key from the SIREN', () => {
    expect(tvaKey('732829320')).toBe('44');
  });
});

describe('IT tax ids', () => {
  it.each([
    ['01987654322', 'PARTITA_IVA'],
    ['IT01987654322', 'PARTITA_IVA'],
    ['RSSMRA85T10A562S', 'CODICE_FISCALE'],
    ['rssmra85t10a562s', 'CODICE_FISCALE'],
  ])('accepts %s as %s', (id, type) => {
    expect(validateItalianTaxId(id)).toMatchObject({ valid: true, type });
  });

  it.each([
    ['01987654321', /control digit/],
    ['RSSMRA85T10A562X', /control letter/],
    ['RSSMRA85Z10A562S', /Expected/], // Z is not a month letter
    ['1234567890', /Expected/],
  ])('rejects %s', (id, reason) => {
    const r = validateItalianTaxId(id);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(reason);
  });

  it('computes control characters', () => {
    expect(partitaIvaControl('0198765432')).toBe('2');
    expect(codiceFiscaleControl('RSSMRA85T10A562')).toBe('S');
  });
});

describe('FR / IT formats', () => {
  it.each([
    ['1 234,56 €', 1234.56],
    ['1 234,56', 1234.56],
    ['12,5', 12.5],
  ])('FR parses %j', (raw, n) => expect(frPack.parseAmount(raw)).toBeCloseTo(n, 10));

  it.each([
    ['1.234,56 €', 1234.56],
    ['€ 1.234', 1234],
  ])('IT parses %j', (raw, n) => expect(itPack.parseAmount(raw)).toBeCloseTo(n, 10));

  it('parses localized textual dates', () => {
    expect(frPack.parseDate('1er octobre 2026')).toBe('2026-10-01');
    expect(frPack.parseDate('7 août 2026')).toBe('2026-08-07');
    expect(itPack.parseDate('7 ottobre 2026')).toBe('2026-10-07');
    expect(itPack.parseDate('31/02/2026')).toBeNull();
  });

  it('formats amounts the local way', () => {
    expect(frPack.formatAmount(1234.5)).toBe('1 234,50');
    expect(itPack.formatAmount(1234.5)).toBe('1.234,50');
  });
});

describe('the same engine validates every pack', () => {
  const doc = (country: string, taxId: string, rate: number, extra: Partial<ExtractedDocument> = {}): ExtractedDocument => ({
    docType: 'INVOICE',
    country,
    documentNumber: 'X-1',
    issueDate: '2026-10-07',
    currency: 'EUR',
    issuer: { name: 'Supplier', taxId, address: null },
    recipient: { name: 'Restaurant', taxId: null, address: null },
    // 10 × 14,20 = 142,00
    lines: [line('Beurre AOP', 10, 14.2, rate, 142)],
    printedTaxBreakdown: [{ rate, base: 142, tax: Math.round(142 * rate) / 100 }],
    printedTotal: 142 + Math.round(142 * rate) / 100,
    deliveryNoteRefs: [],
    ...extra,
  });

  it('FR: 5,5 % is legal, 19,6 % (pre-2014) is not', () => {
    expect(validateDocument(doc('FR', 'FR44732829320', 5.5), frPack).passed).toBe(true);
    expect(validateDocument(doc('FR', 'FR44732829320', 19.6), frPack).issues.map((i) => i.code)).toContain('RATE_NOT_ALLOWED');
  });

  it('IT: 22 % is legal, 21 % (pre-2013) is not', () => {
    expect(validateDocument(doc('IT', '01987654322', 22), itPack).passed).toBe(true);
    expect(validateDocument(doc('IT', '01987654322', 21), itPack).issues.map((i) => i.code)).toContain('RATE_NOT_ALLOWED');
  });

  it('messages use the pack number format', () => {
    const d = doc('FR', 'FR44732829320', 5.5, { printedTotal: 1500 });
    expect(validateDocument(d, frPack).issues[0]!.message).toContain('1 500,00');
  });
});
