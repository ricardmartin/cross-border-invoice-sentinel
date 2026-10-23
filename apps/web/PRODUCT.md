# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary today: people evaluating the system as a technical demo / portfolio piece (engineers, hiring managers, prospective clients). They pick a dataset sample or upload a document, watch it get processed, and inspect why the system reached its verdict.

The interface is modelled on the real end user it represents: a restaurant's back-office person (manager or admin) who checks supplier invoices and delivery notes and approves or discards claims to suppliers. The demo must read as that working tool, not as a showcase page.

## Product Purpose

Read supplier invoices, delivery notes and credit notes from restaurants in any supported country (ES, FR, IT, PT, IE, DK, DE, GB), check that they add up under that country's tax rules, reconcile invoices against what was delivered, and draft a claim to the supplier when something is wrong. A person approves every claim before it is sent. Success for the demo: a viewer understands within one document what was checked, what did not add up, by how much, and why the supplier (not the read) is being blamed.

## Positioning

The LLM only transcribes; every number is recomputed deterministically in integer cents. A discrepancy only counts when two independent reads agree, doubt ends in human review (EXTRACTION_UNCERTAIN), never in a claim, and nothing reaches a supplier without human approval. Per-country packs and per-country evals with a regression gate.

## Operating Context

- Inbox ("Bandeja"): processed documents plus the action to process a new one (dataset sample by country, or upload PDF/JPG/PNG). Both must be visible on the main screen.
- Document view: the scanned document beside the extracted data, line table (printed vs computed vs delivered), tax brackets computed vs printed, reconciliation with delivery note, validation issues, model reads, and the claim draft with approve / edit / discard.
- Evals view: per-country × metric table with baseline and regression gate, per-model comparison, run history.
- UI copy is Spanish (es-ES). Amounts are formatted with each country pack's locale.

## Capabilities and Constraints

- Statuses: VALID, SUPPLIER_DISCREPANCY, EXTRACTION_UNCERTAIN, INVALID_TAX_ID. Record states: completed, awaiting_review.
- Sending is simulated (outbox). Langfuse tracing optional.
- Dev telemetry (model id, cost in USD, latency, attempts, trace link, planted-error labels) stays available but folded under "Detalles técnicos", not in the primary view.
- Redesign scope is UI only: no changes to API routes, `@sentinel/core`, or pipeline logic.
- Next.js 16 App Router, React 19, Tailwind v4 (CSS-first), lucide-react.

## Evidence on Hand

- Labelled datasets per country in `evals/datasets/<cc>/` (synthetic generated invoices/delivery notes with planted errors).
- Eval reports in `evals/reports/`.
- No real customers, testimonials or production metrics; do not invent any.

## Product Principles

1. Show the arithmetic: every verdict is backed by visible printed-vs-computed figures.
2. Blame the read before the supplier, and make that visible.
3. The human decision is the weightiest moment in the product.
4. Dense and serious: many figures at a glance, no decorative theme.
5. Technical depth on demand, never in the way.

## Accessibility & Inclusion

Light and dark mode must both work fully. WCAG AA contrast for text and controls. Status never conveyed by colour alone.
