import type { LocalFieldNames, TaxRateHint } from '../types';

export const DE_VERSION = '1.0.0';

export const DE_ALLOWED_TAX_RATES = [7, 19];

/** Soft signal only: food 7 %, drinks (milk aside), alcohol and non-food 19 %. */
export const DE_TAX_RATE_HINTS: TaxRateHint[] = [
  {
    rate: 7,
    keywords: ['brot', 'brötchen', 'milch', 'butter', 'käse', 'eier', 'mehl', 'kartoffeln', 'tomaten', 'zwiebeln', 'salat', 'äpfel',
      'rindfleisch', 'schweinefleisch', 'hähnchen', 'wurst', 'bratwurst', 'schinken', 'lachs', 'forelle', 'spargel'],
  },
  {
    rate: 19,
    keywords: ['wein', 'bier', 'pils', 'weizenbier', 'sekt', 'schnaps', 'korn', 'mineralwasser', 'apfelschorle', 'cola', 'saft',
      'spülmittel', 'reiniger', 'servietten', 'frischhaltefolie', 'handschuhe'],
  },
];

export const DE_FIELD_NAMES: LocalFieldNames = {
  invoice: ['Rechnung', 'Rechnungsnummer', 'Rechnungs-Nr.'],
  deliveryNote: ['Lieferschein', 'Lieferschein-Nr.'],
  creditNote: ['Gutschrift', 'Rechnungskorrektur', 'Stornorechnung'],
  taxId: ['USt-IdNr.', 'USt-ID', 'Steuernummer', 'St.-Nr.'],
  taxBase: ['Netto', 'Nettobetrag', 'Warenwert netto'],
  taxAmount: ['MwSt.', 'USt.', 'Mehrwertsteuer'],
  total: ['Gesamtbetrag', 'Brutto', 'Rechnungsbetrag', 'Zu zahlen'],
};

export const DE_MONTHS = [
  'januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember',
] as const;
