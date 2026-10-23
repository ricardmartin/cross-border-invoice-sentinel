# Eval run `2427852-anthropic_claude-haiku-5-5-extract-v2`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · ES · 45 docs · 2026-10-18T21:43:34.708Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 93.3 % |
| Documents 100 % correct (first read) | 93.3 % |
| Line F1 | 99.6 % |
| Final status correct | 100.0 % |
| Discrepancy precision | 100.0 % |
| Discrepancy recall | 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % |
| Mean extraction attempts | 1.18 |
| Escalated to stronger model | 0.0 % |
| Triage country accuracy | 100.0 % |
| Triage doc-type accuracy | 100.0 % |
| Reconciliation status correct | 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % |
| Claim amount correct | 100.0 % |
| Claim drafts passing guardrails | 100.0 % |
| Claim judge score (1-5) | 4.67 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.00174 |
| Latency p50 | 7540 ms |
| Latency p95 | 18080 ms |
| Failed runs | 0.00 |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 34 | 0 | 0 | 0 |
| SUPPLIER_DISCREPANCY | 0 | 9 | 0 | 0 |
| INVALID_TAX_ID | 0 | 0 | 2 | 0 |
| EXTRACTION_UNCERTAIN | 0 | 0 | 0 | 0 |

## Claims (judged by LLM, then approved by eval-bot)

| Doc | Amount | Expected | Draft | Judge | Justification |
| --- | --- | --- | --- | --- | --- |
| es-002 | 2.75 | 2.75 | llm | 4/5 | The e-mail cites the invoice number and date, describes the line 5 discrepancy exactly as in the facts, and states 2,75 EUR IVA incluido. It is in formal Spanish with no invented data. The only style issue is the slightly odd wording 'nota de crédito corregida', so a minor edit is needed. |
| es-003 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice EB-20262306 dated 15/09/2026 and line 7 with the disallowed 8 % VAT rate, and it correctly asks for a corrected document without inventing an amount. It is in Spanish with a formal, courteous tone and adds no data beyond the facts. Minor style edits are needed: "Le agradeceríamos" should be "Les agradeceríamos", and the sentence "No indicamos importe reclamado" is awkward and could be dropped or reworded. |
| es-011 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice F-2026/04110 dated 13/10/2026 and reproduces the total discrepancy exactly (126,08 + 5,04 = 131,12 vs 129,12, Δ 2,00). Since no amount is claimed, it correctly requests a corrected invoice without inventing a figure. It is written entirely in formal, courteous Spanish with no invented data, so it is ready to send. |
| es-013 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice EB-20262336 and date 23/09/2026, and mentions line 7 (Zumo de naranja 1L) with the disallowed 8% rate and the permitted rates 4, 10 and 21%. No amount is given in the facts, and the e-mail correctly asks for a corrective invoice or credit note without inventing one. It is in Spanish, formal and courteous, with no invented data, so it is ready to send. |
| es-016 | 3.10 | 3.10 | llm | 5/5 | The e-mail cites invoice F-2026/04115 and the date 20/09/2026, and reproduces the total discrepancy exactly (bases 75,91 + cuotas 3,85 = 79,76 vs. 82,86, difference 3,10 EUR, VAT included). It is written entirely in Spanish in a formal, courteous tone, and asks for a corrective invoice or credit note without adding any invented figures, dates or commitments. It is ready to send as is. |
| es-028 | 1.21 | 1.21 | llm | 4/5 | The e-mail cites invoice EB-20262381 dated 07/10/2026, the line 1 discrepancy and the exact amount of 1,21 EUR IVA incluido, all in formal Spanish with no threats. The only weakness is the awkward copied phrasing "consta 3 × 13,90 = 41,70 ≠ 42,70 impreso", which needs a minor style edit. Asking for a corrective invoice or credit note is a reasonable request and not invented data. |
| es-039 | 5.27 | 5.27 | llm | 5/5 | The e-mail is written in Spanish and cites invoice F-2026/04139 dated 16/09/2026. It covers the only issue (Patata agria, 15.7 kg invoiced vs 10 kg delivered) and states the amount exactly as 5,27 EUR including VAT. The tone is formal and courteous, with no invented data or threats, and the request for a corrective invoice or credit note is reasonable, so it can be sent as is. |
| es-041 | 80.88 | 80.88 | llm | 5/5 | The e-mail cites invoice FV26-001099 dated 24/09/2026, names the affected line with invoiced 26 vs delivered 14, and states the exact amount of 80,88 EUR including VAT. It is in Spanish, formal and courteous, and requests a corrective invoice or credit note without adding any invented data, so it is ready to send as is. |
| es-043 | 126.32 | 126.32 | llm | 5/5 | The e-mail cites invoice EB-20262429 and its date, 21/09/2026, and mentions the one affected line (6 caja of Cerveza Ambar Especial 33cl, not on the albarán). It states 126,32 EUR including VAT exactly as in the facts. It is written entirely in formal, courteous Spanish and invents nothing; requesting a credit note or albarán confirmation is a reasonable, non-threatening request, so it is ready to send. |

## Field accuracy (final read)

| Field | Accuracy |
| --- | --- |
| docType | 100.0 % |
| documentNumber | 95.6 % |
| issueDate | 100.0 % |
| currency | 100.0 % |
| issuer.name | 100.0 % |
| issuer.taxId | 100.0 % |
| recipient.name | 100.0 % |
| recipient.taxId | 100.0 % |
| printedTaxBreakdown | 100.0 % |
| printedTotal | 100.0 % |
| lines.description | 99.6 % |
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
- **es-041** (erp, photo, planted DELIVERY_SHORT) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — billed goods not delivered (80.88 incl. VAT, confirmed by a re-read of the delivery note) · reconciliation DISCREPANCIA (expected DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ lines[0].description: expected "JAMON CEBO IBERICO LONCHEADO 100G", got "JAMON CERDO IBERICO LONCHEADO 100G"
