import { config as loadEnv } from 'dotenv';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { NextConfig } from 'next';

// One .env at the repo root serves the core, the evals and the web app.
loadEnv({ path: join(import.meta.dirname, '..', '..', '.env'), quiet: true });
// Local state of the demo app: processed documents, uploads, delivery notes and Mastra's
// LibSQL store (suspended claim reviews survive restarts).
mkdirSync(join(import.meta.dirname, '.data'), { recursive: true });
// Server code resolves datasets and .data from here, whatever directory `next` was started from.
process.env.SENTINEL_WEB_DIR ??= import.meta.dirname;
// The read-only demo never suspends or resumes a run, so it keeps nothing on disk.
process.env.MASTRA_DB_URL ??= process.env.NEXT_PUBLIC_SENTINEL_DEMO === '1' ? ':memory:' : `file:${join(import.meta.dirname, '.data', 'mastra.db').split('\\').join('/')}`;

const nextConfig: NextConfig = {
  // The core ships TypeScript sources; Next compiles it.
  transpilePackages: ['@sentinel/core'],
  // Hosted deployments trace files from the repo root: the server reads the datasets, eval reports,
  // demo records and the pdf.js worker at runtime.
  outputFileTracingRoot: join(import.meta.dirname, '..', '..'),
  outputFileTracingIncludes: {
    '/**': ['../../evals/datasets/**', '../../evals/reports/runs/*.json', '../../evals/baseline.json', './demo/**', '../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs'],
  },
  // Mastra, LibSQL and the Langfuse/OTel stack are Node packages: keep them out of the bundle.
  serverExternalPackages: ['@mastra/core', '@mastra/libsql', '@mastra/langfuse', '@mastra/observability', '@libsql/client', '@langfuse/client', '@langfuse/otel'],
  turbopack: {
    // The server layer reads the evals datasets and its own .data folder at runtime by design
    // (local demo app, not a standalone deployment), so whole-project tracing is expected here.
    ignoreIssue: [{ path: '**/src/lib/server/**', title: /Dynamic filesystem access/ }],
  },
};

export default nextConfig;
