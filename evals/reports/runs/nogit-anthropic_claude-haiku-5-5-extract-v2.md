# Eval run `nogit-anthropic_claude-haiku-5-5-extract-v2`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · ES · 30 docs · 2026-10-18T21:15:23.804Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 93.3 % |
| Documents 100 % correct (first read) | 93.3 % |
| Line F1 | 100.0 % |
| Final status correct | 100.0 % |
| Discrepancy precision | 100.0 % |
| Discrepancy recall | 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % |
| Mean extraction attempts | 1.27 |
| Escalated to stronger model | 0.0 % |
| Triage country accuracy | 100.0 % |
| Triage doc-type accuracy | 100.0 % |
| Cost / doc | $0.00164 |
| Latency p50 | 7132 ms |
| Latency p95 | 14529 ms |
| Failed runs | 0.00 |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 22 | 0 | 0 | 0 |
| SUPPLIER_DISCREPANCY | 0 | 6 | 0 | 0 |
| INVALID_TAX_ID | 0 | 0 | 2 | 0 |
| EXTRACTION_UNCERTAIN | 0 | 0 | 0 | 0 |

## Field accuracy (final read)

| Field | Accuracy |
| --- | --- |
| docType | 100.0 % |
| documentNumber | 93.3 % |
| issueDate | 100.0 % |
| currency | 100.0 % |
| issuer.name | 100.0 % |
| issuer.taxId | 100.0 % |
| recipient.name | 100.0 % |
| recipient.taxId | 100.0 % |
| printedTaxBreakdown | 100.0 % |
| printedTotal | 100.0 % |
| lines.description | 100.0 % |
| lines.quantity | 100.0 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 100.0 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Documents worth a look

- **es-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **es-003** (moderna, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
- **es-005** (ticket, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ documentNumber: expected "T-77172", got "9-77172"
- **es-011** (clasica, scan, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **es-013** (moderna, scan, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
- **es-016** (clasica, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **es-018** (moderna, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
- **es-022** (erp, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
- **es-028** (moderna, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **es-030** (ticket, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ documentNumber: expected "T-77497", got "T-7749"
