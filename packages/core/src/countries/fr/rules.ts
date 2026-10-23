import type { LocalFieldNames, TaxRateHint } from '../types';

export const FR_VERSION = '1.0.0';

/** TVA rates relevant to restaurant suppliers (2,1 % press/medicines is out of scope). */
export const FR_ALLOWED_TAX_RATES = [5.5, 10, 20];

/** Soft signal only: B2B food purchases are 5,5 %, alcohol and non-food 20 %. */
export const FR_TAX_RATE_HINTS: TaxRateHint[] = [
  {
    rate: 5.5,
    keywords: ['pain', 'baguette', 'lait', 'beurre', 'fromage', 'oeuf', 'fruit', 'legume', 'tomate', 'pomme', 'farine', 'boeuf',
      'veau', 'poulet', 'saumon', 'poisson', 'huile', 'creme', 'salade', 'carotte', 'oignon'],
  },
  {
    rate: 20,
    keywords: ['vin', 'biere', 'champagne', 'whisky', 'vodka', 'rhum', 'gin', 'liqueur', 'cognac', 'detergent', 'lessive',
      'javel', 'serviette', 'film', 'gant', 'degraissant'],
  },
];

export const FR_FIELD_NAMES: LocalFieldNames = {
  invoice: ['Facture', 'Facture n°', 'N° de facture'],
  deliveryNote: ['Bon de livraison', 'BL n°', 'Bordereau de livraison'],
  creditNote: ['Avoir', 'Facture d’avoir'],
  taxId: ['SIRET', 'SIREN', 'N° TVA intracommunautaire', 'TVA intracom.'],
  taxBase: ['Total HT', 'Base HT', 'Montant HT'],
  taxAmount: ['TVA', 'Montant TVA'],
  total: ['Total TTC', 'Net à payer', 'Montant TTC'],
};

export const FR_MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;
