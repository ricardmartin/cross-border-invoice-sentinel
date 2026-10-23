import { rateHintValidator } from '../../validation/rateHints';
import { EN_MONTHS } from '../ie/rules';
import { formatLocaleAmount, parseDayFirstDate, parseLocaleAmount } from '../shared/format';
import type { CountryPack } from '../types';
import { PROMPT_CONTEXT } from './prompt-context';
import { GB_ALLOWED_TAX_RATES, GB_FIELD_NAMES, GB_TAX_RATE_HINTS, GB_VERSION } from './rules';
import { validateBritishTaxId } from './validators';

export const gbPack: CountryPack = {
  code: 'GB',
  version: GB_VERSION,
  name: 'United Kingdom',
  currency: 'GBP',
  locale: 'en-GB',
  allowedTaxRates: GB_ALLOWED_TAX_RATES,
  validateTaxId: validateBritishTaxId,
  parseAmount: (raw) => parseLocaleAmount(raw, { decimal: '.' }),
  parseDate: (raw) => parseDayFirstDate(raw, EN_MONTHS),
  formatAmount: (n) => formatLocaleAmount(n, 'en-GB'),
  extraValidators: [rateHintValidator],
  promptContext: PROMPT_CONTEXT,
  deliveryNoteName: 'delivery note',
  vatIncludedLabel: 'inc. VAT',
  fieldNames: GB_FIELD_NAMES,
  taxRateHints: GB_TAX_RATE_HINTS,
};
