import 'server-only';

/** Deep link to a trace, or null when Langfuse is not configured. */
export function traceUrl(traceId: string | null): string | null {
  if (!traceId || !process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) return null;
  const base = (process.env.LANGFUSE_BASE_URL ?? process.env.LANGFUSE_BASEURL ?? 'https://cloud.langfuse.com').replace(/\/$/, '');
  const project = process.env.LANGFUSE_PROJECT_ID;
  // Without a project id, Langfuse's /trace/<id> route redirects to the right project.
  return project ? `${base}/project/${project}/traces/${traceId}` : `${base}/trace/${traceId}`;
}
