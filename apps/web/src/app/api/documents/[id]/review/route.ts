import { NextResponse } from 'next/server';
import { DEMO } from '@/lib/demo';
import { reviewClaim } from '@/lib/server/pipeline';

export const runtime = 'nodejs';

/** Resumes the suspended workflow: approve (optionally edited) and "send", or discard. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (DEMO) return NextResponse.json({ error: 'Read-only demo: reviews are disabled' }, { status: 403 });
  const { id } = await params;
  const body = (await req.json()) as { action?: 'approve' | 'discard'; subject?: string; body?: string };
  if (body.action !== 'approve' && body.action !== 'discard') return NextResponse.json({ error: 'action must be approve or discard' }, { status: 400 });
  try {
    const record = await reviewClaim(id, { action: body.action, subject: body.subject, body: body.body, reviewer: 'web-user' });
    return NextResponse.json({ state: record.state, review: record.result.claim?.review ?? null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 409 });
  }
}
