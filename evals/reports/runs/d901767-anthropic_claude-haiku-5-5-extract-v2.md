# Eval run `d901767-anthropic_claude-haiku-5-5-extract-v2`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · ES, FR, IT · 105 docs · 2026-10-19T22:07:45.355Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 94.3 % |
| Documents 100 % correct (first read) | 93.3 % |
| Line F1 | 99.5 % |
| Final status correct | 100.0 % |
| Discrepancy precision | 100.0 % |
| Discrepancy recall | 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % |
| Mean extraction attempts | 1.21 |
| Escalated to stronger model | 0.0 % |
| Triage country accuracy | 100.0 % |
| Triage doc-type accuracy | 100.0 % |
| Reconciliation status correct | 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % |
| Claim amount correct | 100.0 % |
| Claim drafts passing guardrails | 100.0 % |
| Claim judge score (1-5) | 4.74 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.00183 |
| Latency p50 | 7537 ms |
| Latency p95 | 19676 ms |
| Failed runs | 0.00 |

## By country

| Metric | ES | FR | IT | Baseline |
| --- | --- | --- | --- | --- |
| Documents 100 % correct (final) | 93.3 % | 96.7 % | 93.3 % | 93.3 % / 93.3 % / 93.3 % |
| Documents 100 % correct (first read) | 93.3 % | 93.3 % | 93.3 % | 93.3 % / 93.3 % / 93.3 % |
| Line F1 | 99.6 % | 100.0 % | 98.6 % | 99.6 % / 99.4 % / 98.6 % |
| Final status correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy precision | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy recall | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Mean extraction attempts | 1.18 | 1.27 | 1.20 | 1.18 / 1.23 / 1.20 |
| Escalated to stronger model | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Triage country accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Triage doc-type accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Reconciliation status correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim amount correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim drafts passing guardrails | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim judge score (1-5) | 4.67 | 4.71 | 4.86 | 4.67 / 4.86 / 4.57 |
| Claims with invented data | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Cost / doc | $0.00177 | $0.00191 | $0.00185 | $0.00174 / $0.00186 / $0.00186 |
| Latency p50 | 7540 ms | 7331 ms | 7530 ms | 7540 ms / 7331 ms / 7530 ms |
| Latency p95 | 19331 ms | 19676 ms | 21576 ms | 18080 ms / 18358 ms / 23850 ms |
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
| ES | threshold | Cost / doc | 0.0018 | ≤ 0.005 | ✔ |
| ES | threshold | Latency p95 | 19331 | ≤ 30000 | ✔ |
| ES | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| ES | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| ES | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Line F1 | 0.9959 | ≥ 94.6 % (baseline 99.6 %) | ✔ |
| FR | threshold | Documents 100 % correct (final) | 0.9667 | ≥ 0.8 | ✔ |
| FR | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| FR | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| FR | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| FR | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| FR | threshold | Claim judge score (1-5) | 4.7143 | ≥ 3.5 | ✔ |
| FR | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| FR | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| FR | threshold | Latency p95 | 19676 | ≤ 30000 | ✔ |
| FR | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| FR | regression | Documents 100 % correct (final) | 0.9667 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| FR | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Line F1 | 1 | ≥ 94.4 % (baseline 99.4 %) | ✔ |
| IT | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.8 | ✔ |
| IT | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| IT | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| IT | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| IT | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| IT | threshold | Claim judge score (1-5) | 4.8571 | ≥ 3.5 | ✔ |
| IT | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| IT | threshold | Cost / doc | 0.0018 | ≤ 0.005 | ✔ |
| IT | threshold | Latency p95 | 21576 | ≤ 30000 | ✔ |
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
| es-002 | 2.75 | 2.75 | llm | 5/5 | The e-mail cites invoice FV26-000819 dated 20/09/2026 and reproduces the line 5 discrepancy exactly as in the facts. It states the claimed amount as 2,75 EUR IVA incluido, is written entirely in formal Spanish, and adds no figures, dates or commitments beyond the facts. It is ready to send unchanged. |
| es-003 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice EB-20262306 dated 15/09/2026 and the only issue (line 7, 8 % rate not allowed, with the 4/10/21 % list). Since no amount is given, it correctly asks for a corrective invoice without inventing a figure. It is in Spanish, formal and courteous, and adds no invented data, so it can be sent unchanged. |
| es-011 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice F-2026/04110 dated 13/10/2026 and reproduces the single total discrepancy exactly (126,08 + 5,04 = 131,12 vs 129,12, difference 2,00). Because no amount is claimed, it correctly asks for a corrected invoice without inventing a figure. It is written entirely in Spanish, in a formal and courteous tone, with no invented data, so it is ready to send. |
| es-013 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice EB-20262336 and its date 23/09/2026, and mentions line 7 with the invalid 8 % VAT rate and the allowed rates (4, 10, 21 %). No amount is claimed in the facts, so it correctly asks for a corrective invoice without inventing one. It is written entirely in formal, courteous Spanish and adds no invented data, so it is ready to send. |
| es-016 | 3.10 | 3.10 | llm | 3/5 | The e-mail cites the invoice number, date, the single issue and the amount 3,10 EUR IVA incluido correctly, with a courteous tone and no invented data. However, the issue line was copied verbatim with English fragments ('VAT', 'printed total'), so it is not written entirely in Spanish and needs a fix before sending. |
| es-028 | 1.21 | 1.21 | llm | 5/5 | The e-mail cites invoice EB-20262381 and its date 07/10/2026, and describes the only affected line (line 1) with the exact figures from the facts. It states the claimed amount 1,21 EUR with 'IVA incluido', is in formal and courteous Spanish, and adds no invented data or commitments, so it is ready to send unchanged. |
| es-039 | 5.27 | 5.27 | llm | 5/5 | The e-mail gives the invoice number F-2026/04139 and date 16/09/2026, the single affected line (Patata agria, 15.7 kg invoiced vs 10 kg delivered) and the exact amount of 5,27 EUR IVA incluido. It is in formal, courteous Spanish with no threats. It adds no figures, dates or commitments beyond the facts, so it is ready to send as is. |
| es-041 | 80.88 | 80.88 | llm | 5/5 | The e-mail cites invoice FV26-001099 and the date 24/09/2026, lists the single delivery discrepancy (invoiced 26, delivered 14), and states 80,88 EUR IVA incluido exactly as in the facts. It is written entirely in Spanish in a formal, courteous tone, and requests a corrective invoice or credit note without inventing any data, so it is ready to send. |
| es-043 | 126.32 | 126.32 | llm | 4/5 | The e-mail cites invoice EB-20262429 and the date 21/09/2026, describes the one affected line (6 cajas of Cerveza Ambar Especial 33cl not on the albarán) and states 126,32 EUR IVA incluido exactly as in the facts. It is formal, courteous and in Spanish, and it invents no figures, dates or names. The only reservation is the optional request for confirmation of the albarán, which goes beyond the facts and slightly weakens the claim, so it needs a minor edit. |
| fr-003 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice CB26014 of 16/09/2026 and line 4 with the non-allowed 7 % rate, and it asks for a corrective invoice without inventing an amount. Nothing is invented, and the tone is formal and courteous. Minor style edits are needed: the request is repeated ("nous la rectifier" and then "facture rectificative"), "Merci" appears too often, and the French decimal should be written "5,5" instead of "5.5". |
| fr-006 | 1.50 | 1.50 | llm | 5/5 | The e-mail cites invoice F26/07145 dated 15/10/2026 and reproduces the total discrepancy exactly (236,64 + 16,47 = 253,11 against 254,61, a difference of 1,50). It states the claimed amount as 1,50 EUR TTC, is written entirely in formal, courteous French, and adds no figures, dates or commitments beyond the facts. The only redundancy is that the issue is described twice, which is harmless, so it is ready to send. |
| fr-010 | 1.26 | 1.26 | llm | 5/5 | The e-mail gives the invoice number F26/07181 and the date 21/09/2026. It reproduces the line 2 calculation error exactly as in the facts and states the claimed amount as 1,26 EUR TTC. It is in French, formal and courteous, and adds no figures or commitments beyond a request for a corrective invoice or credit note, so it is ready to send. |
| fr-016 | 1.44 | 1.44 | llm | 5/5 | The e-mail gives invoice HPA-2660 dated 03/10/2026, quotes line 4 with the exact calculation (6 × 6,40 = 38,40 ≠ 39,60) and states the amount of 1,44 EUR TTC as in the facts. It is in formal, courteous French and adds no data, threats or commitments beyond the facts. It can be sent as is. |
| fr-019 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites invoice CB26126 dated 26/09/2026, reproduces the total discrepancy (281,20 + 49,83 = 331,03 ≠ 332,53, Δ 1,50), and states 1,50 EUR TTC exactly as in the facts. It is in French and formal, and it invents no data. Minor style issues: it has two closings ("salutations distinguées" and "Cordialement"), and the "avoir" option goes slightly beyond the facts' request for a correction. |
| fr-027 | 25.92 | 25.92 | llm | 5/5 | The e-mail cites invoice CB26189 dated 16/09/2026, the single affected line (invoiced 4, delivered 3 caisses) and the exact amount of 25,92 EUR TTC. It is entirely in French, formal and courteous, and invents nothing: the 'une caisse non livrée' wording follows directly from 4 vs 3, and 'Service Achats' is a generic signature. It is ready to send as is. |
| fr-029 | 94.80 | 94.80 | llm | 5/5 | The e-mail cites invoice HPA-2716 dated 20/09/2026, mentions the single affected line (5 cartons of Serviettes papier 40x40 absent from the bon de livraison) and states 94,80 EUR TTC exactly. It is entirely in French, formal and courteous, with no invented data or threats; the request for a corrective invoice or credit note is reasonable, so it is ready to send. |
| it-002 | 1.24 | 1.24 | llm | 5/5 | The e-mail cites invoice SV/26/005205 of 05/10/2026 and the only listed issue, line 2 MOZZARELLA FIOR DI LATTE, with the exact figures from the facts. It states 1,24 EUR IVA inclusa as given, is written entirely in formal Italian, and adds no invented data. It can be sent as is. |
| it-006 | 3.10 | 3.10 | llm | 5/5 | The e-mail cites invoice SV/26/005225 of 13/10/2026 and reproduces the total discrepancy exactly (247,63 + 23,89 = 271,52 vs 274,62, difference 3,10). It states the claimed amount as 3,10 EUR IVA inclusa, is written entirely in formal Italian, and introduces no data absent from the facts. Requesting a corrected invoice or credit note is a standard, non-threatening request, so it is ready to send. |
| it-007 | 1.22 | 1.22 | llm | 5/5 | The e-mail is written in Italian and cites invoice EDV-2026-00892 dated 12/09/2026. It covers the only issue (line 2, 9 × 2,80 = 25,20 ≠ 26,20) and states 1,22 EUR IVA inclusa exactly as in the facts. The tone is formal and courteous, and nothing is invented; asking for a credit note or corrected invoice is a reasonable request, not an invented commitment. It is ready to send as is. |
| it-018 | 0.00 | 0.00 | llm | 4/5 | L'e-mail riporta correttamente numero e data della fattura, la riga 2 con l'aliquota 21 % non ammessa e le aliquote consentite, il tutto in italiano formale e cortese. Poiché non c'è alcun importo, chiede una fattura corretta senza inventarne uno. L'unica aggiunta è l'alternativa della nota di credito, che non è nei fatti e andrebbe valutata o eliminata prima dell'invio, quindi servono solo piccole modifiche di stile. |
| it-021 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice 1260/2026 dated 20/09/2026 and reports the total discrepancy with the exact figures from the facts (92,25 + 3,69 = 95,94 ≠ 93,94, Δ 2,00). Since no amount is claimed, it asks for a corrected invoice, or a credit note and new invoice, without inventing any figures. It is written in formal, courteous Italian and is ready to send as is. |
| it-027 | 10.25 | 10.25 | llm | 5/5 | L'e-mail riporta correttamente numero e data della fattura, l'unica riga contestata con le quantità esatte (13 fatturati, 10 consegnati) e l'importo di 10,25 EUR IVA inclusa. È interamente in italiano, formale e cortese, senza minacce né dati inventati. La richiesta di nota di credito o fattura corretta è un'azione ragionevole e non introduce cifre o impegni non presenti nei fatti. |
| it-029 | 46.28 | 46.28 | llm | 5/5 | The e-mail cites invoice PPE 368/26 of 17/09/2026, describes the single delivery issue (olive oil 5L, 1 can invoiced but not on the DDT), and states 46,28 EUR IVA inclusa exactly as in the facts. It is written entirely in formal, courteous Italian with no threats and no invented data, so it is ready to send as is. |

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
| lines.description | 99.5 % |
| lines.quantity | 100.0 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 100.0 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Documents worth a look

- **es-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **es-003** (moderna, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **es-005** (ticket, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "T-77172", got "9-77172"
- **es-011** (clasica, scan, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **es-013** (moderna, scan, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **es-016** (clasica, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **es-018** (moderna, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **es-022** (erp, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **es-028** (moderna, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **es-030** (ticket, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "T-77497", got "T-7749"
- **es-041** (erp, photo, planted DELIVERY_SHORT) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — billed goods not delivered (80.88 incl. VAT, confirmed by a re-read of the delivery note) · reconciliation DISCREPANCIA (expected DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[0].description: expected "JAMON CEBO IBERICO LONCHEADO 100G", got "JAMON CERDO IBERICO LONCHEADO 100G"
- **fr-001** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "FA-2026-010400", got "FA-2026-010490"
- **fr-003** (modern, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **fr-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **fr-010** (erp, scan, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **fr-012** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **fr-016** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **fr-019** (modern, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **fr-025** (erp, photo) expected VALID → **VALID** — All checks passed after 3 reads (self-corrected, confirmed by a blind read) · reconciliation SIN_DISCREPANCIA (expected SIN_DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5:BRACKET_BASE_MISMATCH
  - #2 primary anthropic:claude-haiku-5-5:pass
  - #3 primary (blind) anthropic:claude-haiku-5-5:pass · exact
- **it-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **it-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **it-007** (modern, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **it-013** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[0].description: expected "Carciofi romaneschi", got "Carciofi romanesch i"
- **it-017** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **it-018** (erp, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **it-021** (classic, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **it-026** (delivery-note, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ recipient.taxId: expected "09123456700", got "09123456500"
  - ≠ lines[0].description: expected "PELLICOLA ALIMENTARE 300M", got "PELLICOLA ALIMENTARI 300M"
