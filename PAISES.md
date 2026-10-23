# Estado de los países — 2026-10-21

Estado de cada país. Visión general del proyecto en [ESTADO.md](ESTADO.md); detalle técnico en [NOTES.md](NOTES.md) (secciones "New countries" y "Tax regions").

## Resumen

| País | Pack | Moneda | Tipos (%) | Regiones | Docs | 100 % correctos | Juez | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ES | 1.1.0 | EUR | 4 · 10 · 21 | Canarias (IGIC 0 · 3 · 7 · 9,5 · 15 · 20) | 51 | 93,3 % | 4,67 | regiones **sin evaluar** |
| FR | 1.0.0 | EUR | 5,5 · 10 · 20 | — | 30 | 96,7 % | 4,71 | estable |
| IT | 1.0.0 | EUR | 4 · 5 · 10 · 22 | — | 30 | 93,3 % | 4,86 | estable |
| PT | 1.1.0 | EUR | 6 · 13 · 23 | Madeira (4 · 12 · 22), Azores (4 · 9 · 16) | 40 | 100 % | 4,43 | regiones **sin evaluar** |
| IE | 1.0.0 | EUR | 0 · 9 · 13,5 · 23 | — | 30 | 93,3 % | 5,00 | estable |
| DK | 1.0.0 | DKK | 25 | — | 30 | 96,7 % | 4,14 | arreglo pendiente (idioma) |
| DE | 1.0.0 | EUR | 7 · 19 | — | 30 | 86,7 % | 4,43 | arreglo pendiente ("unserer Rechnung") |
| GB | 1.0.0 | GBP | 0 · 5 · 20 | — | 30 | 96,7 % | 5,00 | estable |

En los 8 países, estado final, recall de discrepancias y conciliación están al 100 %, y las reclamaciones injustas al 0 %. `baseline.json` incluye los 8. Los números de ES y PT son de **antes** de las regiones: las cifras de ES vienen de la ejecución `d901767` y las de PT de la de los países nuevos.

## Qué cubre cada país

- **ES**:
  - CIF/NIF/NIE con dígito de control.
  - Canarias (CP 35xxx/38xxx) usa IGIC y la reclamación dice "IGIC incluido".
  - Ceuta (51xxx) y Melilla (52xxx) usan IPSI. Los tipos los fija cada año una ordenanza de cada ciudad, así que el pack acepta todo el rango (0,5–10 %) y solo rechaza los tipos de IVA (21 %). **Hay que verificarlo contra el BOCCE y el BOME** antes de fiarse.
  - **Recargo de equivalencia** (5,2 / 1,4 / 0,62 / 0,5 % según el tipo de IVA) y **retención de IRPF** (1 / 2 / 7 / 15 / 19 %) entran en el cálculo del total. Antes se ignoraban: el total no cuadraba y la factura habría acabado en una reclamación injusta. El recargo deja además un aviso para revisión humana, porque un restaurante normalmente no está en ese régimen.
  - `es-001`…`es-030` no se tocan nunca; `es-046`…`es-051` son las facturas de Canarias; `es-052`…`es-055`, las de Ceuta y Melilla; `es-056`…`es-059`, las de IRPF y recargo (con un error sembrado en cada tipo).
- **FR / IT**: los primeros packs tras ES. Las plantillas generan HTML idéntico byte a byte después de la generalización.
- **IT**: **ritenuta d'acconto** (4 / 20 / 23 %) y **bollo** (2,00 € fijos) entran en el total; el bollo en una factura con IVA deja un aviso, porque solo se debe sobre importes sin IVA de más de 77,47 €. `it-031`…`it-033`. El split payment sigue fuera de alcance: solo se aplica a la administración pública.
- **PT**:
  - Continente, más Madeira (CP 9000–9499) y Azores (9500–9999).
  - **ATCUD**: se transcribe (`documentControlCode`) y se comprueba que exista, que tenga la forma `<código>-<número>` y que el número coincida con el de la factura. Solo genera avisos: es un incumplimiento del proveedor, no un importe que reclamar.
  - `pt-031`…`pt-040` son los documentos regionales: 5 de Madeira y 5 de Azores, con 1 error sembrado por región.
- **IE / GB**:
  - El 0 % es un tipo legal (con su propio tramo) y el separador decimal es el punto.
  - GB acepta el prefijo `XI` (Irlanda del Norte) y números de sucursal de 12 dígitos.
- **DK**: un único tipo (25 %), corona danesa (DKK) y CVR con módulo 11.
- **DE**:
  - USt-IdNr. con ISO 7064 MOD 11,10, o Steuernummer (solo formato).
  - `ß` pasa a `SS` en mayúsculas, y la comparación de textos de las evals lo tiene en cuenta.

La región se decide por el código postal del cliente o, si no está impreso, por el del proveedor (`taxRegimeFor` en [regions.ts](packages/core/src/countries/regions.ts)).

## Cambios del 2026-10-21 (tarde)

- Esquema de extracción: `printedCharges` (recargos, retenciones y timbres) y `documentControlCode` (ATCUD). Son opcionales, así que las ground truths antiguas siguen siendo válidas. `EXTRACTION_PROMPT_VERSION` = `extract-v3`.
- Motor: los cargos se calculan en céntimos a partir de su tipo y su base. El total impreso puede ser el bruto o el líquido a pagar, después de la retención. Un cargo que el país no tiene (`CHARGE_NOT_ALLOWED`) se trata como un error de lectura y nunca acaba en reclamación.
- Reclamaciones: `claim-v6` arregla "unserer Rechnung" en alemán y las palabras en inglés que se colaban en el correo danés.
- Packs: ES 1.2.0, IT 1.1.0, PT 1.2.0.

## Resultado de la ejecución `6fbe466` (2026-10-21, 282 documentos, `extract-v3`, `claim-v6`)

- En los 8 países: estado final, recall y precisión de discrepancias, conciliación e importe reclamado al 100 %; **reclamaciones injustas al 0 %**.
- Juez de reclamaciones: DE pasa de 4,43 a 4,71 y DK de 4,14 a 4,71 (de-006 y dk-002, de 3/5 a 5/5).
- La primera ejecución encontró **una reclamación injusta en de-025**: el albarán se leyó "RINDERHUFTE" y la factura "RINDERHUEFTE", la conciliación no emparejó las líneas y reclamó 99,16 €. Arreglado en `normalizeDescription` (ü/ue/u, ß/ss, æ, ø) y con una letra de tolerancia en palabras de 6 o más caracteres; tests en `reconcile.test.ts`.
- **Gate: falla solo por PT, "Documentos 100 % correctos" 92,5 % (baseline 100 %).** Los 3 fallos son el campo nuevo, el ATCUD, mal leído en escaneos y fotos (`0`↔`D`, `1`↔`I`). No cambian ningún estado ni reclamación, porque el ATCUD solo genera avisos. El baseline todavía no mide ese campo.

## Pendiente, por prioridad

1. **Decidir el baseline de PT**: aceptar el 92,5 % con `--update-baseline` (ejecución completa, gratis desde la caché) o leer el ATCUD del **código QR**, que lo lleva codificado y se lee sin LLM.
2. **IPSI**: verificar los tipos contra las ordenanzas vigentes de Ceuta (BOCCE) y Melilla (BOME).
3. Opcional: validar el ID fiscal del **receptor** contra el del restaurante. de-027 leyó `DE274315862` en vez de `DE273415862`, y los dos pasan el checksum.

## Cómo añadir o tocar un país

- Todo lo que depende del país va en `packages/core/src/countries/<cc>/`: el pack, una línea en `registry.ts` y la configuración del generador en `evals/generator/` (`locales.ts` / `locales-more.ts`).
- El core no ramifica nunca por código de país.
- Si cambias reglas o el contexto del prompt, sube la `version` del pack, porque invalida la caché y queda en las trazas.
- Datasets: `npm run gen:dataset -- --country=<cc> --append` solo renderiza los documentos nuevos. No hagas commit de binarios regenerados si el dataset no ha cambiado.
- Una evaluación de un solo país, más barata: `PROMPT_SOURCE=local npm run evals -- --ids=<id>,<id>`. Incluye el albarán (`deliveryNoteFor`) cuando evalúes una factura.

## Retomar en otro ordenador

```bash
git clone https://github.com/ricardmartin/cross-border-invoice-sentinel.git
cd cross-border-invoice-sentinel
git config user.name ricardmartin; git config user.email ricardmartin.dev@gmail.com
npm install
cp .env.example .env        # ANTHROPIC_API_KEY (+ LANGFUSE_* opcional)
npm test                    # gratis: 233 tests
npm run dev                 # web en http://localhost:3000
```

La caché del LLM (`evals/reports/cache/`) no está en git: en un ordenador nuevo, la primera ejecución completa de evals cuesta ≈ 0,5 $ con Haiku (255 documentos), y los números pueden moverse uno o dos documentos.
