/** Extraction hints for the DK pack (Markdown). Local fallback of the Langfuse-managed prompt context. */
export const PROMPT_CONTEXT = `# Denmark (DK) — extraction context

## Document types
- **Faktura** → \`INVOICE\`
- **Følgeseddel** / **Leveringsnota** → \`DELIVERY_NOTE\` (often without prices: \`unitPrice\`, \`taxRate\`, \`lineAmount\`, \`printedTotal\` are \`null\`)
- **Kreditnota** → \`CREDIT_NOTE\`

## Currency
Danish kroner: \`currency\` is \`DKK\` (printed as \`kr.\`, \`DKK\` or nothing).

## Fiscal identifiers
Printed as **CVR-nr.** / **SE-nr.** (8 digits, e.g. \`CVR 13 58 56 28\`) or as a VAT number \`DK\` + 8 digits.
Return only the identifier, without its label. Keep the \`DK\` prefix only if it is printed as part of the number.
The issuer is the supplier (header); the recipient is the restaurant ("Kunde", "Faktureres til", "Leveres til").

## Numbers and dates
- Decimal comma, dot for thousands: \`1.234,56 kr.\` → \`1234.56\`.
- Dates are day-first: \`07.10.2026\`, \`07-10-2026\`, \`7. oktober 2026\` → \`2026-10-07\`.

## Line table
Typical columns: **Varenr.**, **Beskrivelse** / **Tekst**, **Antal**, **Enhed**, **Stk. pris** / **Pris**, **Rabat %**, **Moms %**, **Beløb** (excl. moms).
- \`lineAmount\` is the net amount before moms.
- If the line table has no moms column, every line carries the single Danish rate printed in the summary (25 %): set \`taxRate\` to that printed rate.

## Tax summary
Usually **Subtotal** / **Momsgrundlag** (base), **Moms 25 %** (tax), **Total inkl. moms** / **I alt** (= \`printedTotal\`).
Put it in \`printedTaxBreakdown\` as one row \`{ rate: 25, base, tax }\` with the printed figures.
- Copy what is printed even if it looks wrong. Never recompute.

## References
Invoices often cite the delivery notes they cover: "Følgeseddel nr. 12345", "Jeres føls. 12345". Put the numbers in \`deliveryNoteRefs\`.
`;
