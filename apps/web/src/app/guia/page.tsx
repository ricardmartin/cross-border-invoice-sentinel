import type { FinalStatus } from '@sentinel/core';
import { ArrowRight, Calculator, FileText, RefreshCw, ScanText, Truck, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { SectionHead, StatusMark, Tick, TickLegend } from '@/components/audit';
import { buttonVariants } from '@/components/ui/button';
import { getI18n } from '@/lib/i18n/server';
import { loadEvals } from '@/lib/server/evals';

export const dynamic = 'force-dynamic';

/** One icon per step, in the order of `t.guide.steps`. */
const STEP_ICONS = [FileText, ScanText, Calculator, Truck, RefreshCw, UserCheck];
const STATUSES: FinalStatus[] = ['VALID', 'SUPPLIER_DISCREPANCY', 'EXTRACTION_UNCERTAIN', 'INVALID_TAX_ID'];

/** The whole process in plain words, for someone who has never seen an audit or an LLM. */
export default async function GuidePage() {
  const [{ latest }, { t, intl }] = await Promise.all([loadEvals(), getI18n()]);
  const g = t.guide;
  const pct = (key: string) => {
    const v = latest?.summary.headline[key]?.value;
    return v === null || v === undefined ? '—' : `${(v * 100).toLocaleString(intl, { maximumFractionDigits: 1 })} %`;
  };
  const figures = [
    { value: pct('Unfair claims (false positives on clean docs)'), label: g.unfair },
    { value: pct('Final status correct'), label: g.statusOk },
    { value: pct('Documents 100 % correct (final)'), label: g.correct },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{g.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{g.lead}</p>
      </header>

      <ol className="flex flex-col">
        {g.steps.map((step, k) => {
          const Icon = STEP_ICONS[k]!;
          return (
            <li key={step.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4">
              <div className="flex flex-col items-center">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-foreground bg-sheet">
                  <Icon className="size-4" aria-hidden />
                </span>
                {k < g.steps.length - 1 && <span aria-hidden className="w-px flex-1 bg-border" />}
              </div>
              <div className="pb-6">
                <h2 className="pt-1.5 text-[15px] font-bold">
                  <span className="mr-1.5 font-mono text-muted-foreground">{k + 1}.</span>
                  {step.title}
                </h2>
                <p className="mt-1 text-[14px] leading-relaxed">{step.text}</p>
                {step.example && (
                  <p className="mt-2 flex items-start gap-2 rounded-sm border bg-sheet px-3 py-2 text-[13px]">
                    <Tick kind={step.example.tick} className="mt-0.5" />
                    <span>{step.example.text}</span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <section aria-labelledby="finales">
        <SectionHead id="finales">{g.endingsTitle}</SectionHead>
        <div className="grid gap-2 border-t border-rule pt-3 sm:grid-cols-3">
          {g.endings.map((e) => (
            <div key={e.title} className="rounded-sm border bg-sheet px-3 py-2.5">
              <p className="flex items-center gap-1.5 font-bold">
                <Tick kind={e.tick} className="text-[15px]" />
                {e.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{e.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="estados">
        <SectionHead id="estados">{g.statusesTitle}</SectionHead>
        <dl className="grid gap-x-6 border-t border-rule sm:grid-cols-[auto_1fr]">
          {STATUSES.map((s) => (
            <div key={s} className="contents">
              <dt className="border-b border-rule py-2">
                <StatusMark status={s} />
              </dt>
              <dd className="border-b border-rule py-2 text-[13px]">{t.status[s].help}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="marcas">
        <SectionHead id="marcas">{g.marksTitle}</SectionHead>
        <p className="mb-2 text-[13px] text-muted-foreground">{g.marksText}</p>
        <TickLegend kinds={['ok', 'no', 'sum', 'two', 'alb', 'doubt']} />
      </section>

      <section aria-labelledby="confianza">
        <SectionHead id="confianza">{g.trustTitle}</SectionHead>
        <p className="border-t border-rule pt-2 text-[14px] leading-relaxed">{g.trustText}</p>
        {latest ? (
          <>
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-3">
              {figures.map((f) => (
                <div key={f.label}>
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="text-2xl font-bold tracking-tight tabular-nums">{f.value}</dd>
                  <dd className="text-[12.5px] text-muted-foreground">{f.label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              {g.trustRun(latest.runName, latest.summary.docs)}{' '}
              <Link href="/evals" className="font-semibold text-foreground underline">
                {g.allNumbers}
              </Link>
            </p>
          </>
        ) : (
          <p className="mt-2 text-muted-foreground">{g.trustNone}</p>
        )}
      </section>

      <section aria-labelledby="pruebalo" className="border-t pt-5">
        <h2 id="pruebalo" className="text-base font-bold">
          {g.tryTitle}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link href="/#procesar" className={buttonVariants()}>
            {g.tryProcess} <ArrowRight aria-hidden />
          </Link>
          <Link href="/muestras" className={buttonVariants({ variant: 'outline' })}>
            {g.tryBrowse}
          </Link>
        </div>
      </section>
    </div>
  );
}
