import { formatLocaleAmount, parseDayFirstDate, parseLocaleAmount } from '../shared/format';
import type { CountryPack } from '../types';
import { PROMPT_CONTEXT } from './prompt-context';
import { DK_ALLOWED_TAX_RATES, DK_FIELD_NAMES, DK_MONTHS, DK_VERSION } from './rules';
import { validateDanishTaxId } from './validators';

/** Single VAT rate, so no rate hints: any line not at 25 % is already RATE_NOT_ALLOWED. */
export const dkPack: CountryPack = {
  code: 'DK',
  version: DK_VERSION,
  name: 'Danmark',
  currency: 'DKK',
  locale: 'da-DK',
  allowedTaxRates: DK_ALLOWED_TAX_RATES,
  validateTaxId: validateDanishTaxId,
  parseAmount: (raw) => parseLocaleAmount(raw, { decimal: ',' }),
  parseDate: (raw) => parseDayFirstDate(raw, DK_MONTHS),
  formatAmount: (n) => formatLocaleAmount(n, 'da-DK'),
  promptContext: PROMPT_CONTEXT,
  deliveryNoteName: 'følgeseddel',
  vatIncludedLabel: 'inkl. moms',
  fieldNames: DK_FIELD_NAMES,
};
