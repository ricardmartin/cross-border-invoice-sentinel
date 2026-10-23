import { rateHintValidator } from '../../validation/rateHints';
import { formatLocaleAmount, parseDayFirstDate, parseLocaleAmount } from '../shared/format';
import type { CountryPack } from '../types';
import { PROMPT_CONTEXT } from './prompt-context';
import { PT_ALLOWED_TAX_RATES, PT_FIELD_NAMES, PT_MONTHS, PT_REGIONS, PT_TAX_RATE_HINTS, PT_VERSION } from './rules';
import { atcudValidator, validatePortugueseTaxId } from './validators';

export const ptPack: CountryPack = {
  code: 'PT',
  version: PT_VERSION,
  name: 'Portugal',
  currency: 'EUR',
  locale: 'pt-PT',
  allowedTaxRates: PT_ALLOWED_TAX_RATES,
  validateTaxId: validatePortugueseTaxId,
  parseAmount: (raw) => parseLocaleAmount(raw, { decimal: ',' }),
  parseDate: (raw) => parseDayFirstDate(raw, PT_MONTHS),
  formatAmount: (n) => formatLocaleAmount(n, 'pt-PT'),
  extraValidators: [rateHintValidator, atcudValidator],
  promptContext: PROMPT_CONTEXT,
  deliveryNoteName: 'guia de remessa',
  vatIncludedLabel: 'IVA incluído',
  fieldNames: PT_FIELD_NAMES,
  taxRateHints: PT_TAX_RATE_HINTS,
  regions: PT_REGIONS,
};
