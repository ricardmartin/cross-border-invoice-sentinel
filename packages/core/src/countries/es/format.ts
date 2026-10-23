import { formatLocaleAmount, parseDayFirstDate, parseLocaleAmount } from '../shared/format';
import { ES_MONTHS } from './rules';

export const ES_LOCALE = 'es-ES';

/** "1.234,56 €", "1234,56", "12,50-" … → number. Throws FormatError otherwise. */
export const parseSpanishAmount = (raw: string): number => parseLocaleAmount(raw, { decimal: ',' });

/** "03/10/2026", "3-10-26", "3 de octubre de 2026" … → "2026-10-03" | null. */
export const parseSpanishDate = (raw: string): string | null => parseDayFirstDate(raw, ES_MONTHS);

export const formatSpanishAmount = (amount: number): string => formatLocaleAmount(amount, ES_LOCALE);
