/** Extraction hints for the IT pack (Markdown). Local fallback of the Langfuse-managed prompt context. */
export const PROMPT_CONTEXT = `# Italy (IT) — extraction context

## Document types
- **Fattura** (immediata o differita) → \`INVOICE\`
- **DDT** / **Documento di trasporto** / **Bolla** → \`DELIVERY_NOTE\` (often without prices: \`unitPrice\`, \`taxRate\`, \`lineAmount\`, \`printedTotal\` are \`null\`)
- **Nota di credito** → \`CREDIT_NOTE\`

## Fiscal identifiers
Printed as **P.IVA** / **Partita IVA** (11 digits, sometimes \`IT\` + 11 digits) and **C.F.** / **Codice fiscale**.
For a company issuer, return the **Partita IVA** (only the identifier, without the label). Keep the \`IT\` prefix only if it is printed as part of the number.
The issuer is the "cedente/prestatore" (supplier); the recipient is the "cessionario/committente" (the restaurant).

## Numbers and dates
- Decimal comma, dot for thousands: \`1.234,56 €\` → \`1234.56\`.
- Dates are day-first: \`07/10/2026\`, \`7 ottobre 2026\` → ISO.

## Line table
Typical columns: **Codice**, **Descrizione**, **Q.tà**, **U.M.**, **Prezzo unitario**, **Sconto %**, **IVA %** (or a code such as \`22\`, \`10\`), **Importo** (excl. VAT).
- \`lineAmount\` is **Importo** (imponibile della riga).

## Tax summary (riepilogo IVA)
One row per rate: **Aliquota**, **Imponibile**, **Imposta**. Then **Totale documento** (= \`printedTotal\`).
- Rates: 4 % (pane, latte, pasta, frutta e verdura…), 5 %, 10 % (carne, pesce, salumi…), 22 % (vino, birra, prodotti non alimentari).
- **Ritenuta d'acconto** (e.g. "Ritenuta d'acconto 20 % su 500,00") → \`printedCharges\` as \`WITHHOLDING\`, with its rate, base and amount (positive). When both **Totale documento** and **Netto a pagare** are printed, \`printedTotal\` is **Netto a pagare**.
- **Bollo** / **Imposta di bollo** (usually 2,00 €) → \`printedCharges\` as \`STAMP_DUTY\`, rate and base \`null\`.
- Ignore "split payment" lines (out of scope). Never put any of these rows in the breakdown.
- Copy what is printed even if it looks wrong. Never recompute.

## References
A "fattura differita" lists the DDTs it covers: "Rif. DDT n. 1234 del 03/10/2026". Put the DDT numbers in \`deliveryNoteRefs\`.
`;
