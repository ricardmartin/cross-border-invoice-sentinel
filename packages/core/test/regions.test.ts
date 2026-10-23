import { describe, expect, it } from 'vitest';
import { buildClaimFacts, esPack, frPack, ptPack, taxRegimeFor, validateDocument, type CountryPack, type ExtractedDocument } from '../src';
import { line, validEsInvoice } from './fixtures';

const at = (address: string | null, issuerAddress: string | null = null) => ({
  recipient: { name: 'Restaurante', taxId: null, address },
  issuer: { name: 'Proveedor', taxId: null, address: issuerAddress },
});

describe('taxRegimeFor', () => {
  it.each([
    ['Rua da Sé 12 · 9000-050 Funchal', 'PT-MADEIRA'],
    ['Rua Direita 3 · 9400-162 Porto Santo', 'PT-MADEIRA'],
    ['Largo da Matriz 5 · 9500-094 Ponta Delgada', 'PT-AZORES'],
    ['Rua da Sé 1 · 9700-191 Angra do Heroísmo', 'PT-AZORES'],
    ['Largo do Intendente 7 · 1100-285 Lisboa', 'PT'],
    [null, 'PT'],
  ])('PT: %s → %s', (address, id) => {
    expect(taxRegimeFor(at(address), ptPack).id).toBe(id);
  });

  it.each([
    ['C/ Triana 40 · 35002 Las Palmas de Gran Canaria', 'ES-CANARIAS'],
    ['Av. Anaga 12 · 38001 Santa Cruz de Tenerife', 'ES-CANARIAS'],
    ['C/ de Ponzano 38 · 28003 Madrid', 'ES'],
    ['Plaza Mayor 3 · 45001 Toledo', 'ES'],
  ])('ES: %s → %s', (address, id) => {
    expect(taxRegimeFor(at(address), esPack).id).toBe(id);
  });

  it('without a client address, the supplier address decides (local supplier)', () => {
    expect(taxRegimeFor(at(null, 'Polígono El Mayorazgo · 38108 Santa Cruz de Tenerife'), esPack).id).toBe('ES-CANARIAS');
    expect(taxRegimeFor(at(null, 'Rua do Paim 40 · 9500-095 Ponta Delgada'), ptPack).id).toBe('PT-AZORES');
  });

  it('a printed client address wins over the supplier address', () => {
    expect(taxRegimeFor(at('Plaza Mayor 3 · 45001 Toledo', 'Av. Anaga 12 · 38001 Santa Cruz de Tenerife'), esPack).id).toBe('ES');
    expect(taxRegimeFor(at('Rua do Mercado 12 · 9000-050 Funchal', 'Rua da Indústria 45 · 2690-353 Santa Iria'), ptPack).id).toBe('PT-MADEIRA');
  });

  it('a pack without regions always uses its own rates', () => {
    expect(taxRegimeFor(at('9500-094 Ponta Delgada'), frPack)).toMatchObject({ id: 'FR', region: null, allowedTaxRates: frPack.allowedTaxRates });
  });

  it('maps the mainland hints to the regional rates', () => {
    const azores = taxRegimeFor(at('9500-094 Ponta Delgada'), ptPack);
    expect(azores.allowedTaxRates).toEqual([4, 9, 16]);
    expect(azores.taxRateHints.map((h) => h.rate)).toEqual([4, 9, 16]);
  });
});

describe('validation uses the regime of the delivery address', () => {
  const ptDoc = (address: string, rate: number, description = 'Cerveja 33cl (x24)'): ExtractedDocument => ({
    docType: 'INVOICE',
    country: 'PT',
    documentNumber: 'FT 2026A/1',
    issueDate: '2026-10-07',
    currency: 'EUR',
    issuer: { name: 'Fornecedor', taxId: 'PT503504564', address: null },
    recipient: { name: 'Restaurante', taxId: null, address },
    lines: [line(description, 10, 14.2, rate, 142)],
    printedTaxBreakdown: [{ rate, base: 142, tax: Math.round(142 * rate) / 100 }],
    printedTotal: 142 + Math.round(142 * rate) / 100,
    deliveryNoteRefs: [],
    documentControlCode: 'JFQ4K2M7-1',
  });
  const codes = (d: ExtractedDocument, pack: CountryPack = ptPack) => validateDocument(d, pack).issues.map((i) => i.code);

  it('16 % is right in the Azores and wrong in Lisbon; 23 % the other way round', () => {
    expect(validateDocument(ptDoc('9500-094 Ponta Delgada', 16), ptPack)).toMatchObject({ passed: true, taxRegime: 'PT-AZORES' });
    expect(codes(ptDoc('1100-285 Lisboa', 16))).toContain('RATE_NOT_ALLOWED');
    expect(codes(ptDoc('9500-094 Ponta Delgada', 23))).toContain('RATE_NOT_ALLOWED');
    expect(validateDocument(ptDoc('1100-285 Lisboa', 23), ptPack)).toMatchObject({ passed: true, taxRegime: 'PT' });
  });

  it('the message names the region and its rates (it is the retry feedback)', () => {
    const msg = validateDocument(ptDoc('9000-050 Funchal', 23), ptPack).issues.find((i) => i.code === 'RATE_NOT_ALLOWED')!.message;
    expect(msg).toContain('not allowed in PT (Madeira) (4, 12, 22 %)');
  });

  it('messages for documents outside any region are unchanged', () => {
    const msg = validateDocument(ptDoc('1100-285 Lisboa', 21), ptPack).issues.find((i) => i.code === 'RATE_NOT_ALLOWED')!.message;
    expect(msg).toContain('not allowed in PT (6, 13, 23 %)');
  });

  it('regional rate hints still warn (beer at the reduced rate in Madeira)', () => {
    const d = ptDoc('9000-050 Funchal', 4);
    expect(validateDocument(d, ptPack).issues.map((i) => [i.code, i.severity])).toEqual([['RATE_CATEGORY_SUSPECT', 'warning']]);
  });

  it('Canarias: IGIC 7 % is valid, peninsular IVA 21 % is not', () => {
    const canarias = (rate: number) => {
      const d = validEsInvoice();
      d.recipient.address = 'C/ Triana 40 · 35002 Las Palmas de Gran Canaria';
      d.lines = [line('Agua mineral 1,5L', 10, 14.2, rate, 142)];
      d.printedTaxBreakdown = [{ rate, base: 142, tax: Math.round(142 * rate) / 100 }];
      d.printedTotal = 142 + Math.round(142 * rate) / 100;
      return d;
    };
    expect(validateDocument(canarias(7), esPack)).toMatchObject({ passed: true, taxRegime: 'ES-CANARIAS' });
    expect(codes(canarias(21), esPack)).toContain('RATE_NOT_ALLOWED');
  });

  it('the claim qualifies the amount with the regional tax name', () => {
    const d = validEsInvoice();
    d.recipient.address = 'Av. Anaga 12 · 38001 Santa Cruz de Tenerife';
    d.printedTotal = d.printedTotal! + 3; // something to claim
    const report = validateDocument(d, esPack);
    expect(buildClaimFacts(d, report, null, esPack).vatIncludedLabel).toBe('IGIC incluido');
  });
});
