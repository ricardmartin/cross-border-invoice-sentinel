/** Extraction hints for the FR pack (Markdown). Local fallback of the Langfuse-managed prompt context. */
export const PROMPT_CONTEXT = `# France (FR) — extraction context

## Document types
- **Facture** → \`INVOICE\`
- **Bon de livraison** (BL) / **Bordereau de livraison** → \`DELIVERY_NOTE\` (usually without prices: \`unitPrice\`, \`taxRate\`, \`lineAmount\`, \`printedTotal\` are \`null\`)
- **Avoir** / **Facture d'avoir** → \`CREDIT_NOTE\`

## Fiscal identifiers
Printed as **SIRET** (14 digits), **SIREN** (9 digits) or **N° TVA intracommunautaire** (\`FR\` + 2-digit key + SIREN, e.g. \`FR40 303 265 045\`).
Return only the identifier, without its label, and without spaces is fine. If both SIRET and TVA number are printed for the issuer, prefer the **TVA intracommunautaire** number.
The issuer is the supplier (header); the recipient is the restaurant ("Client", "Facturé à", "Livré à").

## Numbers and dates
- Decimal comma, thousands separated by a (narrow) space: \`1 234,56 €\` → \`1234.56\`.
- Dates are day-first: \`07/10/2026\`, \`7 octobre 2026\`, \`1er octobre 2026\` → ISO.

## Line table
Typical columns: **Réf.**, **Désignation**, **Qté**, **Unité**, **PU HT** (unit price excl. tax), **Remise** (discount %), **TVA** (rate or a code explained in the summary), **Montant HT**.
- \`lineAmount\` is **Montant HT** (excl. tax).

## Tax summary
One row per rate: **Base HT** / **Total HT**, **Taux**, **Montant TVA**. Then **Total TTC** (= \`printedTotal\`).
- Rates for restaurant suppliers: 5,5 % (food), 10 % (some prepared products), 20 % (alcohol, non-food).
- Copy what is printed even if it looks wrong. Never recompute.

## References
Invoices often cite the delivery notes they cover: "BL n° 12345", "Bon de livraison 12345 du 03/10". Put the numbers in \`deliveryNoteRefs\`.
`;
