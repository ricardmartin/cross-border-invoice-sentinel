# Eval run `8b0fd8e-anthropic_claude-sonnet-5-5-extract-v2`

Primary `anthropic:claude-sonnet-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · ES, FR, IT · 105 docs · 2026-10-19T13:06:40.310Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 94.3 % |
| Documents 100 % correct (first read) | 95.2 % |
| Line F1 | 99.8 % |
| Final status correct | 98.1 % |
| Discrepancy precision | 96.3 % |
| Discrepancy recall | 96.3 % |
| Unfair claims (false positives on clean docs) | 1.3 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % |
| Mean extraction attempts | 1.20 |
| Escalated to stronger model | 0.0 % |
| Triage country accuracy | 100.0 % |
| Triage doc-type accuracy | 100.0 % |
| Reconciliation status correct | 93.8 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % |
| Claim amount correct | 95.7 % |
| Claim drafts passing guardrails | 100.0 % |
| Claim judge score (1-5) | 4.74 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.02772 |
| Latency p50 | 8685 ms |
| Latency p95 | 21386 ms |
| Failed runs | 0.00 |

## By country

| Metric | ES | FR | IT | Baseline |
| --- | --- | --- | --- | --- |
| Documents 100 % correct (final) | 95.6 % | 90.0 % | 96.7 % | 93.3 % / 93.3 % / 93.3 % |
| Documents 100 % correct (first read) | 97.8 % | 90.0 % | 96.7 % | 93.3 % / 93.3 % / 93.3 % |
| Line F1 | 100.0 % | 99.4 % | 100.0 % | 99.6 % / 99.4 % / 98.6 % |
| Final status correct | 97.8 % | 100.0 % | 96.7 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy precision | 100.0 % | 100.0 % | 88.9 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy recall | 90.9 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % | 0.0 % | 4.5 % | 0.0 % / 0.0 % / 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Mean extraction attempts | 1.18 | 1.20 | 1.23 | 1.18 / 1.23 / 1.20 |
| Escalated to stronger model | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Triage country accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Triage doc-type accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Reconciliation status correct | 100.0 % | 75.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim amount correct | 100.0 % | 85.7 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim drafts passing guardrails | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim judge score (1-5) | 5.00 | 4.57 | 4.57 | 4.67 / 4.86 / 4.57 |
| Claims with invented data | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Cost / doc | $0.02718 | $0.02693 | $0.02933 | $0.00174 / $0.00186 / $0.00186 |
| Latency p50 | 9002 ms | 7672 ms | 7518 ms | 7540 ms / 7331 ms / 7530 ms |
| Latency p95 | 27270 ms | 19106 ms | 21002 ms | 18080 ms / 18358 ms / 23850 ms |
| Failed runs | 0.00 | 0.00 | 0.00 | 0.00 / 0.00 / 0.00 |

## Gate (FAILED)

| Country | Check | Metric | Value | Limit | |
| --- | --- | --- | --- | --- | --- |
| ES | threshold | Documents 100 % correct (final) | 0.9556 | ≥ 0.85 | ✔ |
| ES | threshold | Final status correct | 0.9778 | ≥ 0.95 | ✔ |
| ES | threshold | Discrepancy recall | 0.9091 | ≥ 0.85 | ✔ |
| ES | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| ES | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| ES | threshold | Claim judge score (1-5) | 5 | ≥ 3.5 | ✔ |
| ES | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| ES | threshold | Cost / doc | 0.0272 | ≤ 0.005 | ✖ |
| ES | threshold | Latency p95 | 27270 | ≤ 30000 | ✔ |
| ES | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| ES | regression | Documents 100 % correct (final) | 0.9556 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| ES | regression | Final status correct | 0.9778 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Discrepancy recall | 0.9091 | ≥ 95.0 % (baseline 100.0 %) | ✖ |
| ES | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Line F1 | 1 | ≥ 94.6 % (baseline 99.6 %) | ✔ |
| FR | threshold | Documents 100 % correct (final) | 0.9 | ≥ 0.8 | ✔ |
| FR | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| FR | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| FR | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| FR | threshold | Reconciliation status correct | 0.75 | ≥ 0.75 | ✔ |
| FR | threshold | Claim judge score (1-5) | 4.5714 | ≥ 3.5 | ✔ |
| FR | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| FR | threshold | Cost / doc | 0.0269 | ≤ 0.005 | ✖ |
| FR | threshold | Latency p95 | 19106 | ≤ 30000 | ✔ |
| FR | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| FR | regression | Documents 100 % correct (final) | 0.9 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| FR | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Reconciliation status correct | 0.75 | ≥ 95.0 % (baseline 100.0 %) | ✖ |
| FR | regression | Line F1 | 0.9938 | ≥ 94.4 % (baseline 99.4 %) | ✔ |
| IT | threshold | Documents 100 % correct (final) | 0.9667 | ≥ 0.8 | ✔ |
| IT | threshold | Final status correct | 0.9667 | ≥ 0.9 | ✔ |
| IT | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| IT | threshold | Unfair claims (false positives on clean docs) | 0.0455 | ≤ 0 | ✖ |
| IT | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| IT | threshold | Claim judge score (1-5) | 4.5714 | ≥ 3.5 | ✔ |
| IT | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| IT | threshold | Cost / doc | 0.0293 | ≤ 0.005 | ✖ |
| IT | threshold | Latency p95 | 21002 | ≤ 30000 | ✔ |
| IT | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| IT | regression | Documents 100 % correct (final) | 0.9667 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| IT | regression | Final status correct | 0.9667 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Line F1 | 1 | ≥ 93.6 % (baseline 98.6 %) | ✔ |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 77 | 0 | 1 | 0 |
| SUPPLIER_DISCREPANCY | 0 | 23 | 0 | 0 |
| INVALID_TAX_ID | 1 | 0 | 3 | 0 |
| EXTRACTION_UNCERTAIN | 0 | 0 | 0 | 0 |

## Claims (judged by LLM, then approved by eval-bot)

| Doc | Amount | Expected | Draft | Judge | Justification |
| --- | --- | --- | --- | --- | --- |
| es-002 | 2.75 | 2.75 | llm | 5/5 | El correo cita el número y la fecha de la factura, reproduce exactamente la incidencia de la línea 5 y reclama 2,75 EUR con IVA incluido, tal como constan en los hechos. Está íntegramente en español, con tono formal y cortés y sin amenazas. No añade datos ni compromisos inventados; pedir una factura rectificativa o un abono es una petición razonable. Está listo para enviar tal cual. |
| es-003 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites the invoice number EB-20262306 and date 15/09/2026, and reproduces the line 7 issue exactly as given in the facts. Since no amount is claimed, it correctly asks for a corrective invoice without inventing figures. It is in formal, courteous Spanish and adds nothing absent from the facts, so it is ready to send. |
| es-011 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites the invoice number and date, and reproduces the single total discrepancy exactly as in the facts. Since no amount is claimed, it asks for a corrective invoice without inventing a figure, in formal Spanish with a courteous tone. It adds no invented data and is ready to send unchanged. |
| es-013 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice EB-20262336 and its date 23/09/2026, quotes line 7 and the 8 % VAT issue exactly, and, since no amount is given, asks for a corrective invoice without inventing a figure. It is written entirely in Spanish in a formal, courteous tone and adds no data or commitments beyond the facts, so it is ready to send. |
| es-016 | 3.10 | 3.10 | llm | 5/5 | The e-mail cites invoice F-2026/04115 and its date 20/09/2026, reproduces the sole total discrepancy exactly, and states the claimed amount of 3,10 EUR with VAT included, as in the facts. It is written entirely in formal, courteous Spanish and invents no figures, names or commitments. Requesting a rectifying invoice or credit note is a reasonable ask and not invented data, so it is ready to send. |
| es-028 | 1.21 | 1.21 | llm | 5/5 | The e-mail cites invoice EB-20262381 and date 07/10/2026, and reproduces the line 1 discrepancy exactly. It states 1,21 EUR with VAT included, as in the facts. It is in formal, courteous Spanish with no invented data, and asking for a corrective invoice or credit note is a reasonable request rather than an invented commitment. |
| es-039 | 5.27 | 5.27 | llm | 5/5 | The e-mail cites invoice F-2026/04139 and date 16/09/2026, lists the Patata agria quantity discrepancy (15.7 kg invoiced vs 10 kg delivered) and claims exactly 5,27 EUR including VAT. It is written entirely in Spanish in a formal, courteous tone, and requests a corrective invoice or credit note without inventing any data or commitments, so it is ready to send. |
| es-041 | 80.88 | 80.88 | llm | 5/5 | The e-mail cites the invoice number and date, lists the single affected line with the invoiced and delivered quantities, and states the amount exactly as 80,88 EUR with VAT included. It is written entirely in formal Spanish with no threats and invents nothing beyond a standard request for a corrective invoice or credit note, so it is ready to send. |
| es-043 | 126.32 | 126.32 | llm | 5/5 | The e-mail cites the invoice number EB-20262429 and date 21/09/2026, lists the single affected line with the correct quantity (6 caja), and states 126,32 EUR with VAT included, all exactly as in the facts. It is written in formal, courteous Spanish and invents no figures, dates or commitments; requesting a corrective invoice or credit note is a reasonable standard request. It is ready to send unchanged. |
| fr-003 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice CB26014 of 16/09/2026 and line 4 ("Eau minérale 1L (x6)") with the 7 % VAT issue and the permitted rates. It is formal, courteous and in French, and as no amount is given it asks for a corrective invoice without inventing one. Minor style edits would help: French usage writes "5,5" rather than "5.5", and the "(ou un avoir)" option is not in the facts, though it is harmless. |
| fr-006 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites invoice F26/07145 dated 15/10/2026, the total discrepancy and the 1,50 EUR amount (VAT included), and the tone is formal and courteous. However, it keeps the Spanish word 'cuotas' copied from the facts instead of the French 'TVA' or 'cotisations de TVA', so it is not entirely in French. This is a minor edit, and nothing is invented, so the score is 4. |
| fr-010 | 1.23 | 1.26 | llm | 5/5 | The e-mail cites invoice F26/07181 dated 21/09/2026 and the only listed issue, line 2 (SAUCISSE DE TOULOUSE) with the exact calculation. It states the claimed amount of 1,23 EUR, VAT included, as in the facts. It is written entirely in French in a formal, courteous tone, invents nothing, and can be sent unchanged. |
| fr-016 | 1.44 | 1.44 | llm | 5/5 | The e-mail cites invoice HPA-2660 of 03/10/2026 and line 4 with the exact calculation (6 × 6,40 = 38,40 vs 39,60 printed). It states the claimed amount of 1,44 EUR and adds TTC, which matches amountIncludesVat=true. It is written entirely in French in a formal, courteous tone, invents nothing, and can be sent as is. |
| fr-019 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites invoice CB26126 of 26/09/2026, quotes the total discrepancy with the exact figures, and states 1,50 EUR TVA incluse as in the facts. The tone is formal and courteous, and nothing is invented. One flaw: the Spanish word "cuotas" was copied from the facts into a French e-mail and should be "TVA" (or "montants de TVA"), so it needs a minor edit before sending. |
| fr-027 | 25.92 | 25.92 | llm | 5/5 | The e-mail cites invoice CB26189 dated 16/09/2026 and the single delivery discrepancy (4 caisses invoiced, 3 delivered). It states 25,92 EUR incl. VAT exactly as in the facts. It is in French, formal and courteous, with no invented data, and is ready to send as is. |
| fr-029 | 94.80 | 94.80 | llm | 5/5 | The e-mail cites invoice HPA-2716 dated 20/09/2026, lists the single affected line (Serviettes papier 40x40, 5 cartons not on the bon de livraison) and states the amount of 94,80 EUR incl. VAT exactly as in the facts. It is written entirely in French in a formal, courteous tone, and invents no data. Asking for a corrective invoice or credit note is a standard request and not an invented commitment, so it is ready to send. |
| it-002 | 1.24 | 1.24 | llm | 5/5 | L'e-mail riporta correttamente numero e data della fattura (SV/26/005205 del 05/10/2026), la riga 2 con il calcolo errato e l'importo di 1,24 EUR IVA inclusa, come nei fatti. È scritta interamente in italiano con tono formale e cortese, senza minacce né dati inventati, ed è pronta per l'invio. |
| it-006 | 3.10 | 3.10 | llm | 5/5 | The e-mail is entirely in Italian and cites invoice SV/26/005225 dated 13/10/2026. It reports the total discrepancy with the exact figures (247,63 + 23,89 = 271,52 vs 274,62, Δ 3,10) and claims 3,10 EUR including VAT as in the facts. The tone is formal and courteous, and nothing is invented. The request for a credit note or corrected invoice is a reasonable action, not a fabricated commitment. It is ready to send as is. |
| it-007 | 1.22 | 1.22 | llm | 5/5 | The e-mail is entirely in Italian and cites the invoice number and date correctly. It describes line 2 with the exact figures from the facts and states the claimed amount of 1,22 EUR including VAT. The tone is formal and courteous, and it adds no invented data or commitments, so it is ready to send. |
| it-018 | 0.00 | 0.00 | llm | 3/5 | The e-mail cites the invoice number and date correctly, mentions line 2, and asks for a corrective invoice without inventing an amount. However, the issue line is copied verbatim in Spanish ("Línea 2 ... tipo 21 % no permitido en IT") inside an otherwise Italian e-mail, so it is not entirely in the requested language and needs to be translated before sending. |
| it-021 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice n. 1260/2026 dated 20/09/2026 and reproduces the total discrepancy with the exact figures (92,25 + 3,69 = 95,94 vs 93,94, Δ 2,00). No amount is claimed, so it correctly asks for a corrected invoice without inventing one. It is written in courteous, formal Italian, adds no unsupported data, and is ready to send. |
| it-027 | 10.25 | 10.25 | llm | 4/5 | The e-mail cites invoice EDV-2026-00934 of 21/09/2026, the Acqua minerale 1L (x6) line with 13 invoiced versus 10 delivered, and the exact amount of 10,25 EUR. The tone is formal and courteous, and nothing is invented; asking for a credit note is a reasonable request, not a commitment. The one flaw is the English fragment "incl. VAT" copied into the Italian bullet, which should read "IVA incl.", so it needs only a minor edit. |
| it-029 | 46.28 | 46.28 | llm | 5/5 | The e-mail cites invoice PPE 368/26 of 17/09/2026, lists the single affected line (olive oil 5L, 1 latta, not on the DDT) and states the amount of 46,28 EUR incl. VAT exactly as in the facts. It is written entirely in Italian in a formal, courteous tone and invents nothing, so it is ready to send as is. |

## Field accuracy (final read)

| Field | Accuracy |
| --- | --- |
| docType | 100.0 % |
| documentNumber | 100.0 % |
| issueDate | 100.0 % |
| currency | 100.0 % |
| issuer.name | 100.0 % |
| issuer.taxId | 98.1 % |
| recipient.name | 100.0 % |
| recipient.taxId | 97.1 % |
| printedTaxBreakdown | 100.0 % |
| printedTotal | 100.0 % |
| lines.description | 100.0 % |
| lines.quantity | 99.8 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 100.0 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Documents worth a look

- **es-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `75f4f71764d1d92fed1f364002d9cec2`
  - #1 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
- **es-003** (moderna, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up · trace `456d0bfb4e98bd771fb8fd26aa8ef1c8`
  - #1 primary anthropic:claude-sonnet-5-5: RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-sonnet-5-5: RATE_NOT_ALLOWED · exact
- **es-005** (ticket, photo) expected VALID → **VALID** — All checks passed on the first read · trace `f1fe7e2a053b9567e4fabad04c2192cc`
  - #1 primary anthropic:claude-sonnet-5-5: pass
  - ≠ recipient.taxId: expected "B27543107", got "827543107"
- **es-011** (clasica, scan, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `39736548856d5595173ad769966a0dc1`
  - #1 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
- **es-013** (moderna, scan, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up · trace `fd0e8558919b46a2d08b0f1ef4bb3210`
  - #1 primary anthropic:claude-sonnet-5-5: RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-sonnet-5-5: RATE_NOT_ALLOWED · exact
- **es-016** (clasica, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `befedf05353ea6ac95437de7f8643488`
  - #1 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
- **es-018** (moderna, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **VALID** — All checks passed after 2 reads (self-corrected) · trace `9471dc481d1c7e4924ba55298790e364`
  - #1 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-sonnet-5-5: pass
  - ≠ issuer.taxId: expected "B50274433", got "B50274430"
- **es-022** (erp, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum · trace `3a9bf32c8611c22dec4f4cd4824db28b`
  - #1 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID · exact
- **es-028** (moderna, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `c6d790d29d6c70c82865b21e8a5e1c03`
  - #1 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
- **fr-003** (modern, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up · trace `d9fa17b4c055edff85942f69ac47f89e`
  - #1 primary anthropic:claude-sonnet-5-5: RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-sonnet-5-5: RATE_NOT_ALLOWED · exact
- **fr-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `1a70bdd3b9cbb0104e57f92cfa018a4e`
  - #1 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
- **fr-010** (erp, scan, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `0634bfbd2fb08b0b9d55b6a6b3083d48`
  - #1 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
- **fr-012** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum · trace `a4f685d6dfc4296a5ef1a4bc1700d1dd`
  - #1 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID · exact
- **fr-016** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `823d244adb17587f4fddd9d4c64ed475`
  - #1 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
- **fr-019** (modern, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `8899fb10c800b060ea8da0223e47a006`
  - #1 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
- **fr-025** (erp, photo) expected VALID → **VALID** — All checks passed on the first read · reconciliation DISCREPANCIA (expected SIN_DISCREPANCIA) · trace `526b5fa72ba3da5ad143e90d8ba9c8c7`
  - #1 primary anthropic:claude-sonnet-5-5: pass
  - ≠ recipient.taxId: expected "FR14882149073", got null
- **fr-026** (delivery-note, photo) expected VALID → **VALID** — All checks passed on the first read · trace `a110ce589aa8ef8edb913589ba1644d8`
  - #1 primary anthropic:claude-sonnet-5-5: pass
  - ≠ lines[2].quantity: expected 6.616, got 6.816
- **fr-029** (classic, photo, planted DELIVERY_MISSING_PRODUCT) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — billed goods not delivered (94.80 incl. VAT, confirmed by a re-read of the delivery note) · reconciliation DISCREPANCIA (expected DISCREPANCIA) · trace `8259dde3dc369880710894de6b2bbf58`
  - #1 primary anthropic:claude-sonnet-5-5: pass
  - ≠ recipient.taxId: expected "FR14882149073", got "FR14882149973"
- **it-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `7cb54a7e8f12fef8ae8a121cfb58603c`
  - #1 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
- **it-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `887d9c8f3fb47429e0e08008e0bd8200`
  - #1 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
- **it-007** (modern, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `5354fe01e23715605c2cb63119e54f20`
  - #1 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
  - #2 primary anthropic:claude-sonnet-5-5: LINE_MATH · exact
- **it-010** (erp, photo) expected VALID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum · trace `ca34f110a8e34c404b2efdb9153c0324`
  - #1 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID
  - #2 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID
  - ≠ issuer.taxId: expected "07123456787", got "07123456567"
- **it-017** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum · trace `34f4e68352665eac87b2b43662e3e44d`
  - #1 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-sonnet-5-5: INVALID_TAX_ID · exact
- **it-018** (erp, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up · trace `c25fdc146e89bbede3185c8bc4707515`
  - #1 primary anthropic:claude-sonnet-5-5: RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-sonnet-5-5: RATE_NOT_ALLOWED · exact
- **it-021** (classic, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `315db4ab21ccdce5cb83215b09810fe2`
  - #1 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-sonnet-5-5: TOTAL_MISMATCH · exact
