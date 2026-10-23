# Eval run `nogit-anthropic_claude-haiku-5-5-extract-v1`

Model `anthropic:claude-haiku-5-5` · prompt `extract-v1` · countries ES · 2026-10-18T21:03:57.501Z

## Headline

| Metric | Value |
| --- | --- |
| Documents 100 % correct | **83.3 %** (25/30) |
| Line F1 | 100.0 % |
| Validator flags clean docs (→ retry in phase 3) | 4.5 % |
| Validator catches wrong extractions (clean docs) | 33.3 % |
| Planted errors detected (single shot) | 100.0 % |
| Cost / doc | $0.00103 |
| Latency p50 / p95 | 5077 ms / 8286 ms |
| Failed calls | 0 |

## Field accuracy

| Field | Accuracy |
| --- | --- |
| docType | 100.0 % |
| documentNumber | 93.3 % |
| issueDate | 100.0 % |
| currency | 100.0 % |
| issuer.name | 100.0 % |
| issuer.taxId | 90.0 % |
| recipient.name | 100.0 % |
| recipient.taxId | 90.0 % |
| printedTaxBreakdown | 100.0 % |
| printedTotal | 100.0 % |
| lines.description | 100.0 % |
| lines.quantity | 100.0 % |
| lines.unitPrice | 100.0 % |
| lines.discountPct | 100.0 % |
| lines.taxRate | 100.0 % |
| lines.lineAmount | 100.0 % |

## Exact rate by render mode / template

| Group | n | 100 % correct |
| --- | --- | --- |
| mode: photo | 10 | 80.0 % |
| mode: pdf | 10 | 100.0 % |
| mode: scan | 10 | 70.0 % |
| template: clasica | 12 | 91.7 % |
| template: erp | 6 | 100.0 % |
| template: moderna | 6 | 83.3 % |
| template: ticket | 6 | 50.0 % |

## Documents with mismatches

- **es-005** (ticket, photo) · validator: pass
  - documentNumber: expected "T-77172", got "9-77172"
- **es-011** (clasica, scan, planted TOTAL_OFFSET) · validator: INVALID_TAX_ID, TOTAL_MISMATCH
  - issuer.taxId: expected "B46391272", got "CIF B46391272"
  - recipient.taxId: expected "B27543107", got "CIF B27543107"
- **es-018** (moderna, scan, planted TAX_ID_CHECKSUM) · validator: INVALID_TAX_ID
  - issuer.taxId: expected "B50274433", got "NIF B50274433"
  - recipient.taxId: expected "B27543107", got "NIF B27543107"
- **es-025** (ticket, scan) · validator: INVALID_TAX_ID
  - issuer.taxId: expected "50731846X", got "NIF 50731846X"
  - recipient.taxId: expected "B27543107", got "NIF CLIENTE: B27543107"
- **es-030** (ticket, photo) · validator: pass
  - documentNumber: expected "T-77497", got "T-7749"
