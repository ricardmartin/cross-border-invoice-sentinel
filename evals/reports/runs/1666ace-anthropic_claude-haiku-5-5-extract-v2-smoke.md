# Eval run `1666ace-anthropic_claude-haiku-5-5-extract-v2-smoke`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · ES, FR, IT · 11 docs · 2026-10-18T22:02:54.544Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 81.8 % |
| Documents 100 % correct (first read) | 81.8 % |
| Line F1 | 98.2 % |
| Final status correct | 100.0 % |
| Discrepancy precision | 100.0 % |
| Discrepancy recall | 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % |
| Mean extraction attempts | 1.55 |
| Escalated to stronger model | 0.0 % |
| Triage country accuracy | 100.0 % |
| Triage doc-type accuracy | 100.0 % |
| Reconciliation status correct | 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % |
| Claim amount correct | 100.0 % |
| Claim drafts passing guardrails | 100.0 % |
| Claim judge score (1-5) | 4.75 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.00226 |
| Latency p50 | 9435 ms |
| Latency p95 | 20280 ms |
| Failed runs | 0.00 |

## By country

| Metric | ES | FR | IT | Baseline |
| --- | --- | --- | --- | --- |
| Documents 100 % correct (final) | 80.0 % | 66.7 % | 100.0 % | 93.3 % / 93.3 % / 93.3 % |
| Documents 100 % correct (first read) | 80.0 % | 66.7 % | 100.0 % | 93.3 % / 93.3 % / 93.3 % |
| Line F1 | 96.2 % | 100.0 % | 100.0 % | 99.6 % / 99.4 % / 98.6 % |
| Final status correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy precision | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy recall | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Mean extraction attempts | 1.40 | 1.67 | 1.67 | 1.18 / 1.23 / 1.20 |
| Escalated to stronger model | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Triage country accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Triage doc-type accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Reconciliation status correct | 100.0 % | — | — | 100.0 % / 100.0 % / 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim amount correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim drafts passing guardrails | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim judge score (1-5) | 5.00 | 4.00 | 5.00 | 4.67 / 4.86 / 4.57 |
| Claims with invented data | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Cost / doc | $0.00217 | $0.00239 | $0.00227 | $0.00174 / $0.00186 / $0.00186 |
| Latency p50 | 11106 ms | 9435 ms | 8649 ms | 7540 ms / 7331 ms / 7530 ms |
| Latency p95 | 19390 ms | 20280 ms | 15292 ms | 18080 ms / 18358 ms / 23850 ms |
| Failed runs | 0.00 | 0.00 | 0.00 | 0.00 / 0.00 / 0.00 |

## Gate (PASSED)

| Country | Check | Metric | Value | Limit | |
| --- | --- | --- | --- | --- | --- |
| ES | threshold | Final status correct | 1 | ≥ 1 | ✔ |
| ES | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| ES | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| FR | threshold | Final status correct | 1 | ≥ 1 | ✔ |
| FR | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| FR | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| IT | threshold | Final status correct | 1 | ≥ 1 | ✔ |
| IT | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| IT | threshold | Failed runs | 0 | ≤ 0 | ✔ |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 4 | 0 | 0 | 0 |
| SUPPLIER_DISCREPANCY | 0 | 4 | 0 | 0 |
| INVALID_TAX_ID | 0 | 0 | 3 | 0 |
| EXTRACTION_UNCERTAIN | 0 | 0 | 0 | 0 |

## Claims (judged by LLM, then approved by eval-bot)

| Doc | Amount | Expected | Draft | Judge | Justification |
| --- | --- | --- | --- | --- | --- |
| es-011 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice F-2026/04110 dated 13/10/2026 and reproduces the total discrepancy exactly (126,08 + 5,04 = 131,12 vs 129,12, Δ 2,00). Since no amount is claimed, it correctly requests a corrected invoice without inventing a figure. It is written entirely in formal, courteous Spanish with no invented data, so it is ready to send. |
| es-041 | 80.88 | 80.88 | llm | 5/5 | The e-mail cites invoice FV26-001099 dated 24/09/2026, names the affected line with invoiced 26 vs delivered 14, and states the exact amount of 80,88 EUR including VAT. It is in Spanish, formal and courteous, and requests a corrective invoice or credit note without adding any invented data, so it is ready to send as is. |
| fr-006 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites invoice F26/07145 of 15/10/2026, restates the total discrepancy (236,64 + 16,47 = 253,11 vs 254,61, a difference of 1,50) and claims exactly 1,50 EUR VAT included, all matching the facts. It is in French with a formal, courteous tone and no invented data. Minor style edits are needed: "nous vous remercions" appears three times and the first sentence is awkward. Offering "un avoir" as an alternative to a corrective invoice is a small liberty but not a factual invention. |
| it-002 | 1.24 | 1.24 | llm | 5/5 | The e-mail cites invoice SV/26/005205 dated 05/10/2026, line 2 (MOZZARELLA FIOR DI LATTE) with the exact calculation discrepancy, and the claimed amount of 1,24 EUR VAT included. It is written entirely in Italian in a formal, courteous tone and invents no data, so it can be sent unchanged. |

## Field accuracy (final read)

| Field | Accuracy |
| --- | --- |
| docType | 100.0 % |
| documentNumber | 90.9 % |
| issueDate | 100.0 % |
| currency | 100.0 % |
| issuer.name | 100.0 % |
| issuer.taxId | 100.0 % |
| recipient.name | 100.0 % |
| recipient.taxId | 100.0 % |
| printedTaxBreakdown | 100.0 % |
| printedTotal | 100.0 % |
| lines.description | 98.2 % |
| lines.quantity | 100.0 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 100.0 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Documents worth a look

- **es-011** (clasica, scan, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **es-018** (moderna, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
- **es-041** (erp, photo, planted DELIVERY_SHORT) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — billed goods not delivered (80.88 incl. VAT, confirmed by a re-read of the delivery note) · reconciliation DISCREPANCIA (expected DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ lines[0].description: expected "JAMON CEBO IBERICO LONCHEADO 100G", got "JAMON CERDO IBERICO LONCHEADO 100G"
- **fr-001** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ documentNumber: expected "FA-2026-010400", got "FA-2026-010490"
- **fr-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **fr-012** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
- **it-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **it-017** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
