# CLAUDE.md

Guidance for coding agents working in this repo. Read [NOTES.md](NOTES.md) for the current state and numbers.

## What this is

Supplier invoices and delivery notes for restaurants, any country: an LLM transcribes the document, deterministic TypeScript validates it with a per-country pack, two independent reads must agree before a supplier is blamed, and a human approves every claim. Evals per country with a regression gate.

## Non-negotiables (never break these)

1. **The LLM only transcribes.** Every number (bases, VAT, totals, Δ, claim amounts) is computed in TypeScript in integer cents (`money.ts`: `toCents`, `lineCents`, `pctCents`). Never ask a model to compute, check or fix numbers.
2. **Blame the read before the supplier.** A failed check is retried with the concrete errors. Only two reads with the same error signature make it a supplier error. A read that passes only after feedback must be confirmed by a blind read. Doubt ends in `EXTRACTION_UNCERTAIN` (human review), never in a claim.
3. **Nothing reaches a supplier without human approval** (`human-review` step suspends).
4. **The model is configuration** (`provider:model`). No model ids hard-coded in logic.
5. **Every behaviour change is measured** with the evals; unfair claims must stay at 0 %.

## Where things go

- Country-specific anything → the country pack (`packages/core/src/countries/<cc>/`). The core never branches on a country code.
- Deterministic rules → `validation/engine.ts` (all countries) or a pack's `extraValidators`. Business policy (what counts as a supplier error) → `decision/decide.ts`.
- `validateDocument`, `nextAction`/`decideFinalStatus`, `reconcile`, `computeClaimAmount` are **pure**: no I/O, no `new Date()`, no randomness. Inject what they need.
- Retry feedback says *what* does not add up, never the expected value (it would hand the model the answer).

## Versioning (cache keys and traces depend on it)

- Change a pack's rules or prompt context → bump that pack's `version`.
- Change extraction instructions or message layout → bump `EXTRACTION_PROMPT_VERSION`. Claim prompt → `CLAIM_PROMPT_VERSION`. Triage → `TRIAGE_PROMPT_VERSION`.
- After changing the extraction instructions, run `npm run prompts:push`: with Langfuse keys set, the app and evals use the `production` prompt from Langfuse, so a stale copy there silently runs the old prompt. Rerun it to confirm it says "already matches local".

## Workflow

- Tests first for deterministic code. Fixtures: `validEsInvoice()`, `line()` in `packages/core/test/fixtures.ts`.
- Commands:
  - `npm test` (all, no LLM calls), `npm run typecheck`
  - one core test file: `npm test -w @sentinel/core -- <name>` (not `npx vitest ... -w`, which means `--watch`)
  - evals cost money: prefer `npm run evals -- --ids=<id>,<id>`; full run ≈ $0.2 uncached with Haiku; never run `--model=anthropic:claude-sonnet-5-5` or `--no-cache` without asking
  - use `PROMPT_SOURCE=local` when comparing with `evals/baseline.json`
- Invoices are reconciled against delivery notes processed earlier: when running `--ids`, include the delivery note (`deliveryNoteFor` in its dataset JSON).
- Do not edit `evals/datasets/es/es-001`…`es-030` or commit regenerated dataset binaries unless the dataset really changed.
- `--update-baseline` rewrites `baseline.json` with only the countries in that run: do a full run or merge by hand.
- Git identity in this repo: `ricardmartin <ricardmartin.dev@gmail.com>`. Branch before committing; commit only when asked.
