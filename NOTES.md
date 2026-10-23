# Working notes — state of the project

Working notes so work can resume on any machine or in a new session: decisions, numbers, limitations and next steps.

The question the project answers: *how do we add a new country in days, measuring its accuracy from day one, without breaking the countries that already work?* Answer: country packs + a country-agnostic core + evals per country with a regression gate.

Non-negotiables (design principles), all implemented:

1. The LLM only transcribes; every number (bases, VAT, totals, Δ, claim amounts) is computed in TypeScript, in integer cents.
2. A failed check is first blamed on the extraction and retried with the concrete errors. It only counts as a supplier error when **two independent reads agree** on it. A read that passes only after feedback must be confirmed by a **blind read** (no feedback, no previous attempt).
3. Nothing reaches a supplier without human approval (Mastra suspend/resume).
4. The model is configuration (`provider:model`), so models are compared on the same evals.
5. Evals measure the AI: accuracy per country and model, cost, latency, claim quality.

## Phases

| Phase | Status |
| --- | --- |
| 1. Zod schemas, `CountryPack`, ES pack, Vitest | done |
| 2. Playwright dataset generator (ES), baseline extraction, first eval | done |
| 3. Mastra workflow: triage → extraction with self-correction and cascade → validation → decision; Langfuse | done, Langfuse verified 2026-10-19 |
| 4. Delivery-note reconciliation, claim agent with suspend/resume, LLM judge | done |
| 5. FR and IT packs and datasets, thresholds, baseline, gate, CI | done |
| 6. Web app (inbox, document inspection, claim approval, `/evals`) | done |
| 7. Model comparison: Haiku vs Sonnet as primary (README "Model comparison") | done |
| README | done |
| Fixes found by phase 7: blind-read guard, English validator messages, per-pack "VAT included" label | done, see below |
| es-041 fix: near-number fallback for misread delivery-note references (`findNear`), `CLAUDE.md` | done 2026-10-20 |
| PT, IE, DK, DE, GB packs + datasets + baseline (`triage-v2`) | done 2026-10-21 |

## Tax regions (2026-10-21)

A pack can declare `regions` ([types.ts](packages/core/src/countries/types.ts) `TaxRegion`): own rates, own rate hints and own "tax included" label for the claim. `taxRegimeFor` ([regions.ts](packages/core/src/countries/regions.ts), pure) picks the region from the postal code of the client address, or of the supplier address when the client address is not printed (the ERP template only prints the client name and tax id: with the client-only rule, those Canarias invoices would have been unfair claims). The engine checks rates against the regime, the `RATE_NOT_ALLOWED` message names it ("not allowed in PT (Madeira) (4, 12, 22 %)"), and the report records `taxRegime`. Messages for documents outside a region are unchanged.

- PT 1.1.0: Madeira (9000–9499: 4/12/22 %) and Açores (9500–9999: 4/9/16 %).
- ES 1.1.0: Canarias (35xxx/38xxx) uses IGIC (0/3/7/9,5/15/20 %), claim label "IGIC incluido". Ceuta/Melilla (IPSI) still fall back to IVA.
- Dataset: pt-031…pt-040 (5 Madeira, 5 Açores) and es-046…es-051 (Canarias), 1 planted mainland-rate error per region. `gen:dataset --append` renders only new documents, so es-001…es-045 keep their bytes (and their cache entries).
- Counterfactual (validation on ground truth, no LLM): **without regions, all 13 clean regional documents fail with `RATE_NOT_ALLOWED`** → 13 unfair claims. With regions they pass and the 3 planted ones are still caught.
- Eval run: done 2026-10-22 together with extract-v3 (printed charges, PT ATCUD) and the new ES/IT documents, run `24ccf06-anthropic_claude-haiku-5-5-extract-v3`: all 282 final statuses right, 0 % unfair claims, gate PASSED, `baseline.json` rebased on it. See "Current numbers".

## New countries (2026-10-21)

Five packs added the documented way (pack folder + registry line + generator config), 150 new synthetic documents, gate PASSED on all 8 countries, ES/FR/IT numbers unchanged (reads from cache; the FR/IT templates render byte-identical HTML after the generalisation, checked by hashing).

| Metric | PT | IE | DK | DE | GB |
| --- | --- | --- | --- | --- | --- |
| Documents 100 % correct | 100 % | 93.3 % | 96.7 % | 86.7 % | 96.7 % |
| Final status / recall / reconciliation | 100 % | 100 % | 100 % | 100 % | 100 % |
| Unfair claims | 0 % | 0 % | 0 % | 0 % | 0 % |
| Claim judge (1–5) | 4.43 | 5.00 | 4.14 | 4.43 | 5.00 |
| Cost / doc | $0.0019 | $0.0018 | $0.0018 | $0.0018 | $0.0019 |

What each country tests that ES/FR/IT did not:
- **PT**: mainland rates only (6/13/23 %). Azores (4/9/16 %) and Madeira (4/12/22 %) are rejected as `RATE_NOT_ALLOWED` — the pack assumes one tax regime per country. Next step: tax regimes per region inside a pack (also needed for Canarias/IGIC in ES).
- **IE / GB**: 0 % is a legal rate (most food), with its own 0 % bracket; decimal point. GB is the first non-euro currency (GBP) and accepts the `XI` (Northern Ireland) prefix and 12-digit branch numbers.
- **DK**: single 25 % rate, DKK, CVR mod 11. No rate hints needed: any other rate is already an error.
- **DE**: USt-IdNr. (ISO 7064 MOD 11,10) or Steuernummer (shape only, its check varies by Land). `ß` upper-cases to `SS` on printed documents: the eval text match now folds `ß/æ/ø` (it was counting a correct transcription as an error).

Shared changes (no country branches): `kr.`/`DKK` stripped when parsing amounts, ordinal dates (`3rd October`, `3. Oktober`), `æ/ø/ß` folded for rate-hint keywords, generator templates print the pack's currency and decimal separator, Danish added to the claim languages, triage prompt lists the new document names → `TRIAGE_PROMPT_VERSION` = `triage-v2`.

Findings worth fixing next (all from the judge, none affect status or amounts):
- **DE claims say "unserer Rechnung"** (our invoice) for the supplier's invoice (de-006 judge 3/5, de-005, de-013). Same class as the ES "ustedes" rule in the claim prompt; a fix needs `CLAIM_PROMPT_VERSION` bump.
- **English validator messages leak into a Danish e-mail** (dk-002 judge 3/5: "bases", "VAT", "printed total"). The FR "cuotas" story in reverse: the core messages are English and the model sometimes copies them verbatim.
- Recipient tax ids are only compared, never checked: de-027 read `DE274315862` for `DE273415862` (two digits swapped). Both pass the USt-IdNr. checksum, so a check would not have caught it; matching the recipient against the restaurant's known id would. Low risk (the recipient is the restaurant).

## Current numbers

Run `24ccf06-anthropic_claude-haiku-5-5-extract-v3` (2026-10-22, also the baseline): 282 synthetic documents in 8 countries, primary `anthropic:claude-haiku-5-5`, escalation `anthropic:claude-sonnet-5-5`, prompts `extract-v3` / `claim-v5`, `PROMPT_SOURCE=local`, reads from the local cache. Report: [evals/reports/latest.md](evals/reports/latest.md).

| Metric | ES | FR | IT | PT | IE | DK | DE | GB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Documents | 59 | 30 | 33 | 40 | 30 | 30 | 30 | 30 |
| Documents 100 % correct | 93.2 % | 90.0 % | 97.0 % | 92.5 % | 93.3 % | 96.7 % | 83.3 % | 96.7 % |
| Final status / recall / reconciliation | 100 % | 100 % | 100 % | 100 % | 100 % | 100 % | 100 % | 100 % |
| Unfair claims | 0 % | 0 % | 0 % | 0 % | 0 % | 0 % | 0 % | 0 % |
| Claim judge (1–5) | 4.71 | 4.71 | 4.75 | 4.67 | 4.86 | 4.71 | 4.71 | 5.00 |
| Cost / document | $0.0021 | $0.0019 | $0.0020 | $0.0020 | $0.0019 | $0.0019 | $0.0019 | $0.0018 |

Non-exact reads (20 of 282) are on fields no verdict rests on: `discountPct` 7, line descriptions 6, document number 5, recipient tax id 4, recipient name 2, PT ATCUD on photos 3 (`0`→`D`, `1`→`I`; the ATCUD check is a warning), one line quantity.

Previous section (ES/FR/IT, 105 documents, kept for the history below):
Latest full run after the fixes, 105 synthetic documents (ES 45, FR 30, IT 30), primary `anthropic:claude-haiku-5-5`, escalation `anthropic:claude-sonnet-5-5`, prompts `extract-v2` / `claim-v5`, every extraction a fresh call (no cache on this machine). Report: [evals/reports/latest.md](evals/reports/latest.md) = `runs/65bf2e5-anthropic_claude-haiku-5-5-extract-v2.md`.

| Metric | ES | FR | IT |
| --- | --- | --- | --- |
| Documents 100 % correct | 93.3 % | 93.3 % | 93.3 % |
| Final status correct | 97.8 % | 100 % | 100 % |
| Discrepancy precision / recall | 100 / 90.9 % | 100 / 100 % | 100 / 100 % |
| Unfair claims (false positives on clean docs) | 0 % | 0 % | 0 % |
| Reconciliation status correct | 87.5 % | 100 % | 100 % |
| Claim amount correct | 100 % | 100 % | 100 % |
| Claim judge (1–5) | 4.63 | 4.86 | 4.71 |
| Cost / document | $0.0017 | $0.0019 | $0.0019 |

**The gate FAILS on ES** (recall 90.9 % and reconciliation 87.5 % vs baseline 100 %) because of **one document, `es-041`**, and not because of the fixes: the very first read (no feedback, passed directly) misread the delivery-note reference `ALB-2603387` as `A18-2603387`, so the delivery note was "not received yet" and the short delivery went unclaimed. Pure OCR variance on a field no validator checks; the previous baseline was produced from cached reads on another machine. `baseline.json` was **not** updated. See "Before Thursday".

**Update 2026-10-20: fixed.** When an invoice's reference is not found, the reconciliation falls back to `findNear` ([delivery/repository.ts](packages/core/src/delivery/repository.ts)): the only stored note of the same restaurant and supplier whose normalised number is within `min(2, len/4)` edits (none when ambiguous, none below 4 characters). The match is recorded in `reconciliation.nearMatches`, on the span metadata and in the decision reason, and the usual delivery-note re-read still confirms any discrepancy before a claim. Unit tests in `test/delivery.test.ts` cover the exact es-041 case. Full eval run after the fix (`PROMPT_SOURCE=local`, reads mostly from cache): **gate PASSED**, ES/FR/IT 100 % status, recall and reconciliation, 0 % unfair claims. Caveat: the cached es-041 read has the reference right, so that run does not exercise the fallback end to end; the unit tests do.

Tests: 147 in `packages/core`, 7 in `evals` (gate). Typecheck clean.

## Stories worth telling

- **Prompt bug found by the evals.** Single-read baseline v1: 83.3 % exact (the model copied "CIF B12…" with its label). Prompt v2: 90 %. Compare runs with `npm run evals:compare`.
- **Self-correction in action (fr-025).** Read #1 misread a taxable base; the validator caught it; read #2, fed the concrete error, got the numbers right.
- **Two agreeing reads before blaming the supplier.** All planted errors are confirmed that way; disagreeing reads go to human review, never to a claim.
- **The judge improved the claims.** v1 did not say the amount includes VAT; v2 fixed it but the instruction leaked into an e-mail; v3 fixed that; v4 added proper paragraphs; v5 takes the "VAT included" wording from the country pack.
- **The gate blocks regressions and fails safe.** With retries off, FR status accuracy drops to 77 % and recall to 25 %, so CI fails — and unfair claims still stay at 0 %.
- **Adding a country is cheap.** One pack folder + one registry line; in the dataset, one `COUNTRY_CONFIGS` entry. The runner and generator discover countries, no list to edit.
- **The bigger model is not the better system (phase 7).** Sonnet as primary: 94.3 % exact vs 93.3 %, but 98.1 % status, 1 unfair claim, 15× cost → gate fails, Haiku stays.
- **Evals found a hole in the design, and it is fixed (the best story).** On `es-018` the printed CIF is invalid on purpose. Sonnet's read #1 transcribed it exactly; the retry feedback ("control character mismatch") made read #2 *recompute the digit* so it passed → `VALID`. The model repaired the supplier's document instead of transcribing it. Fix: a read that passes only after feedback must be reproduced by a **blind read** (no feedback, no previous JSON; separate cache key). Re-run: #1 invalid (exact) → #2 "repaired", passes → #3 blind, invalid again, agrees with #1 → `INVALID_TAX_ID`. If the blind read neither passes nor agrees → `EXTRACTION_UNCERTAIN` (human). Cost on Haiku: zero in this run (no self-corrections happened). Code: `decision/decide.ts`, tests in `test/decide.test.ts`. Reproduce: `npm run evals -- --model=anthropic:claude-sonnet-5-5 --ids=es-018,it-010`.
  - Same investigation: the FR validator's reason included the expected TVA key ("expected 14"), literally handing the answer to the model in the retry. Removed.
- **Language leaks into other countries, measured by the judge.** Validator messages were Spanish in the core ("cuotas" ended up in French e-mails, judge 4/5); now English. Then the claim prompt's only example was "IVA incluido", which appeared in a French e-mail (`fr-029`, judge 3/5); now each pack declares `vatIncludedLabel` (`IVA incluido` / `TTC` / `IVA inclusa`) and the code passes it as a fact. FR judge 4.57 → 4.86.
- **Two agreeing reads are not always independent.** `it-010` under Sonnet: both reads misread the same digits of a bad photo → `INVALID_TAX_ID` on a clean doc. Not fixed; idea: second read with a different model or a re-rendered crop.
- **Langfuse tracing verified (2026-10-19).** Spans per workflow step and attempt (blind reads are named "…, blind"), generations with cost, prompt `invoice-extraction@1` from prompt management. New org → only the v2 observations API works (`/api/public/traces` is refused).

## Known limitations (say them before you are asked)

- The dataset is synthetic and probably easier than reality; no real photos yet.
- n is small: 30 documents per country, ~11 discrepancy documents in ES, so one document moves recall 9 points. The 5-point regression rule is stricter than the noise: a single misread fails the gate (see `es-041`).
- The cascade to Sonnet has never been triggered on this dataset, so its effect is unmeasured.
- Remaining errors are in fields no validator checks (document numbers, descriptions, delivery-note references). `es-041` shows the cost: a misread reference silently skips reconciliation.
- "Exact" matching tolerates ±0.01 per number (`evals/metrics.ts`); `fr-010` under Sonnet was "exact" yet claimed 1.23 instead of 1.26. The claim-amount metric catches it.
- The deterministic fallback claim template (`claims/draft.ts`) is still Spanish for every country (only used when the LLM draft fails its guardrails; never happened in evals).
- Suspended runs live in local LibSQL; runs suspended before today's schema change (`withFeedback`/`blind` on attempts) may not resume.

## Before Thursday, by priority

1. ~~**Gate on ES (`es-041`).**~~ Done with option (c), see "Current numbers". Original analysis: (a) accept as noise and update the baseline (`npm run evals -- --update-baseline`, records 90.9 % recall as the ES reference — not great), (b) leave the baseline and document it as "the gate is stricter than n allows", or (c) fix the weakness: when an invoice references a delivery note that is not found, look for a stored note from the same supplier whose number is within edit distance 1–2 and re-read the reference before concluding "not received". (c) is the real fix; it needs care to avoid false matches.
2. **Screenshots for the slides** (not done yet):
   - Langfuse trace (needs your login): tags `country:`, `status:`, scores, the "extraction attempt #n (…, blind)" spans. Process `es-018` with Sonnet to get a trace with the blind read.
   - Web app with Playwright: inbox, `/evals`, a document with the three reads, a claim awaiting approval. Script idea: `chromium.launch()` → `page.goto('http://localhost:3000/…')` → `screenshot({ fullPage: true })` at 1440×900, deviceScaleFactor 2.
3. Update README "Current results" if the numbers change after (1).
4. Optional: a few real anonymised receipts as `evals/datasets/<country>/real-<n>.{jpg,json}`, then `npm run gen:dataset -- --country=<cc>` to list them in the manifest.

## Running it

```bash
npm install
cp .env.example .env            # ANTHROPIC_API_KEY (+ LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_BASE_URL)
npx playwright install chromium # only for gen:dataset
npm test                        # unit tests (core + gate)
npm run evals                   # all countries through the real workflow, then the gate (≈$0.2 uncached)
npm run evals:smoke             # 11-document subset used by CI
npm run evals:compare -- <runA> <runB>
npm run prompts:push            # publish the extraction prompt to Langfuse
npm run dev                     # web app on http://localhost:3000
```

Set `PROMPT_SOURCE=local` for eval runs you want to compare with the baseline (otherwise the run name carries the Langfuse prompt version, e.g. `…-lf1`).

## Things that bite

- `.env` is not in git: recreate it on a new machine. Use `LANGFUSE_BASE_URL` (the Mastra exporter ignores the legacy `LANGFUSE_BASEURL`).
- The LLM cache (`evals/reports/cache/`) is not in git, so the first eval run on a new machine pays again (≈$0.2 for Haiku, ≈$2.9 for Sonnet) — and, being fresh samples, numbers can move by a document or two.
- `ES` documents `es-001`–`es-030` must never change: the ES generator is kept separate on purpose so the baseline stays comparable.
- Current Claude models reject non-default `temperature`: the extractor does not set it.
- Dataset generation is deterministic for a given Chromium build only. With Playwright's headless shell 1248 every JSON and manifest is identical but every PDF/JPG changes a few bytes, which would invalidate the cache and the baseline. Don't commit regenerated binaries unless the dataset really changed.
- In this repo, git uses the personal identity `ricardmartin <ricardmartin.dev@gmail.com>` (local config). Set it again after cloning: `git config user.name ricardmartin; git config user.email ricardmartin.dev@gmail.com`.
- Pushing needs an interactive GitHub sign-in the first time (Git Credential Manager).
- CI runs the evals only when the `ANTHROPIC_API_KEY` secret exists in the GitHub repo (not set yet); the Langfuse base URL there is the repo variable `LANGFUSE_BASE_URL`.
