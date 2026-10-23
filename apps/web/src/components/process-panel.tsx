'use client';

import { Check, ChevronRight, Loader2, Truck, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { SectionHead } from '@/components/audit';
import { useI18n } from '@/components/i18n';
import { Button } from '@/components/ui/button';
import { DEMO, REPO_URL } from '@/lib/demo';
import { cn } from '@/lib/utils';
import type { Sample } from '@/lib/server/data';

type Job = { key: string; label: string; init: RequestInit; upload: boolean; status: 'queued' | 'running' | 'done' | 'failed'; id?: string; error?: string };

// Samples bring their own delivery notes, so they can run side by side. Uploads run
// one at a time in the chosen order: a delivery note must be stored before its invoice.
const SAMPLE_CONCURRENCY = 3;

export function ProcessPanel({ samples, llmReady }: { samples: Sample[]; llmReady: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const pt = t.process;
  const countries = useMemo(() => [...new Set(samples.map((s) => s.country))], [samples]);
  const [country, setCountry] = useState(countries.includes('ES') ? 'ES' : (countries[0] ?? 'ES'));
  const [showPlanted, setShowPlanted] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [jobs, setJobs] = useState<Job[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const batchRunning = jobs.some((j) => j.status === 'queued' || j.status === 'running');

  useEffect(() => {
    if (!busy && !batchRunning) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [busy, batchRunning]);

  // Delivery notes are processed implicitly with their invoice; list invoices and credit notes.
  const list = samples.filter((s) => s.country === country && s.docType !== 'DELIVERY_NOTE');
  const notesFor = new Map(samples.filter((s) => s.deliveryNoteFor).map((s) => [s.deliveryNoteFor!, s.id]));
  const disabled = !!busy || batchRunning || !llmReady;

  async function post(init: RequestInit): Promise<string> {
    const res = await fetch('/api/process', { method: 'POST', ...init });
    const json = (await res.json()) as { id?: string; error?: string };
    if (!res.ok || !json.id) throw new Error(json.error ?? t.common.serverError(res.status));
    return json.id;
  }

  async function submit(label: string, init: RequestInit) {
    setBusy(label);
    setError(null);
    setJobs([]);
    try {
      router.push(`/documents/${await post(init)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(null);
    }
  }

  /** Processes several documents, keeping the panel open with one row per document. */
  async function runBatch(batch: Job[], concurrency: number) {
    setError(null);
    setJobs(batch);
    const update = (key: string, patch: Partial<Job>) => setJobs((js) => js.map((j) => (j.key === key ? { ...j, ...patch } : j)));
    let next = 0;
    const worker = async () => {
      while (next < batch.length) {
        const job = batch[next++]!;
        update(job.key, { status: 'running' });
        try {
          update(job.key, { status: 'done', id: await post(job.init) });
        } catch (e) {
          update(job.key, { status: 'failed', error: e instanceof Error ? e.message : String(e) });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, batch.length) }, worker));
    router.refresh();
  }

  const sampleJob = (s: Sample): Job => ({
    key: s.id,
    label: `${s.supplier} (${s.id})`,
    init: { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sampleId: s.id }) },
    upload: false,
    status: 'queued',
  });
  const fileJob = (file: File, i: number): Job => {
    const form = new FormData();
    form.append('file', file);
    return { key: `${i}:${file.name}`, label: file.name, init: { body: form }, upload: true, status: 'queued' };
  };

  const processSample = (s: Sample) => {
    const job = sampleJob(s);
    return submit(job.label, job.init);
  };
  const processSelected = () => {
    const batch = samples.filter((s) => selected.has(s.id)).map(sampleJob);
    setSelected(new Set());
    if (batch.length === 1) return submit(batch[0]!.label, batch[0]!.init);
    return runBatch(batch, SAMPLE_CONCURRENCY);
  };
  const processFiles = (files: File[]) => {
    const batch = files.map(fileJob);
    if (batch.length === 1) return submit(batch[0]!.label, batch[0]!.init);
    if (batch.length > 1) return runBatch(batch, 1);
  };
  const toggle = (id: string) =>
    setSelected((sel) => {
      const next = new Set(sel);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const allSelected = list.length > 0 && list.every((s) => selected.has(s.id));
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) void processFiles([...e.dataTransfer.files]);
  };

  return (
    <aside id="procesar" aria-labelledby="procesar-h" className="flex scroll-mt-16 flex-col gap-4 self-start lg:sticky lg:top-16">
      <h2 id="procesar-h" className="text-base font-bold tracking-tight">
        {pt.title}
      </h2>

      {DEMO ? (
        <p className="rounded-sm border border-info/50 bg-sheet px-2.5 py-2 text-xs text-foreground">
          {pt.demo(
            <a href={REPO_URL} className="underline underline-offset-2">
              GitHub
            </a>,
          )}
        </p>
      ) : (
        !llmReady && (
          <p className="rounded-sm border border-danger/50 bg-danger-soft px-2.5 py-2 text-xs text-foreground">
            {pt.missingKey(<code className="font-mono">ANTHROPIC_API_KEY</code>, <code className="font-mono">.env</code>)}
          </p>
        )
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn('flex items-center justify-between gap-3 rounded-sm border border-dashed border-foreground/40 px-3 py-3', dragging && 'border-info bg-info/5')}
      >
        <span className="text-xs text-muted-foreground">{pt.drop}</span>
        <Button variant="outline" size="sm" disabled={disabled} onClick={() => fileInput.current?.click()}>
          <Upload aria-hidden /> {pt.upload}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = '';
            void processFiles(files);
          }}
        />
      </div>

      <div aria-live="polite">
        {busy && (
          <div className="border-y py-3">
            <p className="flex items-center gap-2 font-semibold">
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> {pt.processing(busy)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{pt.elapsed(elapsed)}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              {pt.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {jobs.length > 0 && (
          <div className="border-y py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-semibold">
                {batchRunning && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
                {pt.batch(jobs.filter((j) => j.status === 'done' || j.status === 'failed').length, jobs.length)}
              </p>
              {!batchRunning && (
                <Button variant="ghost" size="sm" onClick={() => setJobs([])} aria-label={pt.dismiss} title={pt.dismiss}>
                  <X aria-hidden />
                </Button>
              )}
            </div>
            {batchRunning && <p className="mt-0.5 font-mono text-xs text-muted-foreground">{elapsed} s</p>}
            {jobs[0]!.upload && <p className="mt-0.5 text-xs text-muted-foreground">{pt.batchUploads}</p>}
            <ul className="mt-2 space-y-1 text-xs">
              {jobs.map((j) => (
                <li key={j.key} className="flex items-start gap-2">
                  <span className="mt-px shrink-0">
                    {j.status === 'running' ? (
                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
                    ) : j.status === 'done' ? (
                      <Check className="size-3.5 text-ok" aria-hidden />
                    ) : j.status === 'failed' ? (
                      <X className="size-3.5 text-danger" aria-hidden />
                    ) : (
                      <span className="block size-3.5 text-center text-faint">·</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{j.label}</span>
                    {j.status === 'queued' && <span className="block text-faint">{pt.queued}</span>}
                    {j.status === 'failed' && <span className="block text-danger">{j.error}</span>}
                  </span>
                  {j.id && (
                    <Link href={`/documents/${j.id}`} className="shrink-0 font-semibold underline-offset-2 hover:underline">
                      {pt.open}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-sm border border-danger/50 bg-danger-soft px-2.5 py-2 text-xs">
            <span className="font-semibold text-danger">{pt.failed}</span> {error}
          </p>
        )}
      </div>

      <section aria-labelledby="muestras">
        <SectionHead id="muestras" note={t.common.docs(list.length)}>
          {pt.samples}
        </SectionHead>
        <div role="group" aria-label={t.common.country} className="mb-2 flex flex-wrap gap-1">
          {countries.map((c) => (
            <button
              key={c}
              aria-pressed={c === country}
              onClick={() => setCountry(c)}
              className={cn(
                'h-6 rounded-sm border px-2 font-mono text-[11px] font-semibold',
                c === country ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={allSelected}
              disabled={disabled || list.length === 0}
              onChange={() =>
                setSelected((sel) => {
                  const next = new Set(sel);
                  for (const s of list) {
                    if (allSelected) next.delete(s.id);
                    else next.add(s.id);
                  }
                  return next;
                })
              }
              className="accent-[var(--foreground)]"
            />
            {allSelected ? pt.clearSelection : pt.selectAll}
          </label>
          <Button size="sm" disabled={disabled || selected.size === 0} onClick={() => void processSelected()}>
            {pt.processSelected(selected.size)}
          </Button>
        </div>
        <ul className="max-h-[min(52vh,480px)] overflow-y-auto border-y">
          {list.map((s) => (
            <li key={s.id} className="flex items-start border-b border-rule last:border-0">
              <label className="flex shrink-0 cursor-pointer items-center self-stretch px-1.5 hover:bg-hover">
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  disabled={disabled}
                  onChange={() => toggle(s.id)}
                  aria-label={pt.select(`${s.supplier} (${s.id})`)}
                  className="accent-[var(--foreground)]"
                />
              </label>
              <button disabled={disabled} onClick={() => void processSample(s)} className="group flex min-w-0 flex-1 items-start gap-2 px-1 py-2 text-left hover:bg-hover disabled:opacity-60">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{s.supplier}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t.docType[s.docType]} {s.documentNumber} · <span className="font-mono">{s.id}</span>
                    {notesFor.has(s.id) && (
                      <span title={pt.noteTitle(notesFor.get(s.id)!)}>
                        {' · '}
                        <Truck className="inline size-3 align-[-2px]" aria-hidden /> {pt.withNote}
                      </span>
                    )}
                  </span>
                  {showPlanted && (
                    <span className={cn('block text-xs', s.planted ? 'text-danger' : 'text-faint')}>
                      {s.planted ? pt.planted(t.planted[s.planted] ?? s.planted) : pt.notPlanted} · {s.template} · {s.mode}
                    </span>
                  )}
                </span>
                <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-faint group-hover:text-foreground" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <details className="group border-b pb-2 text-xs text-muted-foreground">
        <summary className="flex items-center gap-1 font-semibold text-foreground">
          <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" aria-hidden /> {t.common.technicalDetails}
        </summary>
        <label className="mt-2 flex items-center gap-2">
          <input type="checkbox" checked={showPlanted} onChange={(e) => setShowPlanted(e.target.checked)} className="accent-[var(--foreground)]" />
          {pt.showPlanted}
        </label>
      </details>
    </aside>
  );
}
