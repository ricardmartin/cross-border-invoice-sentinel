/** Extraction hints for the DE pack (Markdown). Local fallback of the Langfuse-managed prompt context. */
export const PROMPT_CONTEXT = `# Germany (DE) — extraction context

## Document types
- **Rechnung** → \`INVOICE\`
- **Lieferschein** → \`DELIVERY_NOTE\` (often without prices: \`unitPrice\`, \`taxRate\`, \`lineAmount\`, \`printedTotal\` are \`null\`)
- **Gutschrift** / **Rechnungskorrektur** / **Stornorechnung** → \`CREDIT_NOTE\`

## Fiscal identifiers
Printed as **USt-IdNr.** (\`DE\` + 9 digits, e.g. \`DE 136 695 976\`) and/or **Steuernummer** (e.g. \`12/345/67890\`).
Return only the identifier, without its label. If both are printed for the issuer, prefer the **USt-IdNr.**; keep the \`DE\` prefix only if it is printed as part of the number.
The issuer is the supplier (header); the recipient is the restaurant ("Kunde", "Rechnungsempfänger", "Lieferanschrift").

## Numbers and dates
- Decimal comma, dot for thousands: \`1.234,56 €\` → \`1234.56\`.
- Dates are day-first: \`07.10.2026\`, \`7. Oktober 2026\` → \`2026-10-07\`.

## Line table
Typical columns: **Pos.**, **Art.-Nr.**, **Bezeichnung** / **Artikel**, **Menge**, **Einheit** / **ME**, **Einzelpreis** (net), **Rabatt %**, **USt. %** / **MwSt. %** (or a code such as \`A\`/\`B\` explained in the summary), **Gesamt** / **Betrag** (net).
- \`lineAmount\` is the net line amount before VAT.

## Tax summary
One row per rate: **MwSt.-Satz** / **USt.-Satz**, **Netto**, **MwSt.** / **USt.**. Then **Gesamtbetrag** / **Brutto** / **Rechnungsbetrag** (= \`printedTotal\`).
- Rates: 7 % (food), 19 % (drinks other than milk, alcohol, non-food).
- Copy what is printed even if it looks wrong. Never recompute.

## References
Invoices often cite the delivery notes they cover: "Lieferschein Nr. 12345 vom 03.10.2026", "LS-Nr. 12345". Put the numbers in \`deliveryNoteRefs\`.
`;
