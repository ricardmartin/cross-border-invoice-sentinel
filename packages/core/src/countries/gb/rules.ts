import type { LocalFieldNames, TaxRateHint } from '../types';

export const GB_VERSION = '1.0.0';

/** UK VAT: most food is zero-rated, 5 % reduced (rare for restaurant supplies), 20 % standard. */
export const GB_ALLOWED_TAX_RATES = [0, 5, 20];

/** Soft signal only: basic food 0 %, alcohol, soft drinks, confectionery and non-food 20 %. */
export const GB_TAX_RATE_HINTS: TaxRateHint[] = [
  {
    rate: 0,
    keywords: ['bread', 'milk', 'eggs', 'butter', 'cheese', 'flour', 'potatoes', 'carrots', 'onions', 'tomatoes', 'lettuce', 'apples',
      'beef', 'lamb', 'pork', 'chicken', 'salmon', 'cod', 'haddock', 'bacon', 'sausages'],
  },
  {
    rate: 20,
    keywords: ['wine', 'beer', 'ale', 'lager', 'cider', 'whisky', 'gin', 'vodka', 'cola', 'lemonade', 'crisps', 'chocolate',
      'detergent', 'bleach', 'degreaser', 'napkins', 'cling film', 'gloves'],
  },
];

export const GB_FIELD_NAMES: LocalFieldNames = {
  invoice: ['Invoice', 'VAT Invoice', 'Tax Invoice'],
  deliveryNote: ['Delivery Note', 'Despatch Note', 'Delivery Note No.'],
  creditNote: ['Credit Note'],
  taxId: ['VAT Reg No.', 'VAT No.', 'VAT Registration Number'],
  taxBase: ['Net', 'Goods', 'Net Amount'],
  taxAmount: ['VAT', 'VAT Amount'],
  total: ['Total', 'Invoice Total', 'Total Due', 'Amount Due'],
};
