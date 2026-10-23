/**
 * Read-only public demo: the pages show documents processed beforehand (apps/web/demo/records),
 * and the routes that would call an LLM or write state refuse. Inlined at build time, so the
 * client components see the same flag as the server.
 */
export const DEMO = process.env.NEXT_PUBLIC_SENTINEL_DEMO === '1';

export const REPO_URL = 'https://github.com/ricardmartin/cross-border-invoice-sentinel';
