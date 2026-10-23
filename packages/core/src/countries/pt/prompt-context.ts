/** Extraction hints for the PT pack (Markdown). Local fallback of the Langfuse-managed prompt context. */
export const PROMPT_CONTEXT = `# Portugal (PT) — extraction context

## Document types
- **Fatura** / **Fatura-Recibo** / **Fatura simplificada** (series codes \`FT\`, \`FR\`, \`FS\`) → \`INVOICE\`
- **Guia de remessa** / **Guia de transporte** (\`GR\`, \`GT\`) → \`DELIVERY_NOTE\` (often without prices: \`unitPrice\`, \`taxRate\`, \`lineAmount\`, \`printedTotal\` are \`null\`)
- **Nota de crédito** (\`NC\`) → \`CREDIT_NOTE\`

## Fiscal identifiers
Printed as **NIF**, **NIPC** or **Contribuinte** (9 digits, e.g. \`503 504 564\`, sometimes \`PT\` + 9 digits).
Return only the identifier, without its label. Keep the \`PT\` prefix only if it is printed as part of the number.
The issuer is the supplier (header); the recipient is the restaurant ("Cliente", "Adquirente").
Copy the **ATCUD** (\`ATCUD: JFQ4K2M7-1500\`) into \`documentControlCode\` without its label (\`JFQ4K2M7-1500\`); it is not the document number. Ignore the QR code.

## Numbers and dates
- Decimal comma, thousands separated by a space or a dot: \`1 234,56 €\`, \`1.234,56 €\` → \`1234.56\`.
- Dates are day-first: \`07/10/2026\`, \`2026-10-07\`, \`7 de outubro de 2026\` → ISO.

## Line table
Typical columns: **Ref.** / **Artigo**, **Descrição**, **Qtd.**, **Un.**, **Preço unit.**, **Desc. %**, **IVA %** (or **Taxa**), **Valor** / **Total líquido** (excl. VAT).
- \`lineAmount\` is the net line value before IVA.

## Tax summary (Quadro resumo do IVA)
One row per rate: **Taxa**, **Incidência** (base), **Valor IVA**. Then **Total** (= \`printedTotal\`).
- Mainland rates: 6 % (pão, leite, carne, peixe, fruta e legumes, água), 13 % (vinho, algumas conservas), 23 % (cerveja, bebidas espirituosas, refrigerantes, limpeza, descartáveis).
- The autonomous regions have lower rates: Madeira 4 / 12 / 22 %, Açores 4 / 9 / 16 %. Transcribe the rate printed on each line; do not convert it to the mainland one.
- Copy the client's address with its postal code (\`9500-123 Ponta Delgada\`): the rates are checked against the region of the delivery address.
- Copy what is printed even if it looks wrong. Never recompute.

## References
Invoices often cite the guias they cover: "Guia de remessa GR 2026/1234", "V/ Guia n.º 1234". Put the guia numbers in \`deliveryNoteRefs\`.
`;
