# `nogit-anthropic_claude-haiku-5-5-extract-v1` → `nogit-anthropic_claude-haiku-5-5-extract-v2`

| Metric | Baseline | Candidate | Δ |
| --- | --- | --- | --- |
| Documents 100 % correct | 83.3 % | 90.0 % | +6.7 pts |
| Line F1 | 100.0 % | 100.0 % | +0.0 pts |
| Validator flags clean docs | 4.5 % | 0.0 % | -4.5 pts |
| Planted errors detected | 100.0 % | 100.0 % | +0.0 pts |
| Cost / doc | $0.00103 | $0.00103 | 0 % |
| Latency p50 | 5077 ms | 4786 ms | -291 ms |
| Latency p95 | 8286 ms | 6297 ms | -1989 ms |
| Failed calls | 0 | 0 | 0 |

## Fields that changed

| Field | Baseline | Candidate | Δ |
| --- | --- | --- | --- |
| issueDate | 100.0 % | 96.7 % | -3.3 pts |
| issuer.taxId | 90.0 % | 100.0 % | +10.0 pts |
| recipient.taxId | 90.0 % | 100.0 % | +10.0 pts |

## Documents that changed

- ✔ fixed **es-011**
- ✖ regressed **es-017**: issueDate: expected "2026-09-23", got "2026-09-26"
- ✔ fixed **es-018**
- ✔ fixed **es-025**
