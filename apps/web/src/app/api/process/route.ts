import { NextResponse } from 'next/server';
import { DEMO } from '@/lib/demo';
import { processSample, processUpload } from '@/lib/server/pipeline';

export const runtime = 'nodejs';
export const maxDuration = 120;

/** Runs the Mastra workflow on a dataset sample ({ sampleId }) or an uploaded file (multipart "file"). */
export async function POST(req: Request) {
  if (DEMO) return NextResponse.json({ error: 'Read-only demo: processing is disabled' }, { status: 403 });
  try {
    const type = req.headers.get('content-type') ?? '';
    if (type.includes('multipart/form-data')) {
      const file = (await req.formData()).get('file');
      if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
      const record = await processUpload(file);
      return NextResponse.json({ id: record.id, state: record.state });
    }
    const { sampleId } = (await req.json()) as { sampleId?: string };
    if (!sampleId) return NextResponse.json({ error: 'Missing sampleId' }, { status: 400 });
    const record = await processSample(sampleId);
    return NextResponse.json({ id: record.id, state: record.state });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
