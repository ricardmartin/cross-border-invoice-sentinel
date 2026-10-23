# Eval run `1666ace-anthropic_claude-haiku-5-5-extract-v2`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · ES, FR, IT · 105 docs · 2026-10-18T22:03:18.054Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 93.3 % |
| Documents 100 % correct (first read) | 93.3 % |
| Line F1 | 99.3 % |
| Final status correct | 100.0 % |
| Discrepancy precision | 100.0 % |
| Discrepancy recall | 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % |
| Mean extraction attempts | 1.20 |
| Escalated to stronger model | 0.0 % |
| Triage country accuracy | 100.0 % |
| Triage doc-type accuracy | 100.0 % |
| Reconciliation status correct | 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % |
| Claim amount correct | 100.0 % |
| Claim drafts passing guardrails | 100.0 % |
| Claim judge score (1-5) | 4.70 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.00181 |
| Latency p50 | 7537 ms |
| Latency p95 | 18358 ms |
| Failed runs | 0.00 |

## By country

| Metric | ES | FR | IT | Baseline |
| --- | --- | --- | --- | --- |
| Documents 100 % correct (final) | 93.3 % | 93.3 % | 93.3 % | 93.3 % / 93.3 % / 93.3 % |
| Documents 100 % correct (first read) | 93.3 % | 93.3 % | 93.3 % | 93.3 % / 93.3 % / 93.3 % |
| Line F1 | 99.6 % | 99.4 % | 98.6 % | 99.6 % / 99.4 % / 98.6 % |
| Final status correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy precision | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy recall | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Mean extraction attempts | 1.18 | 1.23 | 1.20 | 1.18 / 1.23 / 1.20 |
| Escalated to stronger model | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Triage country accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Triage doc-type accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Reconciliation status correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim amount correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim drafts passing guardrails | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim judge score (1-5) | 4.67 | 4.86 | 4.57 | 4.67 / 4.86 / 4.57 |
| Claims with invented data | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Cost / doc | $0.00174 | $0.00186 | $0.00186 | $0.00174 / $0.00186 / $0.00186 |
| Latency p50 | 7540 ms | 7331 ms | 7530 ms | 7540 ms / 7331 ms / 7530 ms |
| Latency p95 | 18080 ms | 18358 ms | 23850 ms | 18080 ms / 18358 ms / 23850 ms |
| Failed runs | 0.00 | 0.00 | 0.00 | 0.00 / 0.00 / 0.00 |

## Gate (PASSED)

| Country | Check | Metric | Value | Limit | |
| --- | --- | --- | --- | --- | --- |
| ES | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.85 | ✔ |
| ES | threshold | Final status correct | 1 | ≥ 0.95 | ✔ |
| ES | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| ES | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| ES | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| ES | threshold | Claim judge score (1-5) | 4.6667 | ≥ 3.5 | ✔ |
| ES | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| ES | threshold | Cost / doc | 0.0017 | ≤ 0.005 | ✔ |
| ES | threshold | Latency p95 | 18080 | ≤ 30000 | ✔ |
| ES | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| ES | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| ES | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Line F1 | 0.9959 | ≥ 94.6 % (baseline 99.6 %) | ✔ |
| FR | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.8 | ✔ |
| FR | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| FR | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| FR | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| FR | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| FR | threshold | Claim judge score (1-5) | 4.8571 | ≥ 3.5 | ✔ |
| FR | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| FR | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| FR | threshold | Latency p95 | 18358 | ≤ 30000 | ✔ |
| FR | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| FR | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| FR | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Line F1 | 0.9938 | ≥ 94.4 % (baseline 99.4 %) | ✔ |
| IT | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.8 | ✔ |
| IT | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| IT | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| IT | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| IT | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| IT | threshold | Claim judge score (1-5) | 4.5714 | ≥ 3.5 | ✔ |
| IT | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| IT | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| IT | threshold | Latency p95 | 23850 | ≤ 30000 | ✔ |
| IT | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| IT | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| IT | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Line F1 | 0.9865 | ≥ 93.6 % (baseline 98.6 %) | ✔ |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 78 | 0 | 0 | 0 |
| SUPPLIER_DISCREPANCY | 0 | 23 | 0 | 0 |
| INVALID_TAX_ID | 0 | 0 | 4 | 0 |
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
| fr-003 | 0.00 | 0.00 | llm | 5/5 | The e-mail is in French and cites invoice CB26014 dated 16/09/2026. It identifies line 4 "Eau minérale 1L (x6)" with the 7 % VAT rate and the permitted rates (5.5, 10, 20 %). Because no amount is claimed, it correctly asks for a corrective invoice without inventing a figure, and it adds no invented data. The tone is formal and courteous, so it can be sent as is. |
| fr-006 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites invoice F26/07145 of 15/10/2026, restates the total discrepancy (236,64 + 16,47 = 253,11 vs 254,61, a difference of 1,50) and claims exactly 1,50 EUR VAT included, all matching the facts. It is in French with a formal, courteous tone and no invented data. Minor style edits are needed: "nous vous remercions" appears three times and the first sentence is awkward. Offering "un avoir" as an alternative to a corrective invoice is a small liberty but not a factual invention. |
| fr-010 | 1.26 | 1.26 | llm | 5/5 | The e-mail cites invoice F26/07181 of 21/09/2026, the parties, and line 2 (SAUCISSE DE TOULOUSE) with the exact calculation and printed amount from the facts. It states 1,26 EUR TTC, which matches the facts and amountIncludesVat=true. It is written entirely in French in a formal, courteous tone, and the request for a corrective invoice or credit note adds no invented data, so it is ready to send. |
| fr-016 | 1.44 | 1.44 | llm | 5/5 | The e-mail cites invoice HPA-2660 dated 03/10/2026, describes the line 4 discrepancy (6 × 6,40 = 38,40 ≠ 39,60) and states the claimed amount of 1,44 EUR including VAT, exactly as in the facts. It is written entirely in French, in a formal and courteous tone. It invents nothing: the request for a corrective invoice or credit note is a reasonable ask, not a fabricated figure or commitment. It is ready to send as is. |
| fr-019 | 1.50 | 1.50 | llm | 5/5 | The e-mail is in French and cites invoice CB26126 of 26/09/2026. It describes the total discrepancy with the exact figures (281,20 + 49,83 = 331,03 vs 332,53) and states the 1,50 EUR amount, VAT included. The tone is formal and courteous, with no threats, and nothing is invented. Asking for a corrective invoice or credit note is a reasonable request and not an invented commitment. |
| fr-027 | 25.92 | 25.92 | llm | 5/5 | The e-mail cites invoice CB26189 dated 16/09/2026, names the affected line with the invoiced and delivered quantities, and states 25,92 EUR TVA incluse exactly as in the facts. It is written entirely in French, in a formal and courteous tone, and requests a credit note or corrective invoice without inventing any data or commitments. It is ready to send unchanged. |
| fr-029 | 94.80 | 94.80 | llm | 5/5 | The e-mail cites invoice HPA-2716 dated 20/09/2026 and the single affected line (5 cartons of paper napkins not on the delivery note) with the exact amount of 94,80 EUR incl. VAT. It is written in formal, courteous French, requests a corrective invoice or credit note, and adds no invented data, so it is ready to send as is. |
| it-002 | 1.24 | 1.24 | llm | 5/5 | The e-mail cites invoice SV/26/005205 dated 05/10/2026, line 2 (MOZZARELLA FIOR DI LATTE) with the exact calculation discrepancy, and the claimed amount of 1,24 EUR VAT included. It is written entirely in Italian in a formal, courteous tone and invents no data, so it can be sent unchanged. |
| it-006 | 3.10 | 3.10 | llm | 5/5 | The e-mail is in Italian and cites invoice SV/26/005225 of 13/10/2026. It reports the total discrepancy using the exact figures from the facts (247,63 + 23,89 = 271,52 vs 274,62) and claims 3,10 EUR VAT included. The tone is formal and courteous, and nothing is invented, so it is ready to send. |
| it-007 | 1.22 | 1.22 | llm | 4/5 | The e-mail cites the invoice number and date, line 2 with its calculation discrepancy, and the amount of 1,22 EUR IVA inclusa exactly as in the facts. The tone is formal and courteous. However, the Spanish word "impreso" was copied from the facts and left in the Italian text (it should be "stampato"), so a minor edit is needed before sending. Offering a credit note as an alternative is reasonable and not a figure or commitment invented. |
| it-018 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice SV/26/005285 of 14/09/2026 and line 2 ("PELLICOLA ALIMENTARE 300M") with the disallowed 21% rate and the permitted rates 4, 5, 10 and 22%. It is in correct, formal Italian and requests a corrected invoice without inventing an amount. The only blemish is the optional "nota di credito", which the facts do not mention, so a minor edit is advisable before sending. |
| it-021 | 0.00 | 0.00 | llm | 4/5 | The e-mail is in Italian and formal. It cites invoice 1260/2026 of 20/09/2026 and the total discrepancy with the exact figures (92,25 + 3,69 = 95,94 vs 93,94, Δ 2,00), and it asks for a corrected invoice without inventing an amount. The only blemish is that it offers a credit note as an alternative, which the facts do not mention, plus the translation of 'cuotas' as 'imposte' instead of 'IVA'. Both are minor style edits, so it is nearly ready to send. |
| it-027 | 10.25 | 10.25 | llm | 5/5 | The e-mail cites invoice EDV-2026-00934 of 21/09/2026, the affected line (13 invoiced vs 10 delivered) and the exact amount of 10,25 EUR including VAT. It is written entirely in formal Italian, with a courteous tone and no threats. The signature uses only the department and the restaurant name from the facts, and nothing is invented, so it is ready to send as is. |
| it-029 | 46.28 | 46.28 | llm | 5/5 | The e-mail cites invoice PPE 368/26 of 17/09/2026 and the olive oil line (1 latta invoiced but missing from the DDT). It states 46,28 EUR including VAT exactly as in the facts. It is written in formal, courteous Italian and invents no data, so it can be sent unchanged. |

## Field accuracy (final read)

| Field | Accuracy |
| --- | --- |
| docType | 100.0 % |
| documentNumber | 97.1 % |
| issueDate | 100.0 % |
| currency | 100.0 % |
| issuer.name | 100.0 % |
| issuer.taxId | 100.0 % |
| recipient.name | 100.0 % |
| recipient.taxId | 99.0 % |
| printedTaxBreakdown | 100.0 % |
| printedTotal | 100.0 % |
| lines.description | 99.3 % |
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
- **fr-001** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ documentNumber: expected "FA-2026-010400", got "FA-2026-010490"
- **fr-003** (modern, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
- **fr-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **fr-010** (erp, scan, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **fr-012** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
- **fr-016** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **fr-019** (modern, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **fr-025** (erp, photo) expected VALID → **VALID** — All checks passed after 2 reads (self-corrected) · reconciliation SIN_DISCREPANCIA (expected SIN_DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5: BRACKET_BASE_MISMATCH
  - #2 primary anthropic:claude-haiku-5-5: pass
  - ≠ lines[2].description: expected "ENTRECOTE BOEUF CHAROLAIS", got "ENTRECOTE CHAROLAIS"
- **it-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **it-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **it-007** (modern, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5: LINE_MATH · exact
- **it-013** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ lines[0].description: expected "Carciofi romaneschi", got "Carciofi romanesch i"
- **it-017** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5: INVALID_TAX_ID · exact
- **it-018** (erp, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5: RATE_NOT_ALLOWED · exact
- **it-021** (classic, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5: TOTAL_MISMATCH · exact
- **it-026** (delivery-note, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5: pass
  - ≠ recipient.taxId: expected "09123456700", got "09123456500"
  - ≠ lines[0].description: expected "PELLICOLA ALIMENTARE 300M", got "PELLICOLA ALIMENTARI 300M"
