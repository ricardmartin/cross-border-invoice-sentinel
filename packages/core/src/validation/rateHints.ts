import { tokenize } from '../countries/shared/format';
import type { Validator } from '../countries/types';
import { issue } from './issue';

const matches = (tokens: string[], keyword: string): boolean => {
  const kw = tokenize(keyword);
  if (kw.length > 1) return ` ${tokens.join(' ')} `.includes(` ${kw.join(' ')} `);
  return tokens.some((t) => t === kw[0] || t === `${kw[0]}s` || t === `${kw[0]}es`);
};

/**
 * Soft check driven by the regime's taxRateHints (the pack's, or its region's): warns when a line's product
 * family clearly points to one rate and a different (still legal) rate was applied.
 * Warning only — category rules have legal exceptions.
 */
export const rateHintValidator: Validator = (doc, { regime }) => {
  const hints = regime.taxRateHints;
  if (!hints.length) return [];

  return doc.lines.flatMap((line, i) => {
    if (line.taxRate === null) return [];
    const tokens = tokenize(line.description);
    const rates = [...new Set(hints.filter((h) => h.keywords.some((k) => matches(tokens, k))).map((h) => h.rate))];
    if (rates.length !== 1 || rates[0] === line.taxRate) return [];
    return [
      issue(
        'RATE_CATEGORY_SUSPECT',
        'warning',
        `Line ${i + 1} ("${line.description}"): rate ${line.taxRate} % is unusual for this product (normally ${rates[0]} %)`,
        { path: `lines.${i}.taxRate`, lineIndex: i, expected: rates[0]!, found: line.taxRate },
      ),
    ];
  });
};
