# Eval run `90274d1-anthropic_claude-haiku-5-5-extract-v2`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · ES, FR, IT · 105 docs · 2026-10-18T23:57:18.789Z

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
| Claim judge score (1-5) | 4.78 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.00183 |
| Latency p50 | 7537 ms |
| Latency p95 | 19019 ms |
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
| Claim judge score (1-5) | 5.00 | 4.71 | 4.57 | 4.67 / 4.86 / 4.57 |
| Claims with invented data | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Cost / doc | $0.00178 | $0.00187 | $0.00188 | $0.00174 / $0.00186 / $0.00186 |
| Latency p50 | 7540 ms | 7331 ms | 7530 ms | 7540 ms / 7331 ms / 7530 ms |
| Latency p95 | 17911 ms | 17929 ms | 21926 ms | 18080 ms / 18358 ms / 23850 ms |
| Failed runs | 0.00 | 0.00 | 0.00 | 0.00 / 0.00 / 0.00 |

## Gate (PASSED)

| Country | Check | Metric | Value | Limit | |
| --- | --- | --- | --- | --- | --- |
| ES | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.85 | ✔ |
| ES | threshold | Final status correct | 1 | ≥ 0.95 | ✔ |
| ES | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| ES | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| ES | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| ES | threshold | Claim judge score (1-5) | 5 | ≥ 3.5 | ✔ |
| ES | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| ES | threshold | Cost / doc | 0.0018 | ≤ 0.005 | ✔ |
| ES | threshold | Latency p95 | 17911 | ≤ 30000 | ✔ |
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
| FR | threshold | Claim judge score (1-5) | 4.7143 | ≥ 3.5 | ✔ |
| FR | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| FR | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| FR | threshold | Latency p95 | 17929 | ≤ 30000 | ✔ |
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
| IT | threshold | Latency p95 | 21926 | ≤ 30000 | ✔ |
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
| es-002 | 2.75 | 2.75 | llm | 5/5 | The e-mail cites invoice FV26-000819 and its date of 20/09/2026, and it reproduces the only issue, line 5, exactly as in the facts. It states the claimed amount as 2,75 EUR, VAT included, which matches the facts. It is written entirely in formal, courteous Spanish and invents nothing: asking for a corrective invoice or credit note is a request, not an invented commitment. It is ready to send as is. |
| es-003 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice EB-20262306 and its date 15/09/2026, and lists the only issue (line 7, 8 % VAT rate not allowed) exactly as in the facts. It correctly asks for a corrected invoice without inventing an amount, is entirely in Spanish and keeps a formal, courteous tone. It adds no invented data, so it is ready to send. |
| es-011 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites the invoice number F-2026/04110 and date 13/10/2026, and reproduces the sole document issue exactly with its figures. No amount is claimed in the facts, so it correctly asks for a corrected invoice (or credit note) without inventing an amount. It is written in formal, courteous Spanish and is signed by the restaurant's purchasing department, so it is ready to send. |
| es-013 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice EB-20262336 dated 23/09/2026 and the only issue (line 7, 8 % VAT rate not allowed in ES) exactly as in the facts. No amount is given, and it correctly asks for a corrective invoice without inventing one. It is in formal Spanish and adds no invented data. The credit-note alternative is a standard request, not an invented commitment, so it is ready to send. |
| es-016 | 3.10 | 3.10 | llm | 5/5 | The e-mail cites invoice F-2026/04115 and its date 20/09/2026, reproduces the single total discrepancy exactly as in the facts, and states the claimed 3,10 EUR with VAT included. It is written entirely in Spanish in a formal, courteous tone, and it invents no data; the request for a corrective invoice or credit note is a standard ask, not a fabricated commitment. It is ready to send unchanged. |
| es-028 | 1.21 | 1.21 | llm | 5/5 | The e-mail cites invoice EB-20262381 and the date 07/10/2026, and quotes line 1 with the exact discrepancy from the facts. It states 1,21 EUR and correctly notes that VAT is included. It is in formal Spanish with a courteous tone and no threats, and it invents no data; asking for a corrective invoice or credit note is a reasonable request, not an invented fact. |
| es-039 | 5.27 | 5.27 | llm | 5/5 | The e-mail cites the invoice number F-2026/04139 and date 16/09/2026, the single affected line (Patata agria, 15.7 kg invoiced vs 10 kg delivered) and the exact amount of 5,27 EUR including VAT. It is written entirely in Spanish in a formal, courteous tone, and it invents nothing. The request for a corrective invoice or credit note is a reasonable ask rather than an invented commitment, so it is ready to send. |
| es-041 | 80.88 | 80.88 | llm | 5/5 | The e-mail cites invoice FV26-001099 and the date 24/09/2026, lists the single delivery discrepancy (26 invoiced vs 14 delivered) and states 80,88 EUR VAT included exactly as in the facts. It is written entirely in Spanish in a formal, courteous tone, and requests a credit note or corrective invoice without inventing any data, so it is ready to send. |
| es-043 | 126.32 | 126.32 | llm | 5/5 | The e-mail cites invoice EB-20262429 dated 21/09/2026, the single affected line (6 cajas of Cerveza Ambar Especial 33cl not on the albarán) and the exact amount of 126,32 EUR including VAT. It is written entirely in formal Spanish, with a courteous tone and no threats. The request for a corrective invoice or credit note, or confirmation of delivery, is a reasonable ask that adds no invented data, so it is ready to send. |
| fr-003 | 0.00 | 0.00 | llm | 5/5 | The e-mail is written in French and cites invoice CB26014 dated 16/09/2026, line 4 with its description and the disallowed 7% VAT rate, and the permitted rates (5.5, 10, 20 %). With no amount in the facts, it asks for a corrective invoice without inventing one. The tone is formal and courteous, and nothing is invented, so it can be sent as is. |
| fr-006 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites invoice F26/07145 dated 15/10/2026, reproduces the single total discrepancy with the exact figures, and states the amount claimed as 1,50 EUR TVA incluse. It is entirely in French and courteous, and it invents nothing. The only minor style issue is the informal 'Bonjour' opening paired with a very formal 'Madame, Monsieur' closing, which could be harmonised. |
| fr-010 | 1.26 | 1.26 | llm | 4/5 | The e-mail gives the invoice number F26/07181 and date 21/09/2026, lists the single faulty line 2 with the exact figures, and states the claimed amount of 1,26 EUR VAT included as in the facts. It is in French, formal and courteous, and adds nothing beyond the facts. The only flaw is a minor style one: the closing uses both 'salutations distinguées' and 'Cordialement', which is redundant. |
| fr-016 | 1.44 | 1.44 | llm | 5/5 | The e-mail cites invoice HPA-2660 dated 03/10/2026 and the only affected line (line 4) with the exact calculation from the facts. It states 1,44 EUR TVA incluse exactly as given, is written entirely in formal French, and adds no invented figures or commitments. The request for a corrective invoice or credit note is a standard, appropriate ask, so it is ready to send. |
| fr-019 | 1.50 | 1.50 | llm | 5/5 | The e-mail cites invoice CB26126 dated 26/09/2026 and reports the only issue (bases 281,20 + TVA 49,83 = 331,03 vs. printed total 332,53, gap of 1,50) with the exact figures. It states the claimed amount of 1,50 EUR VAT included, is written entirely in formal, courteous French, and adds no invented data. The 'cuotas' to 'TVA' translation is correct, so it is ready to send as is. |
| fr-027 | 25.92 | 25.92 | llm | 5/5 | The e-mail cites invoice n° CB26189 dated 16/09/2026, the affected line (invoiced 4 cases, delivered 3), and the exact amount of 25,92 EUR incl. VAT. It is written entirely in French in a formal, courteous tone, and requests a credit note or corrective invoice without inventing any data. Signed by the Service Achats of Bistrot du Canal SAS, it is ready to send as is. |
| fr-029 | 94.80 | 94.80 | llm | 5/5 | The e-mail cites invoice HPA-2716 dated 20/09/2026, mentions the single affected line (Serviettes papier 40x40, 5 cartons invoiced but not on the bon de livraison) and states 94,80 EUR TVA incluse exactly as in the facts. It is written in formal, courteous French with no invented data; the request for a corrective invoice or credit note is a reasonable ask, so it is ready to send. |
| it-002 | 1.24 | 1.24 | llm | 5/5 | The e-mail cites invoice SV/26/005205 of 05/10/2026 and line 2 (MOZZARELLA FIOR DI LATTE) with the exact calculation from the facts. It states 1,24 EUR VAT included exactly as given. It is written entirely in formal, courteous Italian and invents no figures or commitments. Offering a credit note as an alternative to a corrected invoice is a standard request and not invented data, so it is ready to send. |
| it-006 | 3.10 | 3.10 | llm | 5/5 | The e-mail is entirely in Italian and cites invoice SV/26/005225 dated 13/10/2026. It reports the single total discrepancy (247,63 + 23,89 = 271,52 vs 274,62, difference 3,10) and states the claimed amount of 3,10 EUR with VAT included, exactly as in the facts. The tone is formal and courteous, and it only asks for a corrected invoice or credit note, with no invented data, so it is ready to send. |
| it-007 | 1.22 | 1.22 | llm | 3/5 | The e-mail cites the invoice number and date, line 2 and the amount of 1,22 EUR exactly, and the tone is formal and courteous, with nothing invented. However, it leaves the Spanish word "impreso" in the Italian text, copied from the facts, so it is not entirely in the requested language. This needs a fix (e.g. "riportato") before sending. |
| it-018 | 0.00 | 0.00 | llm | 5/5 | L'e-mail è interamente in italiano, cita numero e data della fattura e l'unica anomalia (riga 2, aliquota IVA 21 % non ammessa, con le aliquote 4, 5, 10, 22 %). Poiché non c'è un importo contestato, chiede una fattura corretta senza inventare cifre. Il tono è formale e cortese, senza minacce; il riferimento alla nota di credito è una prassi contabile standard e non un dato inventato. |
| it-021 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice 1260/2026 of 20/09/2026, reports the total discrepancy with the exact figures (92,25 + 3,69 = 95,94 vs 93,94, Δ 2,00), and asks for a corrected invoice without inventing an amount. It is in Italian with a formal, courteous tone. The only flaw is the optional request for a 'nota di credito', which is not in the facts and makes little sense here, since the printed total is lower than the computed one. This needs only a minor edit. |
| it-027 | 10.25 | 10.25 | llm | 5/5 | The e-mail cites invoice EDV-2026-00934 of 21/09/2026, the affected line with the 13 vs 10 conf discrepancy, and the exact amount of 10,25 EUR including VAT. It is in Italian, formal and courteous, and the 'fattura corretta o nota di credito' request and the 'Ufficio Acquisti' signature do not add any invented figures or commitments. It is ready to send unchanged. |
| it-029 | 46.28 | 46.28 | llm | 5/5 | The e-mail cites the invoice number PPE 368/26 and the date 17/09/2026, lists the only delivery issue (olive oil, 1 can invoiced but not on the DDT), and states the amount of 46,28 EUR including VAT exactly as in the facts. It is written entirely in Italian in a formal, courteous tone and invents no data. The request for a credit note or a corrected invoice is reasonable, so it is ready to send. |

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
