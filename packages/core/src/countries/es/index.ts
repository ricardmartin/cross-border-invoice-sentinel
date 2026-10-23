import { rateHintValidator } from '../../validation/rateHints';
import type { CountryPack } from '../types';
import { PROMPT_CONTEXT } from './prompt-context';
import { ES_LOCALE, formatSpanishAmount, parseSpanishAmount, parseSpanishDate } from './format';
import { ES_ALLOWED_TAX_RATES, ES_CHARGES, ES_FIELD_NAMES, ES_REGIONS, ES_TAX_RATE_HINTS, ES_VERSION } from './rules';
import { validateSpanishTaxId } from './validators';

export const esPack: CountryPack = {
  code: 'ES',
  version: ES_VERSION,
  name: 'España',
  currency: 'EUR',
  locale: ES_LOCALE,
  allowedTaxRates: ES_ALLOWED_TAX_RATES,
  validateTaxId: validateSpanishTaxId,
  parseAmount: parseSpanishAmount,
  parseDate: parseSpanishDate,
  formatAmount: formatSpanishAmount,
  extraValidators: [rateHintValidator],
  promptContext: PROMPT_CONTEXT,
  deliveryNoteName: 'albarán',
  vatIncludedLabel: 'IVA incluido',
  fieldNames: ES_FIELD_NAMES,
  taxRateHints: ES_TAX_RATE_HINTS,
  regions: ES_REGIONS,
  charges: ES_CHARGES,
};
