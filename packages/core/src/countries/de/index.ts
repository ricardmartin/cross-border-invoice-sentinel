import { rateHintValidator } from '../../validation/rateHints';
import { formatLocaleAmount, parseDayFirstDate, parseLocaleAmount } from '../shared/format';
import type { CountryPack } from '../types';
import { PROMPT_CONTEXT } from './prompt-context';
import { DE_ALLOWED_TAX_RATES, DE_FIELD_NAMES, DE_MONTHS, DE_TAX_RATE_HINTS, DE_VERSION } from './rules';
import { validateGermanTaxId } from './validators';

export const dePack: CountryPack = {
  code: 'DE',
  version: DE_VERSION,
  name: 'Deutschland',
  currency: 'EUR',
  locale: 'de-DE',
  allowedTaxRates: DE_ALLOWED_TAX_RATES,
  validateTaxId: validateGermanTaxId,
  parseAmount: (raw) => parseLocaleAmount(raw, { decimal: ',' }),
  parseDate: (raw) => parseDayFirstDate(raw, DE_MONTHS),
  formatAmount: (n) => formatLocaleAmount(n, 'de-DE'),
  extraValidators: [rateHintValidator],
  promptContext: PROMPT_CONTEXT,
  deliveryNoteName: 'Lieferschein',
  vatIncludedLabel: 'inkl. MwSt.',
  fieldNames: DE_FIELD_NAMES,
  taxRateHints: DE_TAX_RATE_HINTS,
};
