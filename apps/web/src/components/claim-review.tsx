'use client';

import { ChevronRight, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Tick } from '@/components/audit';
import { useI18n } from '@/components/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { DEMO } from '@/lib/demo';

export interface ClaimReviewProps {
  id: string;
  pending: boolean;
  subject: string;
  body: string;
  language: string;
  amount: string | null;
  mode: 'llm' | 'template';
  supplier: string;
  review: { action: 'approve' | 'discard'; edited: boolean; decidedAt: string; subject: string; body: string; messageId: string | null } | null;
}

type Step = 'idle' | 'confirm-approve' | 'confirm-discard';

export function ClaimReview(p: ClaimReviewProps) {
  const router = useRouter();
  const { t, intl } = useI18n();
  const c = t.claim;
  const [subject, setSubject] = useState(p.subject);
  const [body, setBody] = useState(p.body);
  const [step, setStep] = useState<Step>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const edited = subject !== p.subject || body !== p.body;

  async function decide(action: 'approve' | 'discard') {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${p.id}/review`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, ...(action === 'approve' ? { subject, body } : {}) }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? t.common.serverError(res.status));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
      setStep('idle');
    }
  }

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
      <div className="min-w-0">
        <h2 className="flex flex-wrap items-center gap-2 text-[11.5px] font-bold tracking-[0.07em] text-muted-foreground uppercase">
          {c.heading}
          {p.pending ? (
            <Badge className="tracking-normal normal-case">{c.pending}</Badge>
          ) : p.review?.action === 'approve' ? (
            <Badge tone="ok" className="tracking-normal normal-case">
              <Tick kind="ok" className="w-auto text-inherit" /> {c.sent}
            </Badge>
          ) : (
            <Badge tone="outline" className="tracking-normal normal-case">
              {c.discarded}
            </Badge>
          )}
        </h2>
        <p className="mt-1.5 text-[14px] font-semibold">{p.review?.subject ?? subject}</p>
        <p className="text-xs text-muted-foreground">
          {c.meta(p.supplier, p.language, p.mode === 'llm')}
        </p>
      </div>
      {p.amount && (
        <div className="text-right">
          <p className="text-[11.5px] font-bold tracking-[0.07em] text-muted-foreground uppercase">{c.amount}</p>
          <p className="text-[26px] leading-tight font-bold tracking-tight">{p.amount}</p>
          <p className="text-[11px] text-muted-foreground">{c.amountNote}</p>
        </div>
      )}
    </div>
  );

  if (!p.pending && p.review) {
    const sent = p.review.action === 'approve';
    return (
      <section aria-label={c.aria} className="rounded-md border border-foreground/70 bg-sheet px-4 py-3">
        {header}
        <p className="mt-2 border-t border-rule pt-2 text-xs text-muted-foreground">
          {c.decidedOn(sent, new Date(p.review.decidedAt).toLocaleString(intl))}
          {p.review.edited ? c.editedBeforeSend : ''}
          {sent ? c.simulated : ''}
          {p.review.messageId ? (
            <>
              {c.outbox}
              <span className="font-mono">{p.review.messageId}</span>
            </>
          ) : null}
        </p>
        {sent && (
          <details className="group mt-2">
            <summary className="flex items-center gap-1 text-xs font-semibold">
              <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" aria-hidden /> {c.sentEmail}
            </summary>
            <div className="mt-2 border-l border-border pl-3 text-[13px] whitespace-pre-wrap text-muted-foreground">{p.review.body}</div>
          </details>
        )}
      </section>
    );
  }

  return (
    <section aria-label={c.aria} className="rounded-md border border-foreground/70 bg-sheet px-4 py-3">
      {header}

      <details open className="group mt-3 border-t border-rule pt-2">
        <summary className="flex items-center gap-1 text-xs font-semibold">
          <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" aria-hidden /> {c.draft}
          {edited ? c.edited : ''}
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} aria-label={c.subject} disabled={busy} />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} aria-label={c.body} className="max-h-64 min-h-32" disabled={busy} />
        </div>
      </details>

      {error && (
        <p role="alert" className="mt-3 rounded-sm border border-danger/50 bg-danger-soft px-2.5 py-2 text-xs">
          <span className="font-semibold text-danger">{c.notRecorded}</span> {error}. {c.retry}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-rule pt-3">
        {step === 'idle' && (
          <>
            <Button disabled={DEMO} onClick={() => setStep('confirm-approve')}>
              <Send aria-hidden /> {c.send(p.amount, edited)}
            </Button>
            <Button variant="outline" disabled={DEMO} onClick={() => setStep('confirm-discard')}>
              {c.discard}
            </Button>
            <span className="ml-auto text-xs text-muted-foreground">{DEMO ? c.demoGuard : c.guard}</span>
          </>
        )}
        {step === 'confirm-approve' && (
          <>
            <span className="mr-1 font-semibold">
              {c.confirmSend(p.supplier, p.amount)}
            </span>
            <Button disabled={busy} onClick={() => void decide('approve')} autoFocus>
              {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />} {c.yesSend}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => setStep('idle')}>
              {t.common.cancel}
            </Button>
          </>
        )}
        {step === 'confirm-discard' && (
          <>
            <span className="mr-1 font-semibold">{c.confirmDiscard}</span>
            <Button variant="danger" disabled={busy} onClick={() => void decide('discard')} autoFocus>
              {busy && <Loader2 className="animate-spin" aria-hidden />} {c.yesDiscard}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => setStep('idle')}>
              {t.common.cancel}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
