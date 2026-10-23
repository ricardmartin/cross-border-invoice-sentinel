# Design: audit working papers

Invoice Sentinel looks like an auditor's working paper: every figure the system checked carries a tickmark from one fixed legend, so a verdict is proven on the page instead of asserted. Tokens live in [src/app/globals.css](src/app/globals.css); this file records the rules behind them.

## Colour

Restrained: bone paper, graphite ink, and three pencil inks that only ever carry meaning.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#f4f2ec` | `#1a1a18` | page ground |
| `sheet` | `#fbfaf6` | `#222220` | header, claim block, legend, inputs |
| `scan` | `#ebe8df` | `#131312` | panel behind the original document |
| `foreground` | `#2b2b29` | `#ebeae4` | ink, primary button |
| `muted-foreground` | `#5c5b55` | `#b1afa6` | secondary text (≥ 4.5:1) |
| `faint` | `#8a887f` | `#85837b` | non-text only (chevrons, empty dashes) |
| `border` / `rule` | `#d9d5c9` / `#e7e4da` | `#3b3a36` / `#2d2c29` | hairlines between rows / inside sections |
| `ok` | `#26683f` | `#74c494` | green pencil: recalculated, adds up |
| `danger` | `#b02828` | `#f2837a` | red pencil: does not add up, discrepancy |
| `danger-soft` | `#f6e3df` | `#3a211e` | row tint for flagged lines, alerts |
| `info` | `#1d559e` | `#85b0f0` | blue pencil: confirmed by two reads, doubtful read, focus ring |

Dark mode follows `prefers-color-scheme` unless the header toggle (system · light · dark) forces one: the choice is a `theme` cookie that the server writes as `data-theme` on `<html>`, so there is no flash. Tokens and the `dark:` variant both obey it. No other hues; no gradients.

## Tickmarks

One legend for the whole app ([src/components/audit.tsx](src/components/audit.tsx)). A mark is only drawn when the data on the page backs it.

| Mark | Meaning | Drawn when |
| --- | --- | --- |
| ✓ | recalculado, cuadra | computed value equals printed value (±0,02) |
| ⊗ | no cuadra | computed ≠ printed, delivery mismatch, failed check |
| ² | confirmado por dos lecturas | ≥ 2 reads and the verdict rests on them (supplier discrepancy, invalid tax id) |
| Σ | sumado en código | the figure was computed by the validator |
| A | cotejado con albarán | the line was reconciled with a delivery note |
| ? | las lecturas no coinciden | doubtful read (EXTRACTION_UNCERTAIN) |

Marks sit in a narrow column right after the figure they qualify. Status is always mark + words, never colour alone; each mark has an sr-only label.

## Type

Public Sans (latin + latin-ext) with tabular lining figures everywhere. Base 13px. Page title 20px bold; claim amount 26px bold; section heads 11.5px bold uppercase, tracked 0.07em, on a hairline. Monospace (system stack) only for codes and ids: tax ids, sample ids, issue codes, run names.

## Shape and structure

- Radius 2–3px. Hairline rules, no shadows, no cards, no nested containers.
- Sections are a heading on a rule; tables have a 1px ink rule under the header row and `rule` lines between rows.
- Totals close with a 3px double rule; the Δ row exists only when there is a difference.
- The only boxed element is the claim block (1px ink border on `sheet`): the human decision is the weightiest thing on the page.
- Tags are small rectangles (`Badge`), not pills.

## Components

- `Button`: `default` (ink fill), `outline`, `ghost`, `danger`. Sizes 28/32/36px.
- Claim approval is two-step inline (no modal): the button names the action and amount, then asks "¿Enviar a {proveedor}…?" with Cancelar. Discard confirms too.
- Hover glossary ([src/components/glossary.tsx](src/components/glossary.tsx), terms in [src/lib/glossary.ts](src/lib/glossary.ts)): known terms in `<main>` get a dotted `faint` underline via the CSS Custom Highlight API (React's DOM is never touched); resting the pointer 350 ms, or a 450 ms long press, opens a card on `sheet` with a 1px ink border. The book button in the header turns it off (`glossary` cookie). `/glosario` lists every term, with search and a review mode. Mark a subtree `data-no-glossary` to exclude it.
- Technical telemetry (model, cost, latency, reads, Langfuse, engine reason, planted errors) lives in `<details>` "Detalles técnicos", closed by default.

## Layout

- Header 48px, sticky, `sheet` ground; nav with underline for the current page (`aria-current`).
- Inbox: work-queue table (claims to approve, then doubtful reads, then the rest) + 380px processing panel, sticky on desktop.
- Document: original scan pinned left (2/5), working paper right (3/5); stacks on mobile with tables scrolling inside their own box.
- Documentos (`/muestras`): the dataset catalogue, readable without processing anything. Filters are plain links (`?pais=`, `?tipo=`, `?caso=`, `?eval=`), so they work without client JavaScript and can be bookmarked. A sample page uses the document layout: what the document really says (ground truth), the engine run on it (pure, free), the expected outcome and what the latest eval run did.
- Resultados (`/resultados`): one row per document of an eval run (`?run=` picks another), failures first.
- Países (`/paises`): one comparison table against the baseline, then each pack's rules as a definition list.
- Tickmarks are `relative` so their sr-only label stays inside a scrolling table instead of widening the page.
- Grids declare `grid-cols-[minmax(0,1fr)]` on mobile so wide tables never widen the page.
