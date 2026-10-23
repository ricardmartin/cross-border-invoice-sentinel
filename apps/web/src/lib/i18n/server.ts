import 'server-only';
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, DICTS, INTL, isLocale, LOCALE_COOKIE, LOCALES, type Locale } from './dict';

/** The chosen language (cookie), else the browser's first supported one, else Spanish. */
export async function getLocale(): Promise<Locale> {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  const accepted = ((await headers()).get('accept-language') ?? '').split(',').map((part) => part.split(';')[0]!.trim().slice(0, 2).toLowerCase());
  return accepted.find((l): l is Locale => (LOCALES as readonly string[]).includes(l)) ?? DEFAULT_LOCALE;
}

/** Dictionary and Intl locale for a server component. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: DICTS[locale], intl: INTL[locale] };
}
