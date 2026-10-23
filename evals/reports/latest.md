# Eval run `24ccf06-anthropic_claude-haiku-5-5-extract-v3`

Primary `anthropic:claude-haiku-5-5` · escalation `anthropic:claude-sonnet-5-5` · retries 2 · prompt `local:extract-v3` · DE, DK, ES, FR, GB, IE, IT, PT · 282 docs · 2026-10-21T22:29:21.609Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct (final) | 92.9 % |
| Documents 100 % correct (first read) | 92.9 % |
| Line F1 | 99.0 % |
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
| Claim judge score (1-5) | 4.76 |
| Claims with invented data | 0.0 % |
| Cost / doc | $0.00195 |
| Latency p50 | 7950 ms |
| Latency p95 | 20833 ms |
| Failed runs | 0.00 |

## By country

| Metric | DE | DK | ES | FR | GB | IE | IT | PT | Baseline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Documents 100 % correct (final) | 83.3 % | 96.7 % | 93.2 % | 90.0 % | 96.7 % | 93.3 % | 97.0 % | 92.5 % | 83.3 % / 96.7 % / 93.2 % / 90.0 % / 96.7 % / 93.3 % / 97.0 % / 92.5 % |
| Documents 100 % correct (first read) | 83.3 % | 96.7 % | 93.2 % | 90.0 % | 96.7 % | 93.3 % | 97.0 % | 92.5 % | 83.3 % / 96.7 % / 93.2 % / 90.0 % / 96.7 % / 93.3 % / 97.0 % / 92.5 % |
| Line F1 | 98.7 % | 99.3 % | 99.4 % | 99.4 % | 98.0 % | 97.4 % | 99.4 % | 100.0 % | 98.7 % / 99.3 % / 99.4 % / 99.4 % / 98.0 % / 97.4 % / 99.4 % / 100.0 % |
| Final status correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Discrepancy precision | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Discrepancy recall | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Unfair claims (false positives on clean docs) | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % |
| EXTRACTION_UNCERTAIN rate | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % |
| Mean extraction attempts | 1.20 | 1.20 | 1.22 | 1.20 | 1.20 | 1.20 | 1.21 | 1.20 | 1.20 / 1.20 / 1.22 / 1.20 / 1.20 / 1.20 / 1.21 / 1.20 |
| Escalated to stronger model | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % |
| Triage country accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Triage doc-type accuracy | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Reconciliation status correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Claims drafted for SUPPLIER_DISCREPANCY | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Claim amount correct | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Claim drafts passing guardrails | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % | 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % / 100.0 % |
| Claim judge score (1-5) | 4.71 | 4.71 | 4.71 | 4.71 | 5.00 | 4.86 | 4.75 | 4.67 | 4.71 / 4.71 / 4.71 / 4.71 / 5.00 / 4.86 / 4.75 / 4.67 |
| Claims with invented data | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % / 0.0 % |
| Cost / doc | $0.00190 | $0.00192 | $0.00205 | $0.00194 | $0.00183 | $0.00186 | $0.00198 | $0.00202 | $0.00190 / $0.00192 / $0.00205 / $0.00194 / $0.00183 / $0.00186 / $0.00198 / $0.00202 |
| Latency p50 | 8307 ms | 7992 ms | 7811 ms | 8582 ms | 7042 ms | 7776 ms | 7525 ms | 7641 ms | 8307 ms / 7992 ms / 7811 ms / 8582 ms / 7042 ms / 7776 ms / 7525 ms / 7641 ms |
| Latency p95 | 18948 ms | 20672 ms | 23805 ms | 20277 ms | 17304 ms | 16164 ms | 26135 ms | 23604 ms | 18948 ms / 20672 ms / 23805 ms / 20277 ms / 17304 ms / 16164 ms / 26135 ms / 23604 ms |
| Failed runs | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 / 0.00 / 0.00 / 0.00 / 0.00 / 0.00 / 0.00 / 0.00 |

## Gate (PASSED)

| Country | Check | Metric | Value | Limit | |
| --- | --- | --- | --- | --- | --- |
| DE | threshold | Documents 100 % correct (final) | 0.8333 | ≥ 0.8 | ✔ |
| DE | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| DE | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| DE | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| DE | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| DE | threshold | Claim judge score (1-5) | 4.7143 | ≥ 3.5 | ✔ |
| DE | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| DE | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| DE | threshold | Latency p95 | 18948 | ≤ 30000 | ✔ |
| DE | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| DE | regression | Documents 100 % correct (final) | 0.8333 | ≥ 78.3 % (baseline 83.3 %) | ✔ |
| DE | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| DE | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| DE | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| DE | regression | Line F1 | 0.9867 | ≥ 93.7 % (baseline 98.7 %) | ✔ |
| DK | threshold | Documents 100 % correct (final) | 0.9667 | ≥ 0.8 | ✔ |
| DK | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| DK | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| DK | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| DK | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| DK | threshold | Claim judge score (1-5) | 4.7143 | ≥ 3.5 | ✔ |
| DK | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| DK | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| DK | threshold | Latency p95 | 20672 | ≤ 30000 | ✔ |
| DK | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| DK | regression | Documents 100 % correct (final) | 0.9667 | ≥ 91.7 % (baseline 96.7 %) | ✔ |
| DK | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| DK | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| DK | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| DK | regression | Line F1 | 0.9935 | ≥ 94.3 % (baseline 99.3 %) | ✔ |
| ES | threshold | Documents 100 % correct (final) | 0.9322 | ≥ 0.85 | ✔ |
| ES | threshold | Final status correct | 1 | ≥ 0.95 | ✔ |
| ES | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| ES | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| ES | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| ES | threshold | Claim judge score (1-5) | 4.7143 | ≥ 3.5 | ✔ |
| ES | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| ES | threshold | Cost / doc | 0.0021 | ≤ 0.005 | ✔ |
| ES | threshold | Latency p95 | 23805 | ≤ 30000 | ✔ |
| ES | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| ES | regression | Documents 100 % correct (final) | 0.9322 | ≥ 88.2 % (baseline 93.2 %) | ✔ |
| ES | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| ES | regression | Line F1 | 0.9936 | ≥ 94.4 % (baseline 99.4 %) | ✔ |
| FR | threshold | Documents 100 % correct (final) | 0.9 | ≥ 0.8 | ✔ |
| FR | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| FR | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| FR | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| FR | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| FR | threshold | Claim judge score (1-5) | 4.7143 | ≥ 3.5 | ✔ |
| FR | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| FR | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| FR | threshold | Latency p95 | 20277 | ≤ 30000 | ✔ |
| FR | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| FR | regression | Documents 100 % correct (final) | 0.9 | ≥ 85.0 % (baseline 90.0 %) | ✔ |
| FR | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| FR | regression | Line F1 | 0.9938 | ≥ 94.4 % (baseline 99.4 %) | ✔ |
| GB | threshold | Documents 100 % correct (final) | 0.9667 | ≥ 0.8 | ✔ |
| GB | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| GB | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| GB | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| GB | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| GB | threshold | Claim judge score (1-5) | 5 | ≥ 3.5 | ✔ |
| GB | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| GB | threshold | Cost / doc | 0.0018 | ≤ 0.005 | ✔ |
| GB | threshold | Latency p95 | 17304 | ≤ 30000 | ✔ |
| GB | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| GB | regression | Documents 100 % correct (final) | 0.9667 | ≥ 91.7 % (baseline 96.7 %) | ✔ |
| GB | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| GB | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| GB | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| GB | regression | Line F1 | 0.9797 | ≥ 93.0 % (baseline 98.0 %) | ✔ |
| IE | threshold | Documents 100 % correct (final) | 0.9333 | ≥ 0.8 | ✔ |
| IE | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| IE | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| IE | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| IE | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| IE | threshold | Claim judge score (1-5) | 4.8571 | ≥ 3.5 | ✔ |
| IE | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| IE | threshold | Cost / doc | 0.0019 | ≤ 0.005 | ✔ |
| IE | threshold | Latency p95 | 16164 | ≤ 30000 | ✔ |
| IE | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| IE | regression | Documents 100 % correct (final) | 0.9333 | ≥ 88.3 % (baseline 93.3 %) | ✔ |
| IE | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IE | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IE | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IE | regression | Line F1 | 0.974 | ≥ 92.4 % (baseline 97.4 %) | ✔ |
| IT | threshold | Documents 100 % correct (final) | 0.9697 | ≥ 0.8 | ✔ |
| IT | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| IT | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| IT | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| IT | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| IT | threshold | Claim judge score (1-5) | 4.75 | ≥ 3.5 | ✔ |
| IT | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| IT | threshold | Cost / doc | 0.002 | ≤ 0.005 | ✔ |
| IT | threshold | Latency p95 | 26135 | ≤ 30000 | ✔ |
| IT | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| IT | regression | Documents 100 % correct (final) | 0.9697 | ≥ 92.0 % (baseline 97.0 %) | ✔ |
| IT | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| IT | regression | Line F1 | 0.9937 | ≥ 94.4 % (baseline 99.4 %) | ✔ |
| PT | threshold | Documents 100 % correct (final) | 0.925 | ≥ 0.8 | ✔ |
| PT | threshold | Final status correct | 1 | ≥ 0.9 | ✔ |
| PT | threshold | Discrepancy recall | 1 | ≥ 0.85 | ✔ |
| PT | threshold | Unfair claims (false positives on clean docs) | 0 | ≤ 0 | ✔ |
| PT | threshold | Reconciliation status correct | 1 | ≥ 0.75 | ✔ |
| PT | threshold | Claim judge score (1-5) | 4.6667 | ≥ 3.5 | ✔ |
| PT | threshold | Claims with invented data | 0 | ≤ 0 | ✔ |
| PT | threshold | Cost / doc | 0.002 | ≤ 0.005 | ✔ |
| PT | threshold | Latency p95 | 23604 | ≤ 30000 | ✔ |
| PT | threshold | Failed runs | 0 | ≤ 0 | ✔ |
| PT | regression | Documents 100 % correct (final) | 0.925 | ≥ 87.5 % (baseline 92.5 %) | ✔ |
| PT | regression | Final status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| PT | regression | Discrepancy recall | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| PT | regression | Reconciliation status correct | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |
| PT | regression | Line F1 | 1 | ≥ 95.0 % (baseline 100.0 %) | ✔ |

## Final status (rows: expected, columns: predicted)

| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |
| --- | --- | --- | --- | --- |
| VALID | 207 | 0 | 0 | 0 |
| SUPPLIER_DISCREPANCY | 0 | 66 | 0 | 0 |
| INVALID_TAX_ID | 0 | 0 | 9 | 0 |
| EXTRACTION_UNCERTAIN | 0 | 0 | 0 | 0 |

## Claims (judged by LLM, then approved by eval-bot)

| Doc | Amount | Expected | Draft | Judge | Justification |
| --- | --- | --- | --- | --- | --- |
| de-002 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice number 260009 and date 07/09/2026, names line 2 (SCHINKEN GEKOCHT) and the invalid 5 % rate with the allowed 7 % and 19 %. No amount is given in the facts, and it correctly asks for a corrected invoice without inventing one. It is in German, formal and courteous, with no invented data, so it is ready to send. |
| de-005 | 1.07 | 1.07 | llm | 5/5 | The e-mail names invoice RE-2026-40412 of 09/09/2026, cites line 2 ("Zwiebeln gelb") with the exact calculation error, and states 1,07 EUR inkl. MwSt. as in the facts. It is entirely in German, formal and courteous, and adds no figures, dates or commitments beyond the facts. The request for a corrected invoice or credit note is a reasonable ask, so it can be sent as is. |
| de-006 | 3.10 | 3.10 | llm | 5/5 | Der E-Mail-Text nennt Rechnungsnummer und Datum, die einzige Beanstandung (Gesamtsumme 93,23 + 9,29 = 102,52 ≠ 105,62) und den geforderten Betrag von 3,10 EUR inkl. MwSt. exakt wie in den Fakten. Sie ist vollständig auf Deutsch, formell und höflich, ohne Drohungen und ohne erfundene Zahlen, Daten oder Zusagen. Sie ist so versandfertig. |
| de-013 | 0.00 | 0.00 | llm | 4/5 | The e-mail is in German and cites the invoice number and date. It describes the total discrepancy with the exact figures (80,75 + 5,65 = 86,40 vs 84,40, difference 2,00) and asks for a corrected invoice without inventing an amount. The tone is formal and courteous. Offering a credit note as an alternative is a small addition not in the facts, and 'Nettobetrag' is a slight paraphrase of 'bases', so minor style edits are possible. |
| de-017 | 0.00 | 0.00 | llm | 4/5 | The e-mail is in German and cites invoice RE-2026-40448 dated 23/09/2026. It reports the Kopfsalat discrepancy exactly (11 × 0,95 = 10,45 vs 9,65), and since no amount is claimed, it asks for a corrected invoice without inventing one. The tone is formal and courteous. A small style edit is advisable: the facts only call for a corrected invoice, so the 'oder eine Gutschrift' alternative goes slightly beyond them. |
| de-027 | 8.57 | 8.57 | llm | 5/5 | The e-mail is written entirely in German and cites invoice GRV-26189 dated 12/09/2026. It lists the single affected line (7 Kasten invoiced, 6 delivered) and states 8,57 EUR inkl. MwSt. exactly as in the facts. The tone is formal and courteous, and it invents nothing; asking for a correction or credit note is a reasonable request, so it is ready to send. |
| de-029 | 6.82 | 6.82 | llm | 5/5 | The e-mail cites invoice GHN8916 and the date 02/09/2026, and lists the Speisesalz 1 kg line (13 Pkg, not on the Lieferschein) with the exact amount of 6,82 EUR inkl. MwSt. It is written entirely in German in a formal, courteous tone and adds no data absent from the facts. The request for a corrected invoice or credit note is a reasonable standard ask, so it is ready to send unchanged. |
| dk-002 | 0.90 | 0.90 | llm | 5/5 | The e-mail cites invoice JKP-091009 of 17/09/2026 and the single total discrepancy (1.628,08 + 407,02 = 2.035,10 vs. 2.036,00, difference 0,90). It states the claim as 0,90 DKK inkl. moms, exactly as in the facts. It is written entirely in formal, courteous Danish, with no invented figures, dates or deadlines, so it is ready to send unchanged. |
| dk-005 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice 52012 dated 01/09/2026 and line 3 ("Tomater, stilk") with the 22 % vs 25 % VAT rate issue. It is in Danish, formal and courteous, and asks for a corrected invoice without inventing an amount. Minor style edits only: the credit note alternative is not in the facts, and the sentence saying no specific amount is claimed is unnecessary. |
| dk-009 | 0.00 | 0.00 | llm | 5/5 | The e-mail is written in Danish and cites invoice 52024 dated 05/09/2026 and the line 6 calculation error with the exact figures. It asks for a corrected invoice without inventing an amount, and its tone is formal and courteous. The credit note option is a standard request rather than invented data, so it is ready to send as is. |
| dk-012 | 0.00 | 0.00 | llm | 5/5 | The e-mail is in Danish and cites invoice NRH-7744 dated 14/10/2026. It describes the total discrepancy with the exact figures (762,00 + 190,50 = 952,50 vs 950,50, difference 2,00). Because no amount is claimed, it correctly asks for a corrective invoice without inventing anything, and the tone is formal and courteous, so it is ready to send. |
| dk-014 | 1.25 | 1.25 | llm | 4/5 | The e-mail cites invoice JKP-091117 dated 05/09/2026, line 5 with the exact calculation (491,49 vs 492,49 printed), and the amount 1,25 DKK inkl. moms exactly as in the facts. It is formal, courteous and invents nothing. A few phrasings are slightly calqued Danish ("skal hermed gøre opmærksom", "Vi skal derfor anmode"), so it needs minor style edits. Offering a credit note as an alternative to a corrected invoice is a reasonable option, not invented data. |
| dk-027 | 211.25 | 211.25 | llm | 5/5 | The e-mail is in Danish and cites invoice ØD26189 dated 11/09/2026. It lists the Akvavit 70cl discrepancy (invoiced 3 fl, delivered 2 fl) and states the amount 211,25 DKK inkl. moms exactly as in the facts. The tone is formal and courteous, and it invents no data, so it is ready to send. |
| dk-029 | 225.00 | 225.00 | llm | 5/5 | The e-mail is entirely in Danish and cites invoice NRH-7816 dated 01/10/2026. It lists the Klorin 5L line (4 dunke invoiced, not on the følgeseddel) and states the amount exactly as 225,00 DKK inkl. moms. The tone is formal and courteous, with no threats and no invented data, so it can be sent unchanged. |
| es-002 | 2.75 | 2.75 | llm | 5/5 | The e-mail cites invoice FV26-000819 dated 20/09/2026 and the only issue, line 5 (SOLOMILLO CERDO IBERICO, 2.615 × 15,75 = 41,19 vs 43,69 printed). It states the amount as 2,75 EUR IVA incluido, matching the facts. It is entirely in Spanish, formal and courteous, and adds no invented figures, dates or commitments, so it is ready to send. |
| es-003 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice EB-20262306 dated 15/09/2026 and the only issue (line 7, 8 % VAT rate, allowed rates 4/10/21 %). It correctly asks for a corrective invoice without inventing an amount. It is in formal Spanish with no invented data, but the request for a 'factura rectificativa (nota de crédito) junto con la factura corregida' is redundant and slightly confusing, so it needs a minor style edit. |
| es-011 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice F-2026/04110 dated 13/10/2026 and reproduces the single total discrepancy exactly (126,08 + 5,04 = 131,12 vs 129,12, difference 2,00). No amount is claimed, and it correctly asks for a corrected invoice without inventing one. It is in formal, courteous Spanish and adds no unsupported data, so it is ready to send; the mention of a credit note is a reasonable alternative and not an invented figure. |
| es-013 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites the invoice number and date, line 7 and the disallowed 8 % rate with the allowed rates, and asks for a corrective invoice without inventing an amount. It is in correct, formal Spanish. Minor edits are needed: it offers a credit note plus new invoice alternative not in the facts (a mild addition), and it mixes formal 'Le/usted' with plural 'nos remitieran'.</br> |
| es-016 | 3.10 | 3.10 | llm | 5/5 | The e-mail is written in Spanish and cites invoice F-2026/04115 dated 20/09/2026. It reproduces the total discrepancy (75,91 + 3,85 = 79,76 vs 82,86, Δ 3,10) and states the claimed amount of 3,10 EUR IVA incluido exactly as in the facts. The tone is formal and courteous, with no invented data; the options of a credit note or corrected invoice are standard requests, not invented commitments. |
| es-028 | 1.21 | 1.21 | llm | 5/5 | The e-mail cites invoice EB-20262381 and its date 07/10/2026, describes the line 1 arithmetic error exactly as in the facts, and states the claimed amount of 1,21 EUR with IVA incluido. It is in Spanish, formal and courteous, and adds no invented data, so it is ready to send as is. |
| es-039 | 5.27 | 5.27 | llm | 5/5 | The e-mail cites invoice F-2026/04139 dated 16/09/2026, the Patata agria line with 15.7 kg invoiced versus 10 kg delivered, and the exact amount of 5,27 EUR IVA incluido. It is written entirely in Spanish in a formal, courteous tone and asks for a corrective invoice or credit note without adding any invented data. It is ready to send as is. |
| es-041 | 80.88 | 80.88 | llm | 5/5 | The e-mail cites invoice FV26-001099 dated 24/09/2026, lists the single affected line with invoiced 26 vs delivered 14, and states 80,88 EUR IVA incluido exactly as in the facts. It is entirely in Spanish, formal and courteous, and the request for a corrective invoice or credit note is a reasonable ask, not invented data. It is ready to send unchanged. |
| es-043 | 126.32 | 126.32 | llm | 5/5 | The e-mail cites invoice EB-20262429 and date 21/09/2026, and mentions the only affected line (Cerveza Ambar Especial 33cl, 6 caja, not on the albarán). It states 126,32 EUR IVA incluido exactly as in the facts, is in formal Spanish, and invents no data; asking for a rectifying invoice or credit note is a standard, non-invented request. It is ready to send as is. |
| es-047 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice TB260329 and its date 29/09/2026, and covers the only issue (line 2, 4 % rate not allowed under IGIC) with the permitted rates as in the facts. No amount is given, so it correctly asks for a corrected invoice without inventing one. It is in Spanish, formal and courteous, and contains no invented data, so it is ready to send. |
| es-053 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice DE-759 and the date 08/09/2026, and covers the only issue (line 1, 21 % rate not allowed in Ceuta IPSI) with the permitted rates exactly as in the facts. No amount is given, so it correctly requests a corrective invoice or credit note without inventing a figure. It is in Spanish, formal and courteous, and contains no invented data, so it is ready to send. |
| es-055 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice SHM26385 dated 11/09/2026, covers both document issues (line 2 IPSI rate and line 3 arithmetic discrepancy) with the correct figures, and asks for a corrective invoice without inventing an amount. It is formal and in Spanish. Minor points: the optional "nota de abono" alternative and the phrase "recibida en nuestro establecimiento" go slightly beyond the facts, and the rates use decimal point (0.5) instead of Spanish comma, so small style edits are advisable. |
| es-057 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice HN-2026/0254 dated 10/10/2026 and reproduces the single totals discrepancy exactly as in the facts (82,89 + 3,32 = 86,21 − 1,66 = 84,55 vs 86,05, Δ 0,16). Because no amount is claimed, it correctly asks for a corrected invoice without inventing one. It is in Spanish, formal and courteous, adds no invented data, and is ready to send. |
| es-059 | 1.00 | 1.00 | llm | 4/5 | The e-mail cites the invoice number and date, both issues (the surcharge line and the total mismatch), and the exact amount of 1,00 EUR IVA incluido, all in Spanish with a formal tone. It invents nothing. Minor style edits are needed: the mix of 'Le rogamos' with 'nos emitan', the decimal '0.5 %' with a point instead of a comma, and the slightly odd phrase 'importe reclamado'. |
| fr-003 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice CB26014 dated 16/09/2026 and the single issue on line 4 with the exact rates from the facts. With no amount claimed, it correctly asks for a corrective invoice without inventing a figure. It is written in French in a formal, courteous tone and adds no invented data, so it can be sent as is. |
| fr-006 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites the invoice number and date, reproduces the total discrepancy (236,64 + 16,47 = 253,11 vs 254,61) and states the 1,50 EUR TTC difference exactly as in the facts. It is in French, formal and courteous, and invents no figures. The one minor style flaw is the redundant double closing ("salutations distinguées" followed by "Cordialement"), and the optional mention of an "avoir" goes slightly beyond the facts. |
| fr-010 | 1.26 | 1.26 | llm | 4/5 | The e-mail cites invoice F26/07181 dated 21/09/2026, the line 2 discrepancy (4.31 × 9,60 = 41,38 vs 42,58) and the amount 1,26 EUR TTC exactly as in the facts. It is in formal, courteous French with no invented figures. Minor style edits would help: the optional "(ou un avoir)" goes slightly beyond the facts, and the supplier is not named. |
| fr-016 | 1.44 | 1.44 | llm | 5/5 | The e-mail cites invoice HPA-2660 dated 03/10/2026, line 4 with the exact calculation discrepancy, and the claimed amount of 1,44 EUR TTC as in the facts. It is written entirely in French in a formal, courteous tone with no threats. It invents no figures, dates or commitments, and it can be sent unchanged. |
| fr-019 | 1.50 | 1.50 | llm | 5/5 | The e-mail cites invoice CB26126 dated 26/09/2026, reproduces the single total discrepancy with the exact figures (281,20 + 49,83 = 331,03 vs 332,53, Δ 1,50), and claims exactly 1,50 EUR TTC. It is in formal, courteous French with no invented data or threats, and is ready to send as is. |
| fr-027 | 25.92 | 25.92 | llm | 5/5 | The e-mail cites invoice CB26189 of 16/09/2026 and the only affected line (Bière blonde 33cl x24, 4 caisses invoiced vs 3 delivered). It states the amount of 25,92 EUR TTC exactly as in the facts. It is entirely in French, formal and courteous, with no invented data or threats, so it is ready to send as is. |
| fr-029 | 94.80 | 94.80 | llm | 5/5 | The e-mail cites invoice HPA-2716 dated 20/09/2026, lists the single affected line (serviettes papier, 5 cartons not on the bon de livraison) and states 94,80 EUR TTC exactly as in the facts. It is in French, formal and courteous, with no threats or invented data; the request for a corrective invoice or credit note is reasonable and ready to send. |
| gb-001 | 1.00 | 1.00 | llm | 5/5 | The e-mail cites invoice INV204000 and its date, quotes the line 5 discrepancy exactly, and states the claimed amount as 1.00 GBP inc. VAT, matching the facts. It is in English, formal and courteous, and invents no figures or commitments; the request for a corrected invoice or credit note is a reasonable generic ask, so it is ready to send. |
| gb-002 | 3.00 | 3.00 | llm | 5/5 | The e-mail cites invoice YDM/055009 dated 26/09/2026 and the Line 1 CLING FILM 300M discrepancy exactly as in the facts. It states the claimed amount as 3.00 GBP inc. VAT, in formal and courteous English, and invents no figures, dates or commitments. It is ready to send unchanged. |
| gb-008 | 0.90 | 0.90 | llm | 5/5 | The e-mail cites invoice PCS6128 and its date 09/10/2026, and describes the total discrepancy with the exact figures from the facts (144.10 + 23.86 = 167.96 vs 168.86, difference 0.90). It states the claimed amount as 0.90 GBP inc. VAT, is written in formal English, and adds no invented data, so it can be sent unchanged. |
| gb-009 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice INV204024 dated 03/09/2026 and the Line 2 ("Onions, brown") issue with the 17.5 % rate and the permitted 0, 5 and 20 % rates. Because no amount is claimed, it correctly asks for a corrected invoice without inventing a figure. It is in English, formal and courteous, and adds no data beyond the facts, so it is ready to send. |
| gb-013 | 3.10 | 3.10 | llm | 5/5 | The e-mail cites invoice INV204036 and date 14/10/2026, describes the sole total discrepancy with the exact figures (106.01, 0.00, 109.11, 3.10), and states the claimed amount as 3.10 GBP inc. VAT. It is in English, formal and courteous, and the request for a corrected invoice or credit note is a reasonable action rather than invented data, so it is ready to send. |
| gb-027 | 21.24 | 21.24 | llm | 5/5 | The e-mail cites invoice TVD-26189 dated 13/10/2026, lists the single affected line with the exact invoiced and delivered quantities, and states 21.24 GBP inc. VAT as in the facts. It is in formal, courteous English with no threats, and it adds no invented figures, dates or commitments, so it is ready to send as is. |
| gb-029 | 24.80 | 24.80 | llm | 5/5 | The e-mail cites invoice PCS6216 and its date 09/10/2026, lists the single affected line (Plain flour 16kg, 2 sack, not on the delivery note), and states the amount 24.80 GBP inc. VAT exactly as in the facts. It is in English, formal and courteous, and invents no figures or commitments; the credit note or corrected invoice request is a reasonable remedy, so it is ready to send as is. |
| ie-001 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites the invoice number INV-30400 and date 01/09/2026, and reproduces the single total discrepancy (98.00 + 0.00 = 98.00 vs printed 96.00, difference 2.00) exactly. No amount is claimed, so it correctly asks for a corrected invoice or credit note without inventing a figure. It is in English, formal and courteous, and ready to send as is. |
| ie-002 | 2.50 | 2.50 | llm | 5/5 | The e-mail cites invoice MMP/071009 dated 29/09/2026, reproduces the Line 3 discrepancy exactly, and states the claimed amount of 2.50 EUR incl. VAT as given. It is in English, formal and courteous, and adds no figures, dates or commitments beyond the facts, so it is ready to send unchanged. |
| ie-008 | 1.20 | 1.20 | llm | 5/5 | The e-mail cites invoice ACS-5228 and date 02/10/2026, lists the only issue (line 2, Plain flour 16kg, 3 × 14.80 = 44.40 vs 45.60 printed), and states the claimed amount of 1.20 EUR incl. VAT exactly as in the facts. It is written in formal, courteous English and invents no data; the request for a corrected invoice or credit note is a reasonable, non-threatening action, so it is ready to send. |
| ie-011 | 0.90 | 0.90 | llm | 5/5 | The e-mail cites invoice SBD26070 dated 10/09/2026, reports the total discrepancy (775.00 + 176.28 = 951.28 vs printed 952.18, difference 0.90), and states the claimed amount as 0.90 EUR incl. VAT, exactly as in the facts. It is written in English in a formal, courteous tone and invents no data; the request for a corrected invoice or credit note is a reasonable ask rather than an invented commitment, so it is ready to send. |
| ie-016 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites invoice ACS-5260 and its date, lists the one affected line (Line 2) with the exact issue text, and asks for a corrected invoice without inventing an amount. It is in English and courteous. The only addition is the offer of a 'credit note with a replacement invoice', a mild alternative not in the facts, so it needs at most a minor style edit. |
| ie-027 | 232.47 | 232.47 | llm | 5/5 | The e-mail cites invoice SBD26189 dated 05/09/2026, lists the Stout keg 50L short delivery (3 invoiced, 2 delivered), and states the claimed amount of 232.47 EUR incl. VAT exactly as in the facts. It is in English, formal and courteous, and the request for a corrected invoice or credit note is a standard remedy that adds no invented figures, dates or commitments, so it is ready to send. |
| ie-029 | 33.95 | 33.95 | llm | 5/5 | The e-mail cites invoice ACS-5316 and its date 08/09/2026, lists the single affected line (Thick bleach 5L, 6 drums, not on the delivery docket) and states the claimed amount of 33.95 EUR incl. VAT exactly as in the facts. It is written in formal, courteous English with no threats, and it adds no invented figures or commitments, so it is ready to send as is. |
| it-002 | 1.24 | 1.24 | llm | 5/5 | The e-mail cites invoice SV/26/005205 of 05/10/2026 and the only listed issue, line 2 (MOZZARELLA FIOR DI LATTE) with the exact figures. It states 1,24 EUR IVA inclusa as in the facts. It is written entirely in formal, courteous Italian, invents nothing, and is ready to send unchanged. |
| it-006 | 3.10 | 3.10 | llm | 5/5 | The e-mail cites the invoice number SV/26/005225 and the date 13/10/2026, and it reports the total discrepancy with the exact figures from the facts (247,63 + 23,89 = 271,52 vs 274,62, difference 3,10). It states the claimed amount as 3,10 EUR IVA inclusa, is written entirely in Italian in a formal, courteous tone, and adds no invented data. The 'fattura corretta o nota di credito' request is a reasonable standard formulation, so it is ready to send as is. |
| it-007 | 1.22 | 1.22 | llm | 5/5 | The e-mail cites invoice EDV-2026-00892 dated 12/09/2026, reports the line 2 discrepancy exactly as in the facts, and states the amount as 1,22 EUR IVA inclusa. It is entirely in Italian, formal and courteous, with no threats and no invented figures, dates or names. The option of a corrected invoice or a credit note is a reasonable request rather than invented data, so it is ready to send. |
| it-018 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice SV/26/005285 dated 14/09/2026 and the only issue, line 2 (PELLICOLA ALIMENTARE 300M) with the invalid 21 % rate and the allowed rates. No amount is given in the facts, so it correctly asks for a corrected invoice or credit note without inventing one. It is in Italian, formal and courteous, and adds nothing beyond the facts, so it is ready to send. |
| it-021 | 0.00 | 0.00 | llm | 4/5 | The e-mail is in Italian and formal. It cites invoice 1260/2026 of 20/09/2026 and reports the total discrepancy (92,25 + 3,69 = 95,94 vs 93,94, Δ 2,00) with the exact figures. Since no amount is claimed, it correctly asks for a corrected invoice. The only flaw is the mention of a 'nota di credito', which the facts do not support and which makes little sense here because the printed total is lower than the computed one. Removing it is a minor edit. |
| it-027 | 10.25 | 10.25 | llm | 5/5 | The e-mail is written in Italian and cites invoice EDV-2026-00934 dated 21/09/2026. It lists the affected line (13 invoiced vs 10 delivered) and states the amount of 10,25 EUR IVA inclusa exactly as in the facts. The tone is formal and courteous, and nothing is invented, so it is ready to send. |
| it-029 | 46.28 | 46.28 | llm | 5/5 | The e-mail cites invoice PPE 368/26 of 17/09/2026, the olive oil line missing from the DDT, and the amount of 46,28 EUR exactly as in the facts, with the VAT-included note. It is entirely in Italian, formal and courteous, and adds no invented data or commitments, so it is ready to send as is. |
| it-032 | 1.50 | 1.50 | llm | 4/5 | The e-mail cites invoice 72/2026 of 26/09/2026, reproduces the total discrepancy exactly as in the facts, and states 1,50 EUR IVA inclusa. It is in Italian, formal and courteous, and invents no figures. The only addition is the option of a credit note alongside a corrected invoice, which is not in the facts and could be trimmed, so a minor edit is advisable. |
| pt-004 | 0.00 | 0.00 | llm | 4/5 | The e-mail is in Portuguese, cites invoice FT HT/3312 dated 09/10/2026 and the Line 3 discrepancy (7 × 0,45 = 3,15 vs 2,35) accurately, and asks for a corrective document without inventing an amount. Minor style point: offering a credit note as an alternative goes slightly beyond the facts, though it is a reasonable request and not invented data, so a light edit may be preferred.} |
| pt-009 | 0.00 | 0.00 | llm | 4/5 | The e-mail is in Portuguese and cites the invoice number, date and the total discrepancy with the exact figures from the facts. It invents no data and asks for a correction without stating a claimed amount. The 'nota de crédito' option is a slight addition, and the sign-off omits the restaurant's contact details, so minor style edits may be needed. |
| pt-014 | 0.00 | 0.00 | llm | 4/5 | The e-mail cites the invoice number and date, flags line 2 with the invalid 5 % rate, and asks for a corrected invoice without inventing an amount. It is in Portuguese and formal. The 'nota de crédito e nova fatura' alternative and the 'não reclamamos qualquer montante' sentence are small additions not in the facts, so minor edits are advisable, though they do not add figures or commitments.  |
| pt-015 | 1.50 | 1.50 | llm | 5/5 | The e-mail cites invoice FT DBT/26070 dated 26/09/2026, describes the total discrepancy with the exact figures (220,30 + 45,21 = 265,51 vs 267,01, difference 1,50), and states the claimed amount of 1,50 EUR IVA incluído. It is written entirely in formal European Portuguese, with a courteous tone and no invented data or threats, so it is ready to send as is. |
| pt-022 | 2.65 | 2.65 | llm | 5/5 | O e-mail cita corretamente o número e a data da fatura, a linha 1 com o cálculo e o valor impresso, e o montante de 2,65 EUR IVA incluído, tal como nos factos. Está inteiramente em português, com tom formal e cortês e sem ameaças. A menção a nota de crédito como alternativa é razoável e não acrescenta números, datas ou compromissos, pelo que o e-mail pode ser enviado tal como está. |
| pt-027 | 10.39 | 10.39 | llm | 5/5 | The e-mail cites invoice FT DBT/26135 of 15/10/2026, lists the only affected line (Aguardente velha 70cl, invoiced 2 gf, delivered 1.5 gf) and states the amount exactly as 10,39 EUR IVA incluído. It is written entirely in formal, courteous Portuguese and introduces no figures, dates or commitments beyond the facts. The corrective invoice or credit note request is a normal claim and not invented data, so it is ready to send. |
| pt-029 | 79.95 | 79.95 | llm | 5/5 | The e-mail cites the invoice number and date, lists the single affected line (Detergente máquina loiça 20L, 2 bidões, not on the guia de remessa) and states the amount of 79,95 EUR IVA incluído exactly as in the facts. It is written in formal, courteous European Portuguese with no invented data; the only minor redundancy is the double closing, which does not prevent sending it as is. |
| pt-032 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites the invoice number and date, identifies line 1 with the 23 % rate issue and the allowed rates (4, 12, 22 %) exactly as in the facts. No amount is claimed, and it correctly asks for a corrective invoice or credit note without inventing figures. It is written in formal, courteous European Portuguese and is ready to send. |
| pt-037 | 0.00 | 0.00 | llm | 5/5 | The e-mail cites invoice FT AA26/7385 dated 15/09/2026 and the single issue on line 6 (Vinho verdelho 75cl, 13% VAT rate not allowed in Açores). No amount is given in the facts, so it correctly asks for a corrected invoice or credit note without inventing a figure. It is written in formal, courteous Portuguese with no invented data, and is ready to send. |

## Field accuracy (final read)

| Field | Accuracy |
| --- | --- |
| docType | 100.0 % |
| documentNumber | 98.2 % |
| issueDate | 100.0 % |
| currency | 100.0 % |
| issuer.name | 100.0 % |
| issuer.taxId | 100.0 % |
| recipient.name | 99.3 % |
| recipient.taxId | 98.6 % |
| printedTaxBreakdown | 100.0 % |
| printedCharges | 100.0 % |
| printedTotal | 100.0 % |
| documentControlCode | 98.9 % |
| lines.description | 99.6 % |
| lines.quantity | 99.9 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 99.5 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Documents worth a look

- **de-002** (erp, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **de-005** (classic, photo, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **de-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH
  - ≠ recipient.name: expected "Wirtshaus am Viktualienmarkt GmbH", got "WIRTSHAUS AM VIRTUALIENMARKT GMBH"
  - ≠ lines[0].description: expected "FRISCHHALTEFOLIE 300M", got "FRISCHHALTEFOLIK 300M"
- **de-009** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "RE-2026-40424", got "RF-2026-40424"
- **de-013** (classic, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **de-017** (classic, scan, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **de-018** (erp, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **de-022** (erp, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ recipient.name: expected "Wirtshaus am Viktualienmarkt GmbH", got "WIRTSHAUS AM VIRTUALIENMARKT GMBH"
- **de-026** (delivery-note, scan) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[2].description: expected "RINDERHUEFTE", got "RINDERHUFTE"
- **de-027** (modern, photo, planted DELIVERY_SHORT) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — billed goods not delivered (8.57 incl. VAT, confirmed by a re-read of the delivery note) · reconciliation DISCREPANCIA (expected DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ recipient.taxId: expected "DE273415862", got "DE27415862"
- **dk-002** (erp, scan, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **dk-004** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **dk-005** (classic, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **dk-009** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **dk-010** (erp, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[5].description: expected "RUGBRØD, SKIVESKÅRET", got "RUGBRØD, SKIVEKÅRET"
- **dk-012** (classic, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **dk-014** (erp, scan, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
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
  - ≠ documentNumber: expected "T-77497", got "F-7749"
- **es-041** (erp, photo, planted DELIVERY_SHORT) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — billed goods not delivered (80.88 incl. VAT, confirmed by a re-read of the delivery note) · reconciliation DISCREPANCIA (expected DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[0].description: expected "JAMON CEBO IBERICO LONCHEADO 100G", got "JAMON CERDO IBERICO LONCHEADO 100G"
- **es-047** (erp, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **es-053** (classic, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **es-055** (erp, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED, LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED, LINE_MATH
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED, LINE_MATH
  - ≠ lines[2].quantity: expected 2.7, got 3
- **es-057** (classic, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **es-059** (erp, scan, planted CHARGE_AMOUNT) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on CHARGE_MISMATCH, TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:CHARGE_MISMATCH, TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:CHARGE_MISMATCH, TOTAL_MISMATCH · exact
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
- **fr-013** (classic, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentNumber: expected "FA-2026-010436", got "EA-2026-010436"
- **fr-016** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **fr-019** (modern, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **fr-025** (erp, photo) expected VALID → **VALID** — All checks passed on the first read · reconciliation SIN_DISCREPANCIA (expected SIN_DISCREPANCIA)
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ recipient.taxId: expected "FR14882149073", got null
  - ≠ lines[1].description: expected "JAMBON BLANC SUPERIEUR", got "JAMBON BLANC SUPPRIME"
- **gb-001** (classic, photo, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **gb-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **gb-008** (classic, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **gb-009** (classic, pdf, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **gb-013** (classic, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **gb-016** (classic, pdf, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **gb-022** (erp, pdf) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[0].discountPct: expected null, got 0
  - ≠ lines[1].discountPct: expected null, got 0
  - ≠ lines[2].discountPct: expected null, got 0
- **ie-001** (classic, scan, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **ie-002** (erp, scan, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **ie-006** (erp, pdf) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ lines[0].discountPct: expected null, got 0
  - ≠ lines[1].discountPct: expected null, got 0
  - ≠ lines[2].discountPct: expected null, got 0
  - ≠ lines[3].discountPct: expected null, got 0
- **ie-008** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **ie-011** (modern, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **ie-016** (classic, scan, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **ie-018** (erp, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ recipient.taxId: expected "IE4120876DH", got "IE41208760H"
- **ie-019** (modern, photo, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **it-002** (erp, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **it-006** (erp, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **it-007** (modern, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
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
- **it-032** (modern, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **pt-003** (modern, photo) expected VALID → **VALID** — All checks passed on the first read
  - #1 primary anthropic:claude-haiku-5-5:pass
  - ≠ documentControlCode: expected "C61EA055-26010", got "C61EAD55-26010"
- **pt-004** (classic, pdf, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH · exact
- **pt-009** (classic, photo, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH
  - ≠ documentControlCode: expected "0C08C80E-1524", got "0C08C86F-1524"
- **pt-011** (modern, scan, planted TAX_ID_CHECKSUM) expected INVALID_TAX_ID → **INVALID_TAX_ID** — reads #1 and #2 agree: the printed issuer tax id fails its checksum
  - #1 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
  - #2 primary anthropic:claude-haiku-5-5:INVALID_TAX_ID · exact
- **pt-014** (erp, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **pt-015** (modern, pdf, planted TOTAL_OFFSET) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on TOTAL_MISMATCH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
  - #2 primary anthropic:claude-haiku-5-5:TOTAL_MISMATCH · exact
- **pt-022** (erp, photo, planted LINE_MATH) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on LINE_MATH: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:LINE_MATH
  - #2 primary anthropic:claude-haiku-5-5:LINE_MATH
  - ≠ documentControlCode: expected "16C12A1E-8247", got "16C12AIE-8247"
- **pt-032** (classic, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
- **pt-037** (modern, photo, planted RATE_NOT_ALLOWED) expected SUPPLIER_DISCREPANCY → **SUPPLIER_DISCREPANCY** — reads #1 and #2 agree on RATE_NOT_ALLOWED: the document itself does not add up
  - #1 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
  - #2 primary anthropic:claude-haiku-5-5:RATE_NOT_ALLOWED · exact
