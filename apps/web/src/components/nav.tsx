'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/i18n';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', key: 'inbox', match: (p: string) => p === '/' || p.startsWith('/documents') },
  { href: '/muestras', key: 'documents', match: (p: string) => p.startsWith('/muestras') },
  { href: '/resultados', key: 'results', match: (p: string) => p.startsWith('/resultados') },
  { href: '/paises', key: 'countries', match: (p: string) => p.startsWith('/paises') },
  { href: '/evals', key: 'evals', match: (p: string) => p.startsWith('/evals') },
  { href: '/guia', key: 'guide', match: (p: string) => p.startsWith('/guia') },
  { href: '/glosario', key: 'glossary', match: (p: string) => p.startsWith('/glosario') },
] as const;

export function MainNav() {
  const path = usePathname();
  const { t } = useI18n();
  return (
    <nav aria-label={t.nav.label} className="-mb-px flex h-full min-w-0 overflow-x-auto">
      {ITEMS.map((i) => {
        const active = i.match(path);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center border-b-2 px-2.5 text-[13px] font-medium whitespace-nowrap sm:px-3.5',
              active ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.nav[i.key]}
          </Link>
        );
      })}
    </nav>
  );
}
