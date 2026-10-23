import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { REPO_ROOT } from '@/lib/server/data';

export const runtime = 'nodejs';

const WORKER = join('node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');

/**
 * pdf.js renders in a worker; serving it from the app avoids bundler-specific worker URLs and a CDN.
 * Plain paths, not require.resolve (the bundler rewrites it): hoisted to the repo root by npm workspaces,
 * or inside the app when installed there.
 */
export async function GET() {
  const path = [join(REPO_ROOT, WORKER), join(REPO_ROOT, 'apps', 'web', WORKER)].find((p) => existsSync(p));
  if (!path) return new Response('pdf.js worker not installed', { status: 500 });
  return new Response(new Uint8Array(await readFile(path)), {
    headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'public, max-age=86400' },
  });
}
