import { readFile } from 'node:fs/promises';
import { readEntry, samplePath } from '@/lib/server/data';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const entry = await readEntry((await params).id);
  if (!entry) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(await readFile(samplePath(entry))), { headers: { 'content-type': entry.mediaType, 'cache-control': 'public, max-age=3600' } });
}
