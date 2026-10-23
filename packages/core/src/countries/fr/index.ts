import { rateHintValidator } from '../../validation/rateHints';
import { formatLocaleAmount, parseDayFirstDate, parseLocaleAmount } from '../shared/format';
import type { CountryPack } from '../types';
import { PROMPT_CONTEXT } from './prompt-context';
import { FR_ALLOWED_TAX_RATES, FR_FIELD_NAMES, FR_MONTHS, FR_TAX_RATE_HINTS, FR_VERSION } from './rules';
import { validateFrenchTaxId } from './validators';

export const frPack: CountryPack = {
  code: 'FR',
  version: FR_VERSION,
  name: 'France',
  currency: 'EUR',
  locale: 'fr-FR',
  allowedTaxRates: FR_ALLOWED_TAX_RATES,
  validateTaxId: validateFrenchTaxId,
  parseAmount: (raw) => parseLocaleAmount(raw, { decimal: ',' }),
  parseDate: (raw) => parseDayFirstDate(raw, FR_MONTHS),
  formatAmount: (n) => formatLocaleAmount(n, 'fr-FR'),
  extraValidators: [rateHintValidator],
  promptContext: PROMPT_CONTEXT,
  deliveryNoteName: 'bon de livraison',
  vatIncludedLabel: 'TTC',
  fieldNames: FR_FIELD_NAMES,
  taxRateHints: FR_TAX_RATE_HINTS,
};
