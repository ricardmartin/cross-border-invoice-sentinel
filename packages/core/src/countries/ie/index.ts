import { rateHintValidator } from '../../validation/rateHints';
import { formatLocaleAmount, parseDayFirstDate, parseLocaleAmount } from '../shared/format';
import type { CountryPack } from '../types';
import { PROMPT_CONTEXT } from './prompt-context';
import { EN_MONTHS, IE_ALLOWED_TAX_RATES, IE_FIELD_NAMES, IE_TAX_RATE_HINTS, IE_VERSION } from './rules';
import { validateIrishTaxId } from './validators';

export const iePack: CountryPack = {
  code: 'IE',
  version: IE_VERSION,
  name: 'Ireland',
  currency: 'EUR',
  locale: 'en-IE',
  allowedTaxRates: IE_ALLOWED_TAX_RATES,
  validateTaxId: validateIrishTaxId,
  parseAmount: (raw) => parseLocaleAmount(raw, { decimal: '.' }),
  parseDate: (raw) => parseDayFirstDate(raw, EN_MONTHS),
  formatAmount: (n) => formatLocaleAmount(n, 'en-IE'),
  extraValidators: [rateHintValidator],
  promptContext: PROMPT_CONTEXT,
  deliveryNoteName: 'delivery docket',
  vatIncludedLabel: 'incl. VAT',
  fieldNames: IE_FIELD_NAMES,
  taxRateHints: IE_TAX_RATE_HINTS,
};
