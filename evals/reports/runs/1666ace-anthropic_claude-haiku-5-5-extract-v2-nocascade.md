# Eval run `1666ace-anthropic_claude-haiku-5-5-extract-v2-nocascade`

Primary `anthropic:claude-haiku-5-5` · escalation off · retries 0 · prompt `local:extract-v2` · FR · 30 docs · 2026-10-18T22:02:30.327Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 93.3 % |
| Documents 100 % correct (first read) | 93.3 % |
| Line F1 | 99.4 % |
| Final status correct | 76.7 % |
| Discrepancy precision | 100.0 % |
| Discrepancy recall | 25.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % |
| EXTRACTION_UNCERTAIN rate | 23.3 % |
| Mean extraction attempts | 1.00 |
| Escalated to stronger model | 0.0 % |
| Triage country accuracy | 100.0 % |
| Triage doc-type accuracy | 100.0 % |
| Reconciliation status correct | 75.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % |
| Claim amount correct | 100.0 % |
| Claim drafts passing guardrails | 100.0 % |
| Claim judge score (1-5) | 5.00 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.00153 |
| Latency p50 | 7041 ms |
| Latency p95 | 16056 ms |
| Failed runs | 0.00 |

## By country

| Metric | FR | Baseline |
| --- | --- | --- |
| Documents 100 % correct (final) | 93.3 % | 93.3 % |
| Documents 100 % correct (first read) | 93.3 % | 93.3 % |
| Line F1 | 99.4 % | 99.4 % |
| Final status correct | 76.7 % | 100.0 % |
| Discrepancy precision | 100.0 % | 100.0 % |
| Discrepancy recall | 25.0 % | 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % | 0.0 % |
| EXTRACTION_UNCERTAIN rate | 23.3 % | 0.0 % |
| Mean extraction attempts | 1.00 | 1.23 |
| Escalated to stronger model | 0.0 % | 0.0 % |
| Triage country accuracy | 100.0 % | 100.0 % |
| Triage doc-type accuracy | 100.0 % | 100.0 % |
| Reconciliation status correct | 75.0 % | 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % | 100.0 % |
| Claim amount correct | 100.0 % | 100.0 % |
| Claim drafts passing guardrails | 100.0 % | 100.0 % |
| Claim judge score (1-5) | 5.00 | 4.86 |
| Claims with invented data | 0.0 % | 0.0 % |
| Cost / doc | $0.00153 | $0.00186 |
| Latency p50 | 7041 ms | 7331 ms |
| Latency p95 | 16056 ms | 18358 ms |
| Failed runs | 0.00 | 0.00 |

## Gate (FAILED)

| Country | Check | Metric | Value | Limit | |
| --- | --- | --- | --- | --- | --- |
| FR | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.8 | ✔ |
| FR | threshold | Final status correct | 0.7667 | ≥ 0.9 | ✖ |
| FR | threshold | Discrepancy recall | 0.25 | ≥ 0.85 | ✖ |
| FR | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| FR | threshold | Reconciliation status correct | 0.75 | ≥ 0.75 | ✔ |
| FR | threshold | Claim judge score (1-5) | 5 | ≥ 3.5 | ✔ |
| FR | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| FR | threshold | Cost / doc | 0.0015 | ≤ 0.005 | ✔ |
| FR | threshold | Latency p95 | 16056 | ≤ 30000 | ✔ |
| FR | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| FR | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| FR | regression | Final status correct | 0.7667 | ≥ 95.0 % (baseline 100.0 %) | ✖ |
| FR | regression | Discrepancy recall | 0.25 | ≥ 95.0 % (baseline 100.0 %) | ✖ |
| FR | regression | Reconciliation status correct | 0.75 | ≥ 95.0 % (baseline 100.0 %) | ✖ |
| FR | regression | Line F1 | 0.9938 | ≥ 94.4 % (baseline 99.4 %) | ✔ |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 21 | 0 | 0 | 1 |
| SUPPLIER_DISCREPANCY | 0 | 2 | 0 | 5 |
| INVALID_TAX_ID | 0 | 0 | 0 | 1 |
| EXTRACTION_UNCERTAIN | 0 | 0 | 0 | 0 |

## Claims (judged by LLM, then approved by eval-bot)

| Doc | Amount | Expected | Draft | Judge | Justification |
| --- | --- | --- | --- | --- | --- |
| fr-027 | 25.92 | 25.92 | llm | 5/5 | The e-mail cites invoice CB26189 dated 16/09/2026, names the affected line with the invoiced and delivered quantities, and states 25,92 EUR TVA incluse exactly as in the facts. It is written entirely in French, in a formal and courteous tone, and requests a credit note or corrective invoice without inventing any data or commitments. It is ready to send unchanged. |
| fr-029 | 94.80 | 94.80 | llm | 5/5 | The e-mail cites invoice HPA-2716 dated 20/09/2026 and the single affected line (5 cartons of paper napkins not on the delivery note) with the exact amount of 94,80 EUR incl. VAT. It is written in formal, courteous French, requests a corrective invoice or credit note, and adds no invented data, so it is ready to send as is. |

## Field accuracy (final read)

| Field | Accuracy |
| --- | --- |
| docType | 100.0 % |
| documentNumber | 96.7 % |
| issueDate | 100.0 % |
| currency | 100.0 % |
| issuer.name | 100.0 % |
| issuer.taxId | 100.0 % |
| recipient.name | 100.0 % |
| recipient.taxId | 100.0 % |
| printedTaxBreakdown | 96.7 % |
| printedTotal | 100.0 % |
| lines.description | 99.4 % |
| lines.quantity | 100.0 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 100.0 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Documents worth a look

- **fr-001** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ documentNumber: expected "FA-2026-010400", got "FA-2026-010490"
- **fr-003** (modern, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **EXTRACTION_UNCERTAIN** — 1 reads never passed nor agreed on the same errors: needs human review
  - #1 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
- **fr-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **EXTRACTION_UNCERTAIN** — 1 reads never passed nor agreed on the same errors: needs human review
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **fr-010** (erp, scan, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **EXTRACTION_UNCERTAIN** — 1 reads never passed nor agreed on the same errors: needs human review
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **fr-012** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **EXTRACTION_UNCERTAIN** — 1 reads never passed nor agreed on the same errors: needs human review
  - #1 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
- **fr-016** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **EXTRACTION_UNCERTAIN** — 1 reads never passed nor agreed on the same errors: needs human review
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **fr-019** (modern, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **EXTRACTION_UNCERTAIN** — 1 reads never passed nor agreed on the same errors: needs human review
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **fr-025** (erp, photo) expected VALID → **EXTRACTION_UNCERTAIN** — 1 reads never passed nor agreed on the same errors: needs human review · reconciliation — (expected SIN_DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5: BRACKET_BASE_MISMATCH
  - ≠ printedTaxBreakdown: expected [{"rate":5.5,"base":446.68,"tax":24.57},{"rate":20,"base":33.92,"tax":6.78}], got [{"rate":5.5,"base":466.68,"tax":24.57},{"rate":20,"base":33.92,"tax":6.78}]
  - ≠ lines[2].description: expected "ENTRECOTE BOEUF CHAROLAIS", got "ENTRECOTE CHAROLAIS"
