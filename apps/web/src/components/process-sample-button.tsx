'use client';

import { Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/components/i18n';
import { Button } from '@/components/ui/button';
import { DEMO } from '@/lib/demo';

/** Runs the real pipeline on one dataset sample (costs a few LLM calls) and opens the processed document. */
export function ProcessSampleButton({ sampleId, llmReady }: { sampleId: string; llmReady: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/process', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sampleId }) });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) throw new Error(json.error ?? t.common.serverError(res.status));
      router.push(`/documents/${json.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={run} disabled={busy || !llmReady} title={DEMO ? t.process.demoTitle : llmReady ? t.process.runTitle : t.process.missingKeyTitle}>
        {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Play aria-hidden />} {busy ? t.process.processingShort : t.process.runForReal}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
