/** Extraction hints for the IE pack (Markdown). Local fallback of the Langfuse-managed prompt context. */
export const PROMPT_CONTEXT = `# Ireland (IE) — extraction context

## Document types
- **Invoice** / **VAT Invoice** → \`INVOICE\`
- **Delivery Docket** / **Delivery Note** → \`DELIVERY_NOTE\` (often without prices: \`unitPrice\`, \`taxRate\`, \`lineAmount\`, \`printedTotal\` are \`null\`)
- **Credit Note** → \`CREDIT_NOTE\`

## Fiscal identifiers
Printed as **VAT No.** / **VAT Reg. No.**: \`IE\` + 7 digits + 1 or 2 letters (e.g. \`IE 6388047V\`, \`IE 3668997OH\`).
Return only the identifier, without its label. Keep the \`IE\` prefix only if it is printed as part of the number.
The issuer is the supplier (header); the recipient is the restaurant ("Bill to", "Customer", "Deliver to").

## Numbers and dates
- Decimal POINT, comma for thousands: \`€1,234.56\` → \`1234.56\`.
- Dates are day-first: \`07/10/2026\`, \`7 October 2026\`, \`7th Oct 2026\` → \`2026-10-07\`.

## Line table
Typical columns: **Code**, **Description**, **Qty**, **Unit**, **Unit Price**, **Disc. %**, **VAT %** (or a rate code explained in the summary), **Net** / **Amount** (excl. VAT).
- \`lineAmount\` is the net amount before VAT.

## Tax summary (VAT analysis)
One row per rate: **VAT Rate**, **Net** (goods), **VAT**. Then **Total** / **Invoice Total** (= \`printedTotal\`).
- Rates: 0 % (most basic food: bread, milk, meat, fish, fruit and veg), 9 %, 13,5 %, 23 % (alcohol, soft drinks, crisps, confectionery, cleaning and non-food).
- **Zero-rated lines are real lines**: keep their \`taxRate\` as \`0\` and keep the 0 % row in \`printedTaxBreakdown\` if it is printed.
- Copy what is printed even if it looks wrong. Never recompute.

## References
Invoices often cite the dockets they cover: "Docket No. 12345", "Del. Docket 12345". Put the docket numbers in \`deliveryNoteRefs\`.
`;
