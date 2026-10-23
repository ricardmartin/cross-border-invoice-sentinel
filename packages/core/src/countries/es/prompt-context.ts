/** Extraction hints for the ES pack (Markdown). Local fallback of the Langfuse-managed prompt context. */
export const PROMPT_CONTEXT = `# Spain (ES) — extraction context

## Document types
- **Factura** / **Factura simplificada** (ticket) → \`INVOICE\`
- **Albarán** / **Nota de entrega** → \`DELIVERY_NOTE\` (often without prices: then \`unitPrice\`, \`taxRate\`, \`lineAmount\` and \`printedTotal\` are \`null\`)
- **Abono** / **Factura rectificativa** → \`CREDIT_NOTE\` (amounts may be printed negative or with a trailing minus: \`12,50-\`)

## Fiscal identifiers
Labelled **CIF**, **NIF**, **N.I.F.**, **NIE** or **NIF CLIENTE**. Return only the identifier, without the label (\`CIF: B12345674\` → \`B12345674\`); keep an \`ES\` prefix only if it is printed as part of the identifier.
Companies use a CIF (letter + 7 digits + control, e.g. \`B12345674\`); self-employed suppliers use a NIF (8 digits + letter).
The issuer is the supplier (usually top-left with logo); the recipient is the restaurant ("Cliente", "Facturar a").

## Numbers and dates
- Decimal comma, dot for thousands: \`1.234,56 €\`. Some ERPs print \`1234,56\`. Convert to JSON numbers (\`1234.56\`).
- Unit prices per kg often have 3 decimals (\`1,235 €/kg\`).
- Dates are day-first: \`03/10/2026\`, \`03-10-26\`, \`3 de octubre de 2026\` → \`2026-10-03\`.

## Line table
Typical columns: **Código**, **Descripción** / **Concepto**, **Cant.** / **Uds.**, **Precio** / **P. unit.**, **Dto.** (discount %), **% IVA**, **Importe**.
- \`lineAmount\` is the net amount (before IVA) in the **Importe** column.
- If there is no % IVA column, the rate may appear as a code (e.g. \`A\`, \`B\`) explained in the summary table; resolve it to the percentage.

## Tax summary (pie de factura)
A table with one row per rate: **Base imponible**, **% IVA**, **Cuota IVA**. Then **Total factura**.
- Rates for restaurant suppliers: 4 % (pan, leche, huevos, fruta, verdura), 10 % (resto de alimentos, agua), 21 % (alcohol, refrescos azucarados, limpieza, menaje).
- Copy what is printed even if it looks wrong. Never recompute.
- **Recargo de equivalencia** (R.E., 5,2 % / 1,4 % / 0,5 % next to each IVA rate) → \`printedCharges\` as \`SURCHARGE\`, one entry per rate, with its base and amount. Never in \`printedTaxBreakdown\`.
- **Retención IRPF** (e.g. "Retención 15 %", "IRPF -2 %") → \`printedCharges\` as \`WITHHOLDING\`, amount positive. If both "Total factura" and "Total a pagar" / "Líquido a percibir" are printed, \`printedTotal\` is the amount to pay.
- **Canarias** uses **IGIC** instead of IVA (0 %, 3 %, 7 %, 9,5 %, 15 %, 20 %): put the IGIC rates and amounts in \`taxRate\` and \`printedTaxBreakdown\` exactly like IVA.
- **Ceuta** and **Melilla** use **IPSI** instead of IVA (rates between 0,5 % and 10 %): same, put them in \`taxRate\` and \`printedTaxBreakdown\`.
- Copy the client's address with its postal code: the rates are checked against the region of the delivery address.

## References
Invoices often list the delivery notes they cover: "Albarán nº 4512", "S/Alb. 4512". Put them in \`deliveryNoteRefs\`.
`;
