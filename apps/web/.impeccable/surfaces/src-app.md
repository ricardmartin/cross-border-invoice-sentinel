---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: []
---

# Surface brief: apps/web (Bandeja, Documento, Evals)

Mode: Operate. Audience: technical demo viewers reading it as a restaurant back-office tool. Job: see what needs action, process a document, understand a verdict and approve or discard a claim. Constraints: UI only, light + dark, dense, no retro costume, telemetry folded under "Detalles técnicos".

## Direction contract

THESIS: Audit working papers. Every figure the system checked carries an auditor's tickmark from one fixed legend (✓ recalculado, ⊗ no cuadra, ² dos lecturas, Σ sumado, A cotejado con albarán), so the verdict is proven on the page. Refuses the card-grid SaaS dashboard with status pills.

OWN-WORLD: Bone working-paper ground, graphite ink, red/green/blue pencil inks used only as tickmark and state colour. Public Sans with tabular figures. Hairline rules, 2–3px radius, no shadowed cards, no nested containers. Dark mode: graphite-night ground, same pencil inks lifted for contrast.

STORY: Viewer sees what needs action, opens a document, reads the verdict and the marked worksheet, sees which figure failed and that two reads agree, and approves a claim whose amount and recipient are on the button.

FIRST VIEWPORT: Top bar (brand, Bandeja/Evals, Procesar documento). Document page: scan pinned left 40%; right worksheet: tickmark legend strip, supplier heading + meta, verdict line, claim block with large amount and "Enviar reclamación de X", lines table with tickmark columns, taxes + totals with double-ruled Δ, folded Detalles técnicos. Inbox: work queue table sorted by needs-action plus processing panel.

FORM: Auditor working papers, my top-ranked grounded candidate (1 of 7), chosen by the user. seed:49990aac82bdd579

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
