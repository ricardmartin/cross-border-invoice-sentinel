import type { ChargeRules, LocalFieldNames, TaxRateHint, TaxRegion } from '../types';

export const ES_VERSION = '1.2.0';

/** IVA rates relevant to restaurant suppliers (Península y Baleares). */
export const ES_ALLOWED_TAX_RATES = [4, 10, 21];

/**
 * Canarias has no IVA: it uses IGIC (0 / 3 / 7 general / 9,5 / 15 / 20 %), found by the
 * delivery postal code (35xxx Las Palmas, 38xxx Santa Cruz de Tenerife).
 * Ceuta (51xxx) and Melilla (52xxx) have no IVA either: they use IPSI, whose rates (0,5–10 %) each city sets
 * every year by ordinance and per activity. The list below is that whole range, not a per-product table: it
 * keeps IVA rates (21 %) out without blaming a supplier for an ordinance rate we do not model. Verify against
 * the current BOCCE / BOME before relying on it.
 */
const IPSI_RATES = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 10];

export const ES_REGIONS: TaxRegion[] = [
  {
    id: 'CANARIAS',
    name: 'Canarias, IGIC',
    postalCode: /\b3[58]\d{3}\b/,
    allowedTaxRates: [0, 3, 7, 9.5, 15, 20],
    taxRateHints: [
      { rate: 0, keywords: ['pan', 'leche', 'huevo', 'fruta', 'verdura', 'hortaliza', 'tomate', 'patata', 'papa', 'lechuga', 'cebolla', 'platano'] },
      { rate: 15, keywords: ['ron', 'ginebra', 'whisky', 'vodka', 'licor'] },
    ],
    vatIncludedLabel: 'IGIC incluido',
  },
  { id: 'CEUTA', name: 'Ceuta, IPSI', postalCode: /\b51\d{3}\b/, allowedTaxRates: IPSI_RATES, vatIncludedLabel: 'IPSI incluido' },
  { id: 'MELILLA', name: 'Melilla, IPSI', postalCode: /\b52\d{3}\b/, allowedTaxRates: IPSI_RATES, vatIncludedLabel: 'IPSI incluido' },
];

/**
 * Recargo de equivalencia (LIVA art. 161): added on top of IVA for retailers under that regime, one rate per
 * IVA rate. A restaurant transforms what it buys, so it is normally not in the regime: the surcharge is checked
 * like any other amount, and flagged for a human. Retención IRPF: professionals 15 % (7 % the first years),
 * rentals 19 %, farmers and stockbreeders in módulos 2 % (1 % pig and poultry), other módulos businesses 1 %.
 */
export const ES_CHARGES: ChargeRules = {
  surcharge: {
    name: 'recargo de equivalencia',
    rateByTaxRate: { 21: 5.2, 10: 1.4, 5: 0.62, 4: 0.5 },
    notice: 'a restaurant is normally not under the recargo de equivalencia regime (retail without transformation); check with the supplier',
  },
  withholding: { name: 'retención IRPF', rates: [1, 2, 7, 15, 19] },
};

/**
 * Typical rate per product family. Used only as a soft (warning) signal: the
 * legal mapping has exceptions, so this never decides a discrepancy on its own.
 */
export const ES_TAX_RATE_HINTS: TaxRateHint[] = [
  {
    rate: 4,
    keywords: ['pan', 'barra', 'baguette', 'leche', 'huevo', 'fruta', 'verdura', 'hortaliza', 'legumbre', 'harina', 'queso',
      'tomate', 'patata', 'lechuga', 'cebolla', 'naranja', 'manzana', 'platano', 'limon', 'zanahoria', 'pimiento'],
  },
  {
    rate: 10,
    keywords: ['carne', 'ternera', 'cerdo', 'pollo', 'cordero', 'pescado', 'merluza', 'salmon', 'atun', 'gamba', 'marisco',
      'embutido', 'jamon', 'agua', 'cafe'],
  },
  {
    rate: 21,
    keywords: ['vino', 'cerveza', 'ron', 'ginebra', 'whisky', 'vodka', 'licor', 'cava', 'vermut', 'refresco', 'tonica',
      'detergente', 'lejia', 'lavavajillas', 'desengrasante', 'servilleta', 'menaje', 'film', 'bolsa', 'guante'],
  },
];

export const ES_FIELD_NAMES: LocalFieldNames = {
  invoice: ['Factura', 'Nº factura', 'Número de factura', 'Factura simplificada'],
  deliveryNote: ['Albarán', 'Nº albarán', 'Nota de entrega'],
  creditNote: ['Abono', 'Factura rectificativa', 'Nota de abono'],
  taxId: ['CIF', 'NIF', 'NIE', 'N.I.F.', 'C.I.F.'],
  taxBase: ['Base imponible', 'Base', 'B. imponible'],
  taxAmount: ['Cuota IVA', 'Cuota', 'Importe IVA', 'IVA'],
  total: ['Total factura', 'Total', 'Total a pagar', 'Importe total'],
};

export const ES_MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;
