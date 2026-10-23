/**
 * Publishes the local extraction prompt to Langfuse prompt management.
 *   npm run prompts:push            # new version labelled "production" if the text changed
 *   npm run prompts:push -- --label=staging
 * The local copy in extractionAgent.ts stays the fallback when Langfuse is unreachable.
 */
import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';

loadEnv({ path: join(import.meta.dirname, '..', '..', '..', '.env'), quiet: true });
const { EXTRACTION_INSTRUCTIONS, EXTRACTION_PROMPT_NAME, EXTRACTION_PROMPT_VERSION, getLangfuseClient } = await import('../src/index');

const label = process.argv.find((a) => a.startsWith('--label='))?.split('=')[1] ?? 'production';
const lf = getLangfuseClient();
if (!lf) {
  console.error('LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY are not set');
  process.exit(1);
}

const current = await lf.prompt.get(EXTRACTION_PROMPT_NAME, { label, cacheTtlSeconds: 0 }).catch(() => null);
if (current && current.prompt === EXTRACTION_INSTRUCTIONS) {
  console.log(`✔ ${EXTRACTION_PROMPT_NAME}@${current.version} (${label}) already matches local ${EXTRACTION_PROMPT_VERSION}`);
} else {
  const created = await lf.prompt.create({
    name: EXTRACTION_PROMPT_NAME,
    type: 'text',
    prompt: EXTRACTION_INSTRUCTIONS,
    labels: [label],
    tags: ['extraction'],
    commitMessage: `sync local ${EXTRACTION_PROMPT_VERSION}`,
  });
  console.log(`✔ published ${EXTRACTION_PROMPT_NAME}@${created.version} with label "${label}" (local ${EXTRACTION_PROMPT_VERSION})`);
}
