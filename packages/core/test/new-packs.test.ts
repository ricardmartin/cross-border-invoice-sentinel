import { describe, expect, it } from 'vitest';
import {
  countriesForTaxId,
  dePack,
  dkPack,
  gbPack,
  iePack,
  irishCheckLetter,
  nifControl,
  ptPack,
  ustIdControl,
  validateBritishTaxId,
  validateDanishTaxId,
  validateDocument,
  validateGermanTaxId,
  validateIrishTaxId,
  validatePortugueseTaxId,
  type CountryPack,
  type ExtractedDocument,
} from '../src';
import { line } from './fixtures';

describe('PT tax ids (NIF / NIPC, mod 11)', () => {
  it.each(['503504564', 'PT503504564', 'PT 503 504 564', '501964843'])('accepts %s', (id) => {
    expect(validatePortugueseTaxId(id)).toMatchObject({ valid: true, type: 'NIF_PT', normalized: id.replace(/\D/g, '') });
  });

  it.each([
    ['503504565', /control digit/],
    ['403504564', /cannot start with 4/],
    ['50350456', /Expected/],
  ])('rejects %s', (id, reason) => {
    const r = validatePortugueseTaxId(id);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(reason);
  });

  it('maps remainders 0 and 1 to control 0', () => {
    expect(nifControl('50350456')).toBe('4');
  });
});

describe('IE tax ids (VAT, mod 23 check letter)', () => {
  it.each(['IE6388047V', '6388047V', 'IE 3668997OH', '8Z49289F'])('accepts %s', (id) => {
    expect(validateIrishTaxId(id)).toMatchObject({ valid: true, type: 'VAT_IE' });
  });

  it.each([
    ['IE6388047W', /check letter/],
    ['IE3668997OA', /check letter/],
    ['IE638804V', /Expected/],
  ])('rejects %s', (id, reason) => {
    const r = validateIrishTaxId(id);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(reason);
  });

  it('weights the second letter of the post-2013 format', () => {
    expect(irishCheckLetter('3668997', 'H')).toBe('O');
    expect(irishCheckLetter('6388047')).toBe('V');
  });
});

describe('DK tax ids (CVR, mod 11)', () => {
  it.each(['13585628', 'DK13585628', 'DK 13 58 56 28'])('accepts %s', (id) => {
    expect(validateDanishTaxId(id)).toMatchObject({ valid: true, type: 'CVR', normalized: '13585628' });
  });

  it.each([
    ['13585627', /mod-11/],
    ['03585628', /Expected/],
    ['1358562', /Expected/],
  ])('rejects %s', (id, reason) => {
    const r = validateDanishTaxId(id);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(reason);
  });
});

describe('DE tax ids (USt-IdNr. ISO 7064 MOD 11,10; Steuernummer shape)', () => {
  it.each([
    ['DE136695976', 'UST_IDNR'],
    ['DE 136 695 976', 'UST_IDNR'],
    ['12/345/67890', 'STEUERNUMMER'],
    ['123/456/78901', 'STEUERNUMMER'],
  ])('accepts %s as %s', (id, type) => {
    expect(validateGermanTaxId(id)).toMatchObject({ valid: true, type });
  });

  it.each([
    ['DE136695977', /control digit/],
    ['DE036695976', /cannot start with 0/],
    ['1234567890', /Expected/],
  ])('rejects %s', (id, reason) => {
    const r = validateGermanTaxId(id);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(reason);
  });

  it('computes the control digit', () => {
    expect(ustIdControl('13669597')).toBe('6');
  });
});

describe('GB tax ids (VAT, mod 97 and 9755)', () => {
  it.each(['GB980780684', 'GB 980 7806 84', '980780684', 'XI980780684', 'GB434031494', 'GB980780684001'])('accepts %s', (id) => {
    expect(validateBritishTaxId(id)).toMatchObject({ valid: true, type: 'VAT_GB' });
  });

  it.each([
    ['GB123456789', /mod-97/],
    ['GB98078068', /Expected/],
  ])('rejects %s', (id, reason) => {
    const r = validateBritishTaxId(id);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(reason);
  });
});

describe('triage signal across the new packs', () => {
  it('a prefixed VAT number points to its own country only', () => {
    expect(countriesForTaxId('PT503504564')).toEqual(['PT']);
    expect(countriesForTaxId('IE6388047V')).toEqual(['IE']);
    expect(countriesForTaxId('DK13585628')).toEqual(['DK']);
    expect(countriesForTaxId('DE136695976')).toEqual(['DE']);
    expect(countriesForTaxId('GB980780684')).toEqual(['GB']);
  });

  it('existing countries keep resolving as before', () => {
    expect(countriesForTaxId('A28015865')).toEqual(['ES']);
    expect(countriesForTaxId('FR44732829320')).toEqual(['FR']);
    expect(countriesForTaxId('IT01987654322')).toEqual(['IT']);
  });
});

describe('formats', () => {
  it.each([
    [ptPack, '1 234,56 €', 1234.56],
    [ptPack, '1.234,56 €', 1234.56],
    [iePack, '€1,234.56', 1234.56],
    [iePack, '1,234', 1234],
    [gbPack, '£1,234.56', 1234.56],
    [gbPack, '£ 0.95', 0.95],
    [dkPack, '1.234,56 kr.', 1234.56],
    [dkPack, 'DKK 89,50', 89.5],
    [dePack, '1.234,56 €', 1234.56],
  ] as [CountryPack, string, number][])('%s parses %j', (pack, raw, n) => {
    expect(pack.parseAmount(raw)).toBeCloseTo(n, 10);
  });

  it('formats amounts the local way', () => {
    expect(iePack.formatAmount(1234.5)).toBe('1,234.50');
    expect(gbPack.formatAmount(1234.5)).toBe('1,234.50');
    expect(dkPack.formatAmount(1234.5)).toBe('1.234,50');
    expect(dePack.formatAmount(1234.5)).toBe('1.234,50');
    expect(ptPack.formatAmount(1234.5).replace(/\s/g, ' ')).toBe('1 234,50');
  });

  it('parses localized textual dates', () => {
    expect(iePack.parseDate('3rd October 2026')).toBe('2026-10-03');
    expect(gbPack.parseDate('21st Sept 2026')).toBe('2026-09-21');
    expect(dkPack.parseDate('7. oktober 2026')).toBe('2026-10-07');
    expect(dkPack.parseDate('07.10.2026')).toBe('2026-10-07');
    expect(dePack.parseDate('3. März 2026')).toBe('2026-03-03');
    expect(ptPack.parseDate('7 de outubro de 2026')).toBe('2026-10-07');
    expect(gbPack.parseDate('31/09/2026')).toBeNull();
  });
});

describe('the same engine validates the new packs', () => {
  const doc = (pack: CountryPack, taxId: string, rates: number[], extra: Partial<ExtractedDocument> = {}): ExtractedDocument => {
    // 10 × 14,20 = 142,00 per line, one line per rate
    const lines = rates.map((r) => line('Item', 10, 14.2, r, 142));
    const printedTaxBreakdown = rates.map((rate) => ({ rate, base: 142, tax: Math.round(142 * rate) / 100 }));
    return {
      docType: 'INVOICE',
      country: pack.code,
      documentNumber: 'X-1',
      issueDate: '2026-10-07',
      currency: pack.currency,
      issuer: { name: 'Supplier', taxId, address: null },
      recipient: { name: 'Restaurant', taxId: null, address: null },
      lines,
      printedTaxBreakdown,
      printedTotal: printedTaxBreakdown.reduce((s, b) => s + b.base + b.tax, 0),
      deliveryNoteRefs: [],
      ...extra,
    };
  };
  const codes = (d: ExtractedDocument, pack: CountryPack) => validateDocument(d, pack).issues.map((i) => i.code);

  it('PT: 6/13/23 % are legal on the mainland, the pre-2011 21 % is not', () => {
    expect(validateDocument(doc(ptPack, 'PT503504564', [6, 13, 23]), ptPack).passed).toBe(true);
    expect(codes(doc(ptPack, 'PT503504564', [21]), ptPack)).toContain('RATE_NOT_ALLOWED');
  });

  it('PT: Madeira rates (4/12/22 %) are rejected by the mainland pack', () => {
    expect(codes(doc(ptPack, 'PT503504564', [22]), ptPack)).toContain('RATE_NOT_ALLOWED');
  });

  it('IE: zero-rated lines are valid and add no VAT; 13,5 % is legal, 21 % is not', () => {
    const d = doc(iePack, 'IE6388047V', [0, 13.5, 23]);
    const r = validateDocument(d, iePack);
    expect(r.passed).toBe(true);
    expect(r.computed.brackets.find((b) => b.rate === 0)!.tax).toBe(0);
    expect(r.computed.taxTotal).toBe(51.83); // 0 + 19,17 + 32,66
    expect(codes(doc(iePack, 'IE6388047V', [21]), iePack)).toContain('RATE_NOT_ALLOWED');
  });

  it('DK: only 25 % moms, in DKK', () => {
    expect(validateDocument(doc(dkPack, 'DK13585628', [25]), dkPack).passed).toBe(true);
    expect(codes(doc(dkPack, 'DK13585628', [22]), dkPack)).toContain('RATE_NOT_ALLOWED');
    expect(codes(doc(dkPack, 'DK13585628', [25], { currency: 'EUR' }), dkPack)).toContain('CURRENCY_MISMATCH');
  });

  it('DE: 7/19 % are legal, the 2020 temporary 16 % is not', () => {
    expect(validateDocument(doc(dePack, 'DE136695976', [7, 19]), dePack).passed).toBe(true);
    expect(codes(doc(dePack, 'DE136695976', [16]), dePack)).toContain('RATE_NOT_ALLOWED');
  });

  it('GB: 0/5/20 % in GBP; a euro invoice is a currency mismatch', () => {
    expect(validateDocument(doc(gbPack, 'GB980780684', [0, 20]), gbPack).passed).toBe(true);
    expect(codes(doc(gbPack, 'GB980780684', [17.5]), gbPack)).toContain('RATE_NOT_ALLOWED');
    expect(codes(doc(gbPack, 'GB980780684', [20], { currency: 'EUR' }), gbPack)).toContain('CURRENCY_MISMATCH');
  });

  it('messages use the pack number format', () => {
    const d = doc(iePack, 'IE6388047V', [23], { printedTotal: 1500 });
    expect(validateDocument(d, iePack).issues[0]!.message).toContain('1,500.00');
  });

  it('rate hints warn on an unusual (still legal) rate, umlauts included', () => {
    const cleaner = doc(dePack, 'DE136695976', [7], { lines: [line('Spülmittel 5 l', 10, 14.2, 7, 142)] });
    expect(validateDocument(cleaner, dePack).issues.map((i) => [i.code, i.severity])).toEqual([['RATE_CATEGORY_SUSPECT', 'warning']]);
    expect(validateDocument(cleaner, dePack).passed).toBe(true);
  });
});
