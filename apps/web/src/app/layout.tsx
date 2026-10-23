import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Public_Sans } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { GLOSSARY_COOKIE, GlossaryLayer, GlossaryProvider, GlossaryToggle } from '@/components/glossary';
import { I18nProvider, LanguageSwitch } from '@/components/i18n';
import { MainNav } from '@/components/nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { getI18n } from '@/lib/i18n/server';
import { isTheme, THEME_COOKIE } from '@/lib/theme';
import './globals.css';

const sans = Public_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-public-sans' });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: 'Invoice Sentinel', description: t.meta.description };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, t } = await getI18n();
  const jar = await cookies();
  const saved = jar.get(THEME_COOKIE)?.value;
  const theme = isTheme(saved) ? saved : 'system';
  const glossaryOn = jar.get(GLOSSARY_COOKIE)?.value !== 'off';
  return (
    <html lang={locale} data-theme={theme === 'system' ? undefined : theme} className={sans.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <I18nProvider locale={locale}>
          <GlossaryProvider initial={glossaryOn}>
            <header className="sticky top-0 z-20 border-b bg-sheet">
              <div className="flex h-12 items-center gap-3 px-4 sm:gap-6 sm:px-6">
                <Link href="/" aria-label="Invoice Sentinel" className="flex items-center gap-2 text-sm font-bold tracking-tight whitespace-nowrap">
                  <span aria-hidden className="grid size-[18px] place-items-center rounded-sm border-[1.5px] border-foreground text-[11px] text-ok">
                    ✓
                  </span>
                  <span className="hidden sm:inline">Invoice Sentinel</span>
                </Link>
                <MainNav />
                <div className="ml-auto flex items-center gap-3">
                  <GlossaryToggle />
                  <ThemeToggle initial={theme} />
                  <LanguageSwitch />
                  <Link href="/#procesar" className={buttonVariants()}>
                    <Plus aria-hidden /> {t.header.process}
                    <span className="hidden sm:inline">{t.header.processSuffix}</span>
                  </Link>
                </div>
              </div>
            </header>
            <main>{children}</main>
            <GlossaryLayer />
          </GlossaryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
