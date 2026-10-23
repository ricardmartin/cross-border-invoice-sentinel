'use client';

import type { FinalStatus } from '@sentinel/core';
import type { ReactNode } from 'react';
import { useI18n } from '@/components/i18n';
import { STATUS } from '@/components/status';
import { cn } from '@/lib/utils';

/**
 * Auditor's tickmarks. One fixed legend for the whole app; each mark is a claim the
 * system can back with a number on the same page, never decoration. Labels live in the dictionary.
 */
const TICKS = {
  ok: { glyph: '✓', className: 'text-ok' },
  no: { glyph: '⊗', className: 'text-danger' },
  two: { glyph: '²', className: 'text-info text-[11px] align-[2px]' },
  sum: { glyph: 'Σ', className: 'text-muted-foreground text-[11px]' },
  alb: { glyph: 'A', className: 'text-foreground text-[11px]' },
  doubt: { glyph: '?', className: 'text-info' },
} as const;

export type TickKind = keyof typeof TICKS;

export function Tick({ kind, className }: { kind: TickKind; className?: string }) {
  const { t } = useI18n();
  const label = t.ticks[kind];
  return (
    <span title={label} className={cn('relative inline-block w-3.5 text-center leading-none font-bold', TICKS[kind].className, className)}>
      <span aria-hidden>{TICKS[kind].glyph}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Ticks({ kinds }: { kinds: (TickKind | false | null | undefined)[] }) {
  return <>{kinds.filter((k): k is TickKind => Boolean(k)).map((k) => <Tick key={k} kind={k} />)}</>;
}

export function TickLegend({ kinds, className }: { kinds: TickKind[]; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 rounded-sm border bg-sheet px-2.5 py-1 text-xs text-muted-foreground', className)}>
      <span className="text-[11px] font-bold tracking-[0.06em] text-foreground uppercase">{t.ticks.legend}</span>
      {kinds.map((k) => (
        <span key={k} className="inline-flex items-center gap-1">
          <span aria-hidden className={cn('inline-block w-3.5 text-center font-bold', TICKS[k].className)}>
            {TICKS[k].glyph}
          </span>
          {t.ticks[k]}
        </span>
      ))}
    </div>
  );
}

/** Status as a tickmark plus its words: never colour alone. */
export function StatusMark({ status, className }: { status: FinalStatus; className?: string }) {
  const { t } = useI18n();
  const s = STATUS[status];
  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold whitespace-nowrap', s.text, className)}>
      <Tick kind={s.tick} className="text-inherit" />
      {t.status[status].label}
    </span>
  );
}

/** Section heading of a working paper: small caps label on a hairline, optional note on the right. */
export function SectionHead({ children, note, id }: { children: ReactNode; note?: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-1 flex items-baseline justify-between gap-4 text-[11.5px] font-bold tracking-[0.07em] text-muted-foreground uppercase">
      {children}
      {note && <span className="text-xs font-medium tracking-normal normal-case">{note}</span>}
    </h2>
  );
}
