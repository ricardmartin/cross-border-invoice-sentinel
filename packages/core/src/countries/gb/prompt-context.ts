/** Extraction hints for the GB pack (Markdown). Local fallback of the Langfuse-managed prompt context. */
export const PROMPT_CONTEXT = `# United Kingdom (GB) — extraction context

## Document types
- **Invoice** / **VAT Invoice** / **Tax Invoice** → \`INVOICE\`
- **Delivery Note** / **Despatch Note** → \`DELIVERY_NOTE\` (often without prices: \`unitPrice\`, \`taxRate\`, \`lineAmount\`, \`printedTotal\` are \`null\`)
- **Credit Note** → \`CREDIT_NOTE\`

## Currency
Pounds sterling: \`currency\` is \`GBP\` (printed as \`£\`).

## Fiscal identifiers
Printed as **VAT Reg No.** / **VAT No.**: 9 digits, often grouped \`GB 123 4567 89\` (\`XI\` in Northern Ireland).
Return only the identifier, without its label. Keep the \`GB\` prefix only if it is printed as part of the number. A Companies House number ("Company No.") is NOT the VAT number.
The issuer is the supplier (header); the recipient is the restaurant ("Invoice to", "Customer", "Deliver to").

## Numbers and dates
- Decimal POINT, comma for thousands: \`£1,234.56\` → \`1234.56\`.
- Dates are day-first: \`07/10/2026\`, \`7 October 2026\`, \`7th Oct 2026\` → \`2026-10-07\`.

## Line table
Typical columns: **Code**, **Description**, **Qty**, **Unit**, **Unit Price**, **Disc. %**, **VAT %** (or a code such as \`S\` = standard, \`Z\` = zero explained in the summary; resolve it to the percentage), **Net** / **Amount** (excl. VAT).
- \`lineAmount\` is the net amount before VAT.

## Tax summary (VAT analysis)
One row per rate: **VAT Rate**, **Net**, **VAT**. Then **Total** / **Invoice Total** (= \`printedTotal\`).
- Rates: 0 % (most food: bread, milk, meat, fish, fruit and veg), 5 %, 20 % (alcohol, soft drinks, crisps, confectionery, cleaning and non-food).
- **Zero-rated lines are real lines**: keep their \`taxRate\` as \`0\` and keep the 0 % row in \`printedTaxBreakdown\` if it is printed.
- Copy what is printed even if it looks wrong. Never recompute.

## References
Invoices often cite the delivery notes they cover: "Delivery Note 12345", "DN 12345". Put the numbers in \`deliveryNoteRefs\`.
`;
