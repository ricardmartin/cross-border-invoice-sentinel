# Eval run `8f6e78f-anthropic_claude-haiku-5-5-extract-v2`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · DE, DK, ES, FR, GB, IE, IT, PT · 1 docs · 2026-10-21T13:55:28.012Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | — |
| Documents 100 % correct (first read) | — |
| Line F1 | 100.0 % |
| Final status correct | — |
| Discrepancy precision | — |
| Discrepancy recall | — |
| Unfair claims (false positives on clean docs) | — |
| EXTRACTION_UNCERTAIN rate | — |
| Mean extraction attempts | — |
| Escalated to stronger model | — |
| Triage country accuracy | — |
| Triage doc-type accuracy | — |
| Reconciliation status correct | — |
| Claims drafted for SUPPLIER_DISCREPANCY | — |
| Claim amount correct | — |
| Claim drafts passing guardrails | — |
| Claim judge score (1-5) | — |
| Claims with invented data | — |
| Cost / doc | — |
| Latency p50 | — |
| Latency p95 | — |
| Failed runs | 1.00 |

## By country

| Metric | PT | Baseline |
| --- | --- | --- |
| Documents 100 % correct (final) | — | 100.0 % |
| Documents 100 % correct (first read) | — | 93.3 % |
| Line F1 | 100.0 % | 100.0 % |
| Final status correct | — | 100.0 % |
| Discrepancy precision | — | 100.0 % |
| Discrepancy recall | — | 100.0 % |
| Unfair claims (false positives on clean docs) | — | 0.0 % |
| EXTRACTION_UNCERTAIN rate | — | 0.0 % |
| Mean extraction attempts | — | 1.27 |
| Escalated to stronger model | — | 0.0 % |
| Triage country accuracy | — | 100.0 % |
| Triage doc-type accuracy | — | 100.0 % |
| Reconciliation status correct | — | 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | — | 100.0 % |
| Claim amount correct | — | 100.0 % |
| Claim drafts passing guardrails | — | 100.0 % |
| Claim judge score (1-5) | — | 4.43 |
| Claims with invented data | — | 0.0 % |
| Cost / doc | — | $0.00189 |
| Latency p50 | — | 7157 ms |
| Latency p95 | — | 23180 ms |
| Failed runs | 1.00 | 0.00 |

## Gate (FAILED)

| Country | Check | Metric | Value | Limit | |
| --- | --- | --- | --- | --- | --- |
| PT | threshold | Failed runs | 1 | ≤ 0 | ✖ |
| PT | regression | Line F1 | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 0 | 0 | 0 | 0 |
| SUPPLIER_DISCREPANCY | 0 | 0 | 0 | 0 |
| INVALID_TAX_ID | 0 | 0 | 0 | 0 |
| EXTRACTION_UNCERTAIN | 0 | 0 | 0 | 0 |

## Claims (judged by LLM, then approved by eval-bot)

| Doc | Amount | Expected | Draft | Judge | Justification |
| --- | --- | --- | --- | --- | --- |

## Field accuracy (final read)

| Field | Accuracy |
| --- | --- |
| docType | — |
| documentNumber | — |
| issueDate | — |
| currency | — |
| issuer.name | — |
| issuer.taxId | — |
| recipient.name | — |
| recipient.taxId | — |
| printedTaxBreakdown | — |
| printedTotal | — |
| lines.description | — |
| lines.quantity | — |
| lines.unitPrice | — |
| lines.discountPct | — |
| lines.taxRate | — |
| lines.lineAmount | — |

## Documents worth a look

- **pt-031** (classic, scan) expected VALID → **ERROR**: process-document failed: {"message":"Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.","name":"AI_APICallError","stack":"AI_APICallError: Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.\n    at <anonymous> (C:\\Users\\Ricard.Martin\\Documents\\cross-border-invoice-sentinel\\node_modules\\@ai-sdk\\provider-utils\\src\\response-handler.ts:151:16)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async postToApi (C:\\Users\\Ricard.Martin\\Documents\\cross-border-invoice-sentinel\\node_modules\\@ai-sdk\\provider-utils\\src\\post-to-api.ts:118:28)\n    at async postJsonToApi (C:\\Users\\Ricard.Martin\\Documents\\cross-border-invoice-sentinel\\node_modules\\@ai-sdk\\provider-utils\\src\\post-to-api.ts:31:3)\n    at async AnthropicLanguageModel.doGenerate (C:\\Users\\Ricard.Martin\\Documents\\cross-border-invoice-sentinel\\node_modules\\@ai-sdk\\anthropic\\src\\anthropic-language-model.ts:1255:9)\n    at async AISDKV7LanguageModel.doGenerate (C:\\Users\\Ricard.Martin\\Documents\\cross-border-invoice-sentinel\\node_modules\\@mastra\\core\\src\\llm\\model\\aisdk\\v7\\model.ts:240:20)","url":"https://api.anthropic.com/v1/messages","requestBodyValues":{"model":"claude-haiku-5-5","max_tokens":1000,"output_config":{"format":{"type":"json_schema","schema":{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"docType":{"enum":["INVOICE","DELIVERY_NOTE","CREDIT_NOTE","OTHER"],"type":"string"},"country":{"description":"ISO 3166-1 alpha-2 code of the ISSUER (supplier)","type":"string"},"confidence":{"description":"0 to 1","type":"number"},"signals":{"description":"Short evidence list: tax id format, currency, language, address, document title","type":"array","items":{"type":"string"}},"issuerTaxId":{"description":"Issuer fiscal id as printed, without its label; null if not visible","type":["stri
