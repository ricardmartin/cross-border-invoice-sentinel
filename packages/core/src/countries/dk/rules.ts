import type { LocalFieldNames } from '../types';

export const DK_VERSION = '1.0.0';

/** Denmark has a single 25 % moms rate for everything a restaurant buys (no reduced rates). */
export const DK_ALLOWED_TAX_RATES = [25];

export const DK_FIELD_NAMES: LocalFieldNames = {
  invoice: ['Faktura', 'Fakturanr.'],
  deliveryNote: ['Følgeseddel', 'Leveringsnota', 'Følgeseddelnr.'],
  creditNote: ['Kreditnota'],
  taxId: ['CVR', 'CVR-nr.', 'SE-nr.', 'Momsnr.'],
  taxBase: ['Momsgrundlag', 'Subtotal', 'Beløb ekskl. moms'],
  taxAmount: ['Moms', 'Moms 25 %'],
  total: ['Total', 'I alt', 'Total inkl. moms', 'At betale'],
};

export const DK_MONTHS = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december',
] as const;
