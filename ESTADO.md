# Estado actual — 2026-10-22

Resumen del estado del proyecto. El detalle técnico y su historia están en [NOTES.md](NOTES.md); las reglas para agentes de código, en [CLAUDE.md](CLAUDE.md), y el estado por país, en [PAISES.md](PAISES.md).

## Qué funciona

- Workflow completo: triage → extracción con autocorrección, lectura a ciegas y cascada → validación por país → conciliación con albaranes → decisión → borrador de reclamación → aprobación humana.
- Países: ES, FR, IT, PT, IE, DK, DE y GB (los cinco últimos, añadidos el 2026-10-21).
- Web (Next.js): inbox, inspección de documentos, aprobación de reclamaciones, `/evals`.
- Observabilidad con Langfuse: trazas, scores, gestión de prompts, datasets.
- Evals por país con gate de regresión y CI (smoke).

## Números (ejecución `24ccf06-anthropic_claude-haiku-5-5-extract-v3`, 282 documentos, Haiku 5.5, `PROMPT_SOURCE=local`)

| Métrica | ES | FR | IT | PT | IE | DK | DE | GB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Documentos | 59 | 30 | 33 | 40 | 30 | 30 | 30 | 30 |
| Documentos 100 % correctos | 93,2 % | 90,0 % | 97,0 % | 92,5 % | 93,3 % | 96,7 % | 83,3 % | 96,7 % |
| Estado final, recall y conciliación | 100 % | 100 % | 100 % | 100 % | 100 % | 100 % | 100 % | 100 % |
| Reclamaciones injustas | 0 % | 0 % | 0 % | 0 % | 0 % | 0 % | 0 % | 0 % |
| Juez de reclamaciones (1–5) | 4,71 | 4,71 | 4,75 | 4,67 | 4,86 | 4,71 | 4,71 | 5,00 |
| Coste por documento | 0,0021 $ | 0,0019 $ | 0,0020 $ | 0,0020 $ | 0,0019 $ | 0,0019 $ | 0,0019 $ | 0,0018 $ |

**Gate: PASSED**, y `baseline.json` sale de esta misma ejecución. Informe: [evals/reports/latest.md](evals/reports/latest.md).

Las lecturas no exactas (20 de 282) son de campos de los que no depende ningún veredicto: descuentos, descripciones, número de documento, nombre o NIF del destinatario y el ATCUD de PT en fotos.

Tests: 245 en `packages/core` y 7 en `evals`. Typecheck limpio.

## Hecho el 2026-10-21: IVA por región

- **Regiones fiscales por pack**:
  - PT: Madeira (4/12/22 %) y Azores (4/9/16 %);
  - ES: Canarias con IGIC (0/3/7/9,5/15/20 %) y "IGIC incluido" en la reclamación.
- **Cómo se decide la región**: por el código postal de la dirección del cliente o, si no está impresa, de la del proveedor.
- Tests en `test/regions.test.ts`. Documentos nuevos: `pt-031`…`pt-040` y `es-046`…`es-051`.
- **Contrafactual sin LLM**: sin regiones, los 13 documentos regionales correctos acabarían en 13 reclamaciones injustas. Con regiones pasan todos, y se detectan los 3 errores sembrados.
- **Evals**: hechas el 2026-10-22 en la ejecución `24ccf06-anthropic_claude-haiku-5-5-extract-v3` (ver "Números").

## Hecho el 2026-10-21: cinco países más

Detalle en NOTES.md, sección "New countries".

| Métrica | PT | IE | DK | DE | GB |
| --- | --- | --- | --- | --- | --- |
| Documentos 100 % correctos | 100 % | 93,3 % | 96,7 % | 86,7 % | 96,7 % |
| Estado final, recall y conciliación | 100 % | 100 % | 100 % | 100 % | 100 % |
| Reclamaciones injustas | 0 % | 0 % | 0 % | 0 % | 0 % |
| Juez de reclamaciones (1–5) | 4,43 | 5,00 | 4,14 | 4,43 | 5,00 |

- Gate superado con los 8 países (255 documentos). Los números de ES, FR e IT no se han movido y `baseline.json` ya incluye los 8.
- Qué aporta cada país nuevo:
  - **PT**: solo tipos del continente; los de Azores y Madeira se rechazan (siguiente paso: regímenes por región).
  - **IE y GB**: 0 % como tipo legal y punto decimal.
  - **GB y DK**: primeras monedas distintas del euro (GBP y DKK).
  - **DK**: un único tipo, el 25 %.
  - **DE**: USt-IdNr. con dígito de control o Steuernummer.
- Hallazgos del juez, pendientes de arreglar:
  - en alemán la reclamación dice "unserer Rechnung" (nuestra factura) para la factura del proveedor;
  - en un correo danés se colaron mensajes del validador en inglés.

## Hecho el 2026-10-20

- **es-041** (referencia de albarán mal leída, `A18-2603387` por `ALB-2603387`): la factura quedaba en `FALTAN_DOCUMENTOS` y no se reclamaba la entrega incompleta.
  - Ahora, si la referencia no aparece, se busca el **único** albarán del mismo restaurante y proveedor con un número a `min(2, longitud/4)` ediciones (`findNear` en `delivery/repository.ts`).
  - La coincidencia queda en `reconciliation.nearMatches`, en la traza y en la razón.
  - Tests en `test/delivery.test.ts`.
  - Limitación: la lectura en caché de es-041 ya tiene bien la referencia, así que la ejecución completa no usa el fallback. El caso lo cubren los tests unitarios.
- **`CLAUDE.md`**: reglas innegociables, dónde va cada cambio, versionado y comandos que cuestan dinero.
- Comando correcto para un solo archivo de tests: `npm test -w @sentinel/core -- <nombre>`. (`npx vitest ... -w` significa `--watch` y se queda colgado.)

## Siguientes pasos

- Extraer las anotaciones a mano del albarán como prueba (hoy se ignoran a propósito).
- Detectar facturas duplicadas.
- Avisar de subidas de precio frente a compras anteriores.
- Ceuta y Melilla con IPSI (misma mecánica que Canarias) y validar el NIF del cliente contra el restaurante.
- Arreglar "unserer Rechnung" en las reclamaciones en alemán, con el juez como prueba (bump de `CLAIM_PROMPT_VERSION`).
- Secreto `ANTHROPIC_API_KEY` en GitHub para que el CI ejecute las evals smoke.

## Retomar en otro ordenador

```bash
git clone https://github.com/ricardmartin/cross-border-invoice-sentinel.git
cd cross-border-invoice-sentinel
git config user.name ricardmartin; git config user.email ricardmartin.dev@gmail.com
npm install
cp .env.example .env                            # ANTHROPIC_API_KEY (+ LANGFUSE_* opcional)
npm test                                        # gratis
npm run dev                                     # web en http://localhost:3000
```

- La caché del LLM (`evals/reports/cache/`) **no está en git**: la primera `npm run evals` en otro ordenador paga de nuevo (~0,2 $ con Haiku) y, al ser muestras nuevas, los números pueden moverse un documento o dos.
- Primera subida desde un ordenador nuevo: GitHub pedirá iniciar sesión (Git Credential Manager).
