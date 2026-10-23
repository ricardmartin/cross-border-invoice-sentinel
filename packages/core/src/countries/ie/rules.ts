import type { LocalFieldNames, TaxRateHint } from '../types';

export const IE_VERSION = '1.0.0';

/** Irish VAT rates relevant to restaurant suppliers (4,8 % livestock is out of scope). Most basic food is zero-rated. */
export const IE_ALLOWED_TAX_RATES = [0, 9, 13.5, 23];

/** Soft signal only: basic food 0 %, alcohol, soft drinks, confectionery and non-food 23 %. */
export const IE_TAX_RATE_HINTS: TaxRateHint[] = [
  {
    rate: 0,
    keywords: ['bread', 'milk', 'eggs', 'butter', 'cheese', 'flour', 'potatoes', 'carrots', 'onions', 'tomatoes', 'lettuce', 'apples',
      'beef', 'lamb', 'pork', 'chicken', 'salmon', 'cod', 'hake', 'rashers', 'sausages'],
  },
  {
    rate: 23,
    keywords: ['wine', 'beer', 'stout', 'lager', 'cider', 'whiskey', 'gin', 'vodka', 'cola', 'lemonade', 'crisps', 'chocolate',
      'detergent', 'bleach', 'degreaser', 'napkins', 'cling film', 'gloves'],
  },
];

export const IE_FIELD_NAMES: LocalFieldNames = {
  invoice: ['Invoice', 'VAT Invoice', 'Tax Invoice'],
  deliveryNote: ['Delivery Docket', 'Delivery Note', 'Docket No.'],
  creditNote: ['Credit Note'],
  taxId: ['VAT No.', 'VAT Reg. No.', 'VAT Number'],
  taxBase: ['Net', 'Goods', 'Net Amount'],
  taxAmount: ['VAT', 'VAT Amount'],
  total: ['Total', 'Invoice Total', 'Total Due', 'Amount Due'],
};

export const EN_MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
] as const;
