import { FormatError } from '../types';

/**
 * Locale-aware number/date parsing shared by country packs. Packs only pass
 * their preferences (decimal separator, month names); the tolerant-but-strict
 * logic lives here once.
 */

const CURRENCY_TOKENS = /€|EUR|£|GBP|\$|USD|CHF|DKK|kr\.?/gi;

/**
 * Parses a printed amount. Accepts the pack's native format plus unambiguous
 * foreign variants, e.g. for decimal=',': "1.234,56", "1 234,56", "1234,56",
 * "1234.56", "1,234.56", "-3,00", "3,00-" (ERP credit notes), "(3,00)".
 * A single grouping separator followed by exactly 3 digits is read as thousands
 * ("1.234" → 1234 when decimal=','). Throws FormatError on anything else.
 */
export function parseLocaleAmount(raw: string, opts: { decimal: ',' | '.' }): number {
  let s = raw.replace(/[\s  ']/g, '').replace(CURRENCY_TOKENS, '');
  let negative = false;

  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (s.startsWith('-')) {
    negative = true;
    s = s.slice(1);
  } else if (s.endsWith('-')) {
    negative = true;
    s = s.slice(0, -1);
  } else if (s.startsWith('+')) {
    s = s.slice(1);
  }

  if (!/^\d[\d.,]*$/.test(s) || /[.,]$/.test(s)) throw new FormatError(`Not an amount: "${raw}"`, raw);

  const group = opts.decimal === ',' ? '.' : ',';
  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  let normalized: string;

  if (lastDot >= 0 && lastComma >= 0) {
    // Both present: whichever comes last is the decimal separator.
    const dec = lastDot > lastComma ? '.' : ',';
    const grp = dec === '.' ? ',' : '.';
    const intPart = s.slice(0, s.lastIndexOf(dec));
    const frac = s.slice(s.lastIndexOf(dec) + 1);
    const groupRe = new RegExp(`^\\d{1,3}(\\${grp}\\d{3})*$`);
    if (!groupRe.test(intPart) || !/^\d+$/.test(frac)) throw new FormatError(`Malformed grouping in "${raw}"`, raw);
    normalized = `${intPart.split(grp).join('')}.${frac}`;
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? '.' : ',';
    const parts = s.split(sep);
    if (parts.length > 2) {
      const groupRe = new RegExp(`^\\d{1,3}(\\${sep}\\d{3})+$`);
      if (!groupRe.test(s)) throw new FormatError(`Malformed grouping in "${raw}"`, raw);
      normalized = parts.join('');
    } else {
      const frac = parts[1]!;
      const isThousands = sep === group && frac.length === 3;
      normalized = isThousands ? parts.join('') : `${parts[0]}.${frac}`;
    }
  } else {
    normalized = s;
  }

  const n = Number(normalized);
  if (!Number.isFinite(n)) throw new FormatError(`Not an amount: "${raw}"`, raw);
  return negative ? -n : n;
}

export function formatLocaleAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }).format(amount);
}

/** Also folds the letters NFD does not decompose (Danish æ/ø, German ß), so keywords match plain ASCII tokens. */
const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/ß/g, 'ss');

const toIso = (y: number, m: number, d: number): string | null => {
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

const fullYear = (y: string) => (y.length === 2 ? 2000 + Number(y) : Number(y));

/**
 * Parses day-first dates: ISO "2026-10-03", "03/10/2026", "3-10-26", "03.10.2026",
 * and textual ones ("3 de octubre de 2026", "03-oct-2026", "3rd October 2026", "3. Oktober 2026")
 * using the pack's month names.
 * Returns ISO YYYY-MM-DD or null if it is not a real calendar date.
 */
export function parseDayFirstDate(raw: string, monthNames: readonly string[]): string | null {
  const s = stripAccents(raw.trim().toLowerCase());

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (iso) return toIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numeric = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2}|\d{4})$/.exec(s);
  if (numeric) return toIso(fullYear(numeric[3]!), Number(numeric[2]), Number(numeric[1]));

  const textual = /^(\d{1,2})(?:er|st|nd|rd|th)?[\s.\-/]*(?:de\s+)?([a-z]+)\.?[\s.\-/]*(?:de\s+|del\s+)?(\d{2}|\d{4})$/.exec(s);
  if (textual) {
    const token = textual[2]!;
    const names = monthNames.map(stripAccents);
    const month = names.findIndex((m) => m === token || (token.length >= 3 && m.startsWith(token)));
    if (month >= 0) return toIso(fullYear(textual[3]!), month + 1, Number(textual[1]));
  }
  return null;
}

/** Lower-case, accent-free word tokens, used for keyword hints. */
export const tokenize = (text: string): string[] => stripAccents(text.toLowerCase()).split(/[^a-z0-9]+/).filter(Boolean);
