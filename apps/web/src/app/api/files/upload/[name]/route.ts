import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { UPLOADS_DIR } from '@/lib/server/data';

export const runtime = 'nodejs';

const TYPES: Record<string, string> = { pdf: 'application/pdf', jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = /^[0-9a-f-]{36}\.(pdf|jpe?g|png|webp)$/.exec(name);
  const path = m ? join(UPLOADS_DIR, name) : null;
  if (!path || !existsSync(path)) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(await readFile(path)), { headers: { 'content-type': TYPES[m![1]!]! } });
}
