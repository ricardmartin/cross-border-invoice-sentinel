# Eval run `6775a07-anthropic_claude-haiku-5-5-extract-v3-smoke`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v3` · DE, DK, ES, FR, GB, IE, IT, PT · 11 docs · 2026-11-01T17:36:00.164Z

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
| Cost / doc | $0.00242 |
| Latency p50 | 11077 ms |
| Latency p95 | 23060 ms |
| Failed runs | 0.00 |

## By country

| Metric | ES | FR | IT | Baseline |
| --- | --- | --- | --- | --- |
| Documents 100 % correct (final) | 80.0 % | 66.7 % | 100.0 % | 93.2 % / 90.0 % / 97.0 % |
| Documents 100 % correct (first read) | 80.0 % | 66.7 % | 100.0 % | 93.2 % / 90.0 % / 97.0 % |
| Line F1 | 96.2 % | 100.0 % | 100.0 % | 99.4 % / 99.4 % / 99.4 % |
| Final status correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy precision | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy recall | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Mean extraction attempts | 1.40 | 1.67 | 1.67 | 1.22 / 1.20 / 1.21 |
| Escalated to stronger model | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Triage country accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Triage doc-type accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Reconciliation status correct | 100.0 % | — | — | 100.0 % / 100.0 % / 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim amount correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim drafts passing guardrails | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim judge score (1-5) | 5.00 | 4.00 | 5.00 | 4.71 / 4.71 / 4.75 |
| Claims with invented data | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Cost / doc | $0.00232 | $0.00261 | $0.00238 | $0.00205 / $0.00194 / $0.00198 |
| Latency p50 | 11077 ms | 11262 ms | 10059 ms | 7811 ms / 8582 ms / 7525 ms |
| Latency p95 | 23060 ms | 20977 ms | 15917 ms | 23805 ms / 20277 ms / 26135 ms |
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
| es-011 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice F-2026/04110 dated 13/10/2026 and reproduces the single total discrepancy exactly (126,08 + 5,04 = 131,12 vs 129,12, difference 2,00). No amount is claimed, and it correctly asks for a corrected invoice without inventing one. It is in formal, courteous Spanish and adds no unsupported data, so it is ready to send; the mention of a credit note is a reasonable alternative and not an invented figure. |
| es-041 | 80.88 | 80.88 | llm | 5/5 | The e-mail cites invoice FV26-001099 dated 24/09/2026, lists the single affected line with invoiced 26 vs delivered 14, and states 80,88 EUR IVA incluido exactly as in the facts. It is entirely in Spanish, formal and courteous, and the request for a corrective invoice or credit note is a reasonable ask, not invented data. It is ready to send unchanged. |
| fr-006 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites the invoice number and date, reproduces the total discrepancy (236,64 + 16,47 = 253,11 vs 254,61) and states the 1,50 EUR TTC difference exactly as in the facts. It is in French, formal and courteous, and invents no figures. The one minor style flaw is the redundant double closing ("salutations distinguées" followed by "Cordialement"), and the optional mention of an "avoir" goes slightly beyond the facts. |
| it-002 | 1.24 | 1.24 | llm | 5/5 | The e-mail cites invoice SV/26/005205 of 05/10/2026 and the only listed issue, line 2 (MOZZARELLA FIOR DI LATTE) with the exact figures. It states 1,24 EUR IVA inclusa as in the facts. It is written entirely in formal, courteous Italian, invents nothing, and is ready to send unchanged. |

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
| printedCharges | 100.0 % |
| printedTotal | 100.0 % |
| documentControlCode | 100.0 % |
| lines.description | 98.2 % |
| lines.quantity | 100.0 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 100.0 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Documents worth a look

- **es-011** (clasica, scan, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **es-018** (moderna, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **es-041** (erp, photo, planted DELIVERY_SHORT) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — billed goods not delivered (80.88 incl. VAT, confirmed by a re-read of the delivery note) · reconciliation DISCREPANCIA (expected DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[0].description: expected "JAMON CEBO IBERICO LONCHEADO 100G", got "JAMON CERDO IBERICO LONCHEADO 100G"
- **fr-001** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "FA-2026-010400", got "FA-2026-010490"
- **fr-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **fr-012** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **it-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **it-017** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
