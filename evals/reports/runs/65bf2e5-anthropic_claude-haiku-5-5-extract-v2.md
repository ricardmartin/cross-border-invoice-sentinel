# Eval run `65bf2e5-anthropic_claude-haiku-5-5-extract-v2`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v2` · ES, FR, IT · 105 docs · 2026-10-19T14:05:44.165Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 93.3 % |
| Documents 100 % correct (first read) | 92.4 % |
| Line F1 | 99.3 % |
| Final status correct | 99.0 % |
| Discrepancy precision | 100.0 % |
| Discrepancy recall | 96.3 % |
| Unfair claims (false positives on clean docs) | 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % |
| Mean extraction attempts | 1.19 |
| Escalated to stronger model | 0.0 % |
| Triage country accuracy | 100.0 % |
| Triage doc-type accuracy | 100.0 % |
| Reconciliation status correct | 93.8 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % |
| Claim amount correct | 100.0 % |
| Claim drafts passing guardrails | 100.0 % |
| Claim judge score (1-5) | 4.73 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.00181 |
| Latency p50 | 7943 ms |
| Latency p95 | 20023 ms |
| Failed runs | 0.00 |

## By country

| Metric | ES | FR | IT | Baseline |
| --- | --- | --- | --- | --- |
| Documents 100 % correct (final) | 93.3 % | 93.3 % | 93.3 % | 93.3 % / 93.3 % / 93.3 % |
| Documents 100 % correct (first read) | 93.3 % | 90.0 % | 93.3 % | 93.3 % / 93.3 % / 93.3 % |
| Line F1 | 99.6 % | 98.8 % | 99.3 % | 99.6 % / 99.4 % / 98.6 % |
| Final status correct | 97.8 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy precision | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Discrepancy recall | 90.9 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Mean extraction attempts | 1.18 | 1.20 | 1.20 | 1.18 / 1.23 / 1.20 |
| Escalated to stronger model | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Triage country accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Triage doc-type accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Reconciliation status correct | 87.5 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim amount correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim drafts passing guardrails | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % |
| Claim judge score (1-5) | 4.63 | 4.86 | 4.71 | 4.67 / 4.86 / 4.57 |
| Claims with invented data | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % |
| Cost / doc | $0.00173 | $0.00186 | $0.00187 | $0.00174 / $0.00186 / $0.00186 |
| Latency p50 | 7781 ms | 8745 ms | 7557 ms | 7540 ms / 7331 ms / 7530 ms |
| Latency p95 | 19761 ms | 20735 ms | 23649 ms | 18080 ms / 18358 ms / 23850 ms |
| Failed runs | 0.00 | 0.00 | 0.00 | 0.00 / 0.00 / 0.00 |

## Gate (FAILED)

| Country | Check | Metric | Value | Limit | |
| --- | --- | --- | --- | --- | --- |
| ES | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.85 | ✔ |
| ES | threshold | Final status correct | 0.9778 | ≥ 0.95 | ✔ |
| ES | threshold | Discrepancy recall | 0.9091 | ≥ 0.85 | ✔ |
| ES | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| ES | threshold | Reconciliation status correct | 0.875 | ≥ 0.75 | ✔ |
| ES | threshold | Claim judge score (1-5) | 4.625 | ≥ 3.5 | ✔ |
| ES | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| ES | threshold | Cost / doc | 0.0017 | ≤ 0.005 | ✔ |
| ES | threshold | Latency p95 | 19761 | ≤ 30000 | ✔ |
| ES | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| ES | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| ES | regression | Final status correct | 0.9778 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Discrepancy recall | 0.9091 | ≥ 95.0 % (baseline 100.0 %) | ✖ |
| ES | regression | Reconciliation status correct | 0.875 | ≥ 95.0 % (baseline 100.0 %) | ✖ |
| ES | regression | Line F1 | 0.9959 | ≥ 94.6 % (baseline 99.6 %) | ✔ |
| FR | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.8 | ✔ |
| FR | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| FR | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| FR | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| FR | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| FR | threshold | Claim judge score (1-5) | 4.8571 | ≥ 3.5 | ✔ |
| FR | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| FR | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| FR | threshold | Latency p95 | 20735 | ≤ 30000 | ✔ |
| FR | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| FR | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| FR | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Line F1 | 0.9875 | ≥ 94.4 % (baseline 99.4 %) | ✔ |
| IT | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.8 | ✔ |
| IT | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| IT | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| IT | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| IT | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| IT | threshold | Claim judge score (1-5) | 4.7143 | ≥ 3.5 | ✔ |
| IT | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| IT | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| IT | threshold | Latency p95 | 23649 | ≤ 30000 | ✔ |
| IT | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| IT | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| IT | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Line F1 | 0.9932 | ≥ 93.6 % (baseline 98.6 %) | ✔ |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 78 | 0 | 0 | 0 |
| SUPPLIER_DISCREPANCY | 1 | 22 | 0 | 0 |
| INVALID_TAX_ID | 0 | 0 | 4 | 0 |
| EXTRACTION_UNCERTAIN | 0 | 0 | 0 | 0 |

## Claims (judged by LLM, then approved by eval-bot)

| Doc | Amount | Expected | Draft | Judge | Justification |
| --- | --- | --- | --- | --- | --- |
| es-002 | 2.75 | 2.75 | llm | 5/5 | The e-mail cites invoice FV26-000819 and date 20/09/2026, and lists line 5 with the exact calculation from the facts. It states 2,75 EUR IVA incluido exactly as given. It is written entirely in formal, courteous Spanish and adds no invented figures, dates or commitments, so it is ready to send. |
| es-003 | 0.00 | 0.00 | llm | 4/5 | The e-mail is in Spanish and cites the invoice number and date, line 7 and the 8 % VAT issue with the allowed rates. It states no amount, as the facts require, and asks for a corrected invoice. It is slightly beyond the facts in offering a credit note as an option, which is a minor addition, so it needs only minor style edits. |
| es-011 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites the invoice number and date, reproduces the total discrepancy exactly as in the facts (126,08 + 5,04 = 131,12 vs 129,12, Δ 2,00), and asks for a corrected invoice without inventing an amount, as required when no amount is claimed. It is written entirely in Spanish in a formal, courteous tone, and adds no invented data or commitments, so it is ready to send as is. |
| es-013 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites the invoice number and date, covers the only issue (line 7, 8 % VAT rate not allowed, with the permitted 4/10/21 % rates) and correctly asks for a corrective invoice without inventing an amount. It is entirely in Spanish, formal and courteous, and adds no data beyond the facts, so it is ready to send as is. |
| es-016 | 3.10 | 3.10 | llm | 5/5 | The e-mail cites the invoice number and date, reproduces the total discrepancy (75,91 + 3,85 = 79,76 vs 82,86, Δ 3,10), and states the claimed amount of 3,10 EUR IVA incluido exactly as in the facts. It is written entirely in Spanish in a formal, courteous tone, and the request for a rectifying invoice or credit note adds no invented figures, dates or commitments, so it is ready to send. |
| es-028 | 1.21 | 1.21 | llm | 3/5 | The e-mail cites the invoice number and date, the affected line and the amount of 1,21 EUR IVA incluido exactly as in the facts, and the tone is formal and courteous. However, it leaves the English word "printed" in the line description, so it is not entirely in Spanish and needs a fix ("impreso") before sending. Nothing is invented, but the language slip prevents a higher score. |
| es-039 | 5.27 | 5.27 | llm | 5/5 | The e-mail cites invoice F-2026/04139 dated 16/09/2026, lists the single affected line (Patata agria, 15.7 kg invoiced vs 10 kg delivered) and states the amount of 5,27 EUR IVA incluido exactly as in the facts. It is written entirely in Spanish in a formal, courteous tone and adds no invented data; asking for a corrective invoice or credit note is a reasonable request, not an invented commitment. It is ready to send unchanged. |
| es-043 | 126.32 | 126.32 | llm | 5/5 | El correo cita el número y la fecha de la factura, la única línea afectada (6 cajas de Cerveza Ambar Especial que no figuran en el albarán) y el importe exacto de 126,32 EUR IVA incluido. Está escrito íntegramente en español con tono formal y cortés, sin amenazas ni datos inventados. La petición de factura rectificativa o nota de abono es razonable y está lista para enviar. |
| fr-003 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice CB26014 dated 16/09/2026 and line 4 with the disallowed 7 % rate, and quotes the allowed rates from the facts. It correctly asks for a corrected invoice without inventing an amount, in formal French. Minor style edits are needed: French writes 5,5 rather than 5.5, and the credit note followed by a new invoice option is a small addition beyond the facts. |
| fr-006 | 1.50 | 1.50 | llm | 5/5 | The e-mail cites invoice F26/07145 dated 15/10/2026, describes the single total discrepancy with the exact figures (236,64 + 16,47 = 253,11 vs 254,61, Δ 1,50), and states 1,50 EUR TTC as in the facts. It is entirely in French, formal and courteous, and invents nothing beyond the standard request for a corrective invoice or credit note, so it is ready to send. |
| fr-010 | 1.26 | 1.26 | llm | 5/5 | The e-mail gives the invoice number and date, quotes line 2 with the exact calculation from the facts, and states the amount as 1,26 EUR TTC. It is entirely in French, formal and courteous, and adds no figures, dates or commitments beyond the facts. The request for a corrective invoice or credit note is a reasonable ask and not invented data. It can be sent as is. |
| fr-016 | 1.44 | 1.44 | llm | 5/5 | The e-mail cites invoice HPA-2660 dated 03/10/2026, reproduces the line 4 discrepancy exactly as in the facts, and states the claimed amount as 1,44 EUR TTC. It is written entirely in formal, courteous French, and the request for a corrective invoice or credit note adds no invented figures or commitments. It is ready to send unchanged. |
| fr-019 | 1.50 | 1.50 | llm | 5/5 | The e-mail cites invoice CB26126 dated 26/09/2026, reproduces the only issue (total mismatch 331,03 vs 332,53, Δ 1,50) and states the amount 1,50 EUR TTC exactly as in the facts. It is written in formal French with no invented data or threats, and is ready to send; the signature uses only the restaurant name and department, which is consistent with the facts. |
| fr-027 | 25.92 | 25.92 | llm | 5/5 | The e-mail is written in French and cites invoice CB26189 dated 16/09/2026. It describes the single delivery discrepancy (4 caisses invoiced, 3 delivered) and states the amount of 25,92 EUR TTC exactly as in the facts. The tone is formal and courteous. Nothing is invented: the "Service Achats" signature is consistent with the purchasing department and the restaurant name, and the request for a credit note or corrective invoice is a reasonable form of the claim. It is ready to send. |
| fr-029 | 94.80 | 94.80 | llm | 5/5 | The e-mail cites invoice HPA-2716 dated 20/09/2026, lists the single affected line (serviettes papier 40x40, 5 cartons invoiced but absent from the bon de livraison) and states the amount of 94,80 EUR TTC exactly as in the facts. It is entirely in French, formal and courteous, and adds no invented data; requesting a corrective invoice or credit note is a standard request, not an invented commitment. It is ready to send as is. |
| it-002 | 1.24 | 1.24 | llm | 5/5 | L'e-mail riporta correttamente numero e data della fattura, la riga 2 con il calcolo esatto e l'importo di 1,24 EUR IVA inclusa. È scritta interamente in italiano con tono formale e cortese, senza minacce. Non contiene dati inventati: la richiesta di nota di credito o fattura corretta è una richiesta generica, non un impegno o una cifra non presente nei fatti. |
| it-006 | 3.10 | 3.10 | llm | 4/5 | The e-mail cites the invoice number and date, reports the total discrepancy and states 3,10 EUR IVA inclusa exactly as in the facts, and the tone is courteous. The word "bases" was left in English inside the Italian text (should be "imponibili"), so the language is not fully correct and needs a minor edit. It invents no data; asking for a corrected invoice or credit note is a reasonable request rather than an invented commitment. |
| it-007 | 1.22 | 1.22 | llm | 5/5 | L'e-mail cita correttamente numero e data della fattura, la riga 2 con il calcolo 9 × 2,80 = 25,20 ≠ 26,20 e l'importo di 1,22 EUR IVA inclusa, esattamente come nei fatti. È scritta interamente in italiano, con tono formale e cortese e senza minacce. Non introduce dati inventati: la richiesta di fattura corretta o nota di credito è una richiesta ragionevole, non un impegno o una cifra nuova. |
| it-018 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice SV/26/005285 dated 14/09/2026 and the only issue (line 2, 21% VAT rate not allowed, with the permitted rates 4, 5, 10, 22%). It invents no amount and asks for a corrective invoice, as the facts require. It is written in formal, courteous Italian, and the added option of a credit note is a reasonable request rather than invented data, so it is ready to send. |
| it-021 | 0.00 | 0.00 | llm | 4/5 | The e-mail is in Italian and cites invoice 1260/2026 of 20/09/2026. It reproduces the total discrepancy exactly (92,25 + 3,69 = 95,94 vs 93,94, Δ 2,00) and, with no claimed amount, asks for a corrected invoice without inventing a figure. The only flaw is the suggestion of a credit note: it is not in the facts and makes little sense, since the printed total is lower than the computed one. A minor edit is needed, and the greeting could be more natural. |
| it-027 | 10.25 | 10.25 | llm | 5/5 | L'e-mail riporta correttamente numero e data della fattura, l'unica riga contestata (13 conf fatturate contro 10 consegnate) e l'importo di 10,25 EUR IVA inclusa, esattamente come nei fatti. È interamente in italiano, formale e cortese, senza minacce né dati inventati. La richiesta di fattura corretta o nota di credito è una richiesta ragionevole, non un impegno inventato, quindi si può inviare così com'è. |
| it-029 | 46.28 | 46.28 | llm | 5/5 | The e-mail cites invoice PPE 368/26 of 17/09/2026, lists the single affected line (olive oil 5L, 1 latta not on the DDT), and states 46,28 EUR IVA inclusa exactly as in the facts. It is written entirely in Italian in a formal, courteous tone and adds no invented data, so it is ready to send as is. |

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
| printedTaxBreakdown | 99.0 % |
| printedTotal | 100.0 % |
| lines.description | 99.3 % |
| lines.quantity | 100.0 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 100.0 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Documents worth a look

- **es-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `905be0bb70138a0cc2f1d7bdc22491b5`
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **es-003** (moderna, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up · trace `dcc3bfb07fa661754551803fc3d54499`
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **es-005** (ticket, photo) expected VALID → **VALID** — All checks passed on the first read · trace `baa8340884716c4383e4ea5aca51989f`
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "T-77172", got "9-77172"
- **es-011** (clasica, scan, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `b3cdaa133996f187a13a9d1496627ac5`
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **es-013** (moderna, scan, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up · trace `90bf13873e059db122c5a03484e96367`
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **es-016** (clasica, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `6be4b6381c2a93ccf33d04658fa90918`
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **es-018** (moderna, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum · trace `4ae0431c5a8b5cce2eae9f18c31320a5`
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **es-022** (erp, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum · trace `e21838b3d341623c80dc4e49e63f9358`
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **es-028** (moderna, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `e277232ff7cd089427fc988946e3a8b0`
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **es-030** (ticket, photo) expected VALID → **VALID** — All checks passed on the first read · trace `968032e0b1d47d550230f44ebee4a002`
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "T-77497", got "9-7749"
- **es-041** (erp, photo, planted DELIVERY_SHORT) expected SUPPLIER_DISCREPANCY → **VALID** — All checks passed on the first read; delivery note(s) not received yet: A18-2603387 · reconciliation FALTAN_DOCUMENTOS (expected DISCREPANCIA) · trace `d5e01e6d7a43b234be11230176c7f85d`
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ printedTaxBreakdown: expected [{"rate":10,"base":293.88,"tax":29.39}], got [{"rate":10,"base":293.86,"tax":29.39}]
  - ≠ lines[0].description: expected "JAMON CEBO IBERICO LONCHEADO 100G", got "JAMON CERDO IBERICO LONCHEADO 100G"
- **fr-001** (classic, photo) expected VALID → **VALID** — All checks passed on the first read · trace `ce7ab163e36ba86f860a7a86e219a350`
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "FA-2026-010400", got "FA-2026-010490"
- **fr-003** (modern, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up · trace `8a846126b189447a620c53bf3188f2fd`
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **fr-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `a8ab5600f5d8a98bbacbcdac43e413a3`
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **fr-010** (erp, scan, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `5680fc2f0c4275edeb3ce84ee696827a`
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **fr-012** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum · trace `2789527718b7614f0e17172cae2a2b15`
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **fr-016** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `9f4ef71fe4c781b517bebfded43c0dd3`
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **fr-019** (modern, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `086e02e438e5f7769619dcd9ebfea959`
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **fr-025** (erp, photo) expected VALID → **VALID** — All checks passed on the first read · reconciliation SIN_DISCREPANCIA (expected SIN_DISCREPANCIA) · trace `c7049a4cc5102cede262bc6a48de3288`
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[2].description: expected "ENTRECOTE BOEUF CHAROLAIS", got "ENTRECOTE ROEUF CHAROLAIS"
  - ≠ lines[1].description: expected "JAMBON BLANC SUPERIEUR", got "JAMBON BLANC SUPPRIEUR"
- **it-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `8241ae14eb74f5475c90a12804aa27a3`
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **it-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `c3b4f37f58e409d00b8089b1a5c5cb11`
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **it-007** (modern, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up · trace `227c6b83ba98f02163821bda43f6457f`
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **it-017** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum · trace `25bc4a75f8b60cc6f9f4e4c2dbd3997f`
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **it-018** (erp, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up · trace `63c8df01d035bd3d540bbc5ed2dbc77b`
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED
  - ≠ lines[1].description: expected "PELLICOLA ALIMENTARE 300M", got "PELLICOLA ALIMENTARE 30M"
- **it-021** (classic, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up · trace `8011574dee74bc548652f7e812cd2756`
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **it-026** (delivery-note, photo) expected VALID → **VALID** — All checks passed on the first read · trace `6a4bb42d4a3265977c127d9fe61e3f14`
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ recipient.taxId: expected "09123456700", got "09123456500"
