import { rateHintValidator } from '../../validation/rateHints';
import { formatLocaleAmount, parseDayFirstDate, parseLocaleAmount } from '../shared/format';
import type { CountryPack } from '../types';
import { PROMPT_CONTEXT } from './prompt-context';
import { IT_ALLOWED_TAX_RATES, IT_CHARGES, IT_FIELD_NAMES, IT_MONTHS, IT_TAX_RATE_HINTS, IT_VERSION } from './rules';
import { validateItalianTaxId } from './validators';

export const itPack: CountryPack = {
  code: 'IT',
  version: IT_VERSION,
  name: 'Italia',
  currency: 'EUR',
  locale: 'it-IT',
  allowedTaxRates: IT_ALLOWED_TAX_RATES,
  validateTaxId: validateItalianTaxId,
  parseAmount: (raw) => parseLocaleAmount(raw, { decimal: ',' }),
  parseDate: (raw) => parseDayFirstDate(raw, IT_MONTHS),
  formatAmount: (n) => formatLocaleAmount(n, 'it-IT'),
  extraValidators: [rateHintValidator],
  promptContext: PROMPT_CONTEXT,
  deliveryNoteName: 'DDT',
  vatIncludedLabel: 'IVA inclusa',
  fieldNames: IT_FIELD_NAMES,
  taxRateHints: IT_TAX_RATE_HINTS,
  charges: IT_CHARGES,
};
