import type { ChargeRules, LocalFieldNames, TaxRateHint } from '../types';

export const IT_VERSION = '1.1.0';

export const IT_ALLOWED_TAX_RATES = [4, 5, 10, 22];

/**
 * Ritenuta d'acconto (DPR 600/1973): 20 % for professionals, 23 % for agents (usually on half the fee,
 * which the printed base shows), 4 % on condominium contracts; subtracted from the amount due ("Netto a pagare").
 * Imposta di bollo: 2,00 € on invoices whose amounts without VAT exceed 77,47 €; food invoices carry VAT,
 * so a bollo on them is flagged for a human (it is small, and some lines may be VAT-exempt).
 * Split payment applies only to public administrations, never to a restaurant: still out of scope.
 */
export const IT_CHARGES: ChargeRules = {
  withholding: { name: "ritenuta d'acconto", rates: [4, 20, 23] },
  stampDuty: { name: 'imposta di bollo', amount: 2, dueAboveUntaxed: 77.47 },
};

/** Soft signal only: staples 4 %, meat/fish/cured meats 10 %, alcohol and non-food 22 %. */
export const IT_TAX_RATE_HINTS: TaxRateHint[] = [
  {
    rate: 4,
    keywords: ['pane', 'latte', 'farina', 'pasta', 'frutta', 'verdura', 'ortaggi', 'pomodori', 'pomodoro', 'mozzarella', 'burro',
      'olio extravergine', 'insalata', 'zucchine', 'limoni'],
  },
  { rate: 10, keywords: ['carne', 'manzo', 'vitello', 'maiale', 'pollo', 'pesce', 'salmone', 'prosciutto', 'salame', 'bresaola', 'salumi'] },
  {
    rate: 22,
    keywords: ['vino', 'birra', 'grappa', 'amaro', 'prosecco', 'gin', 'vodka', 'detersivo', 'sgrassatore', 'candeggina', 'tovaglioli',
      'pellicola', 'guanti'],
  },
];

export const IT_FIELD_NAMES: LocalFieldNames = {
  invoice: ['Fattura', 'Fattura n.', 'Fattura immediata', 'Fattura differita'],
  deliveryNote: ['DDT', 'Documento di trasporto', 'D.d.t.', 'Bolla'],
  creditNote: ['Nota di credito', 'Nota credito'],
  taxId: ['P.IVA', 'Partita IVA', 'C.F.', 'Codice fiscale'],
  taxBase: ['Imponibile', 'Totale imponibile'],
  taxAmount: ['Imposta', 'IVA', 'Totale IVA'],
  total: ['Totale documento', 'Totale fattura', 'Netto a pagare'],
};

export const IT_MONTHS = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
] as const;
