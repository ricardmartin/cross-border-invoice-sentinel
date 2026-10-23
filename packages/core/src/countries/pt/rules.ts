import { mapRateHints } from '../regions';
import type { LocalFieldNames, TaxRateHint, TaxRegion } from '../types';

export const PT_VERSION = '1.2.0';

/** Mainland rates (Continente). The autonomous regions have their own, see PT_REGIONS. */
export const PT_ALLOWED_TAX_RATES = [6, 13, 23];

/** Soft signal only: staples 6 % (Lista I), wine and some preserves 13 % (Lista II), the rest 23 %. */
export const PT_TAX_RATE_HINTS: TaxRateHint[] = [
  {
    rate: 6,
    keywords: ['pao', 'leite', 'ovos', 'fruta', 'legumes', 'hortalicas', 'tomate', 'batata', 'cebola', 'alface', 'farinha', 'arroz',
      'carne', 'frango', 'porco', 'vitela', 'peixe', 'bacalhau', 'sardinha', 'polvo', 'queijo', 'manteiga', 'azeite', 'agua'],
  },
  { rate: 13, keywords: ['vinho', 'conservas'] },
  {
    rate: 23,
    keywords: ['cerveja', 'aguardente', 'whisky', 'gin', 'vodka', 'licor', 'refrigerante', 'detergente', 'lixivia', 'desengordurante',
      'guardanapos', 'pelicula', 'luvas'],
  },
];

/**
 * Reduced / intermediate / standard rates of the autonomous regions (CIVA art. 18.º, n.º 3),
 * found by the postal code of the delivery address: Madeira 9000–9499 (Porto Santo included), Azores 9500–9999.
 */
const MADEIRA_RATES: Record<number, number> = { 6: 4, 13: 12, 23: 22 };
const AZORES_RATES: Record<number, number> = { 6: 4, 13: 9, 23: 16 };

export const PT_REGIONS: TaxRegion[] = [
  {
    id: 'MADEIRA',
    name: 'Madeira',
    postalCode: /\b9[0-4]\d{2}-\d{3}\b/,
    allowedTaxRates: Object.values(MADEIRA_RATES),
    taxRateHints: mapRateHints(PT_TAX_RATE_HINTS, MADEIRA_RATES),
  },
  {
    id: 'AZORES',
    name: 'Açores',
    postalCode: /\b9[5-9]\d{2}-\d{3}\b/,
    allowedTaxRates: Object.values(AZORES_RATES),
    taxRateHints: mapRateHints(PT_TAX_RATE_HINTS, AZORES_RATES),
  },
];

export const PT_FIELD_NAMES: LocalFieldNames = {
  invoice: ['Fatura', 'Fatura-Recibo', 'Fatura simplificada', 'FT', 'FR'],
  deliveryNote: ['Guia de remessa', 'Guia de transporte', 'GR', 'GT'],
  creditNote: ['Nota de crédito', 'NC'],
  taxId: ['NIF', 'NIPC', 'Contribuinte', 'N.º Contribuinte'],
  taxBase: ['Incidência', 'Base tributável', 'Valor s/ IVA'],
  taxAmount: ['Valor IVA', 'IVA'],
  total: ['Total', 'Total a pagar', 'Total documento'],
};

export const PT_MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const;
