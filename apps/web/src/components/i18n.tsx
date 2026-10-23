'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_LOCALE, DICTS, INTL, LOCALE_COOKIE, LOCALES, type Locale } from '@/lib/i18n/dict';
import { cn } from '@/lib/utils';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Set once in the layout from the server's choice, so client components render the same language. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Dictionary and Intl locale for a client component. */
export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: DICTS[locale], intl: INTL[locale] };
}

/** CA · ES · EN: stores the choice in a cookie and re-renders the server components. */
export function LanguageSwitch() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const choose = (l: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  return (
    <div role="group" aria-label={t.header.language} className="flex shrink-0 items-center gap-0.5">
      {LOCALES.map((l) => (
        <button
          key={l}
          lang={l}
          aria-pressed={l === locale}
          onClick={() => l !== locale && choose(l)}
          className={cn(
            'h-6 rounded-sm px-1.5 font-mono text-[11px] font-semibold uppercase',
            l === locale ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
