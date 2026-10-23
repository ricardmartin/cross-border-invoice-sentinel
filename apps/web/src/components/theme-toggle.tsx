'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/components/i18n';
import { THEME_COOKIE, THEMES, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const ICON = { system: Monitor, light: Sun, dark: Moon } as const;

/**
 * System · light · dark as one segmented control with a sliding thumb. The choice is applied on the
 * spot (data-theme on <html>) and kept in a cookie so the server renders it without a flash.
 */
export function ThemeToggle({ initial }: { initial: Theme }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>(initial);

  const choose = (next: Theme) => {
    setTheme(next);
    if (next === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <div role="group" aria-label={t.header.theme} className="relative flex shrink-0 rounded-full border bg-background p-0.5">
      <span
        aria-hidden
        className="absolute top-0.5 left-0.5 size-6 rounded-full border bg-sheet shadow-[0_1px_2px_rgb(0_0_0/0.12)] transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${THEMES.indexOf(theme) * 100}%)` }}
      />
      {THEMES.map((th) => {
        const Icon = ICON[th];
        const active = th === theme;
        return (
          <button
            key={th}
            type="button"
            aria-pressed={active}
            aria-label={t.header.themes[th]}
            title={t.header.themes[th]}
            onClick={() => choose(th)}
            className={cn('relative grid size-6 place-items-center rounded-full transition-colors', active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            <Icon className={cn('size-3.5 transition-transform duration-200 motion-reduce:transition-none', active && th !== 'system' && 'rotate-[-15deg] scale-110')} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
