/**
 * Maps supplier line descriptions to the restaurant's catalog SKUs. Invoices
 * and delivery notes describe the same product differently ("Tomate pera" vs
 * "TOMATE PERA KG"), so matching goes through the catalog first and falls back
 * to text similarity. Mock catalog: in production this is the tenant's item
 * master plus learned supplier aliases (or an embedding index).
 */

export interface CatalogItem {
  sku: string;
  name: string;
  aliases: string[];
}

export const MOCK_CATALOG: CatalogItem[] = [
  { sku: 'VEG-TOMATO', name: 'Tomate', aliases: ['tomate pera', 'tomate', 'pomodoro', 'tomato'] },
  { sku: 'VEG-LETTUCE', name: 'Lechuga', aliases: ['lechuga romana', 'lechuga'] },
  { sku: 'VEG-ONION', name: 'Cebolla', aliases: ['cebolla dulce', 'cebolla'] },
  { sku: 'VEG-POTATO', name: 'Patata', aliases: ['patata agria', 'patata'] },
  { sku: 'VEG-PEPPER', name: 'Pimiento rojo', aliases: ['pimiento rojo', 'pimiento'] },
  { sku: 'FRU-LEMON', name: 'Limón', aliases: ['limon'] },
  { sku: 'FRU-ORANGE', name: 'Naranja', aliases: ['naranja zumo', 'naranja'] },
  { sku: 'VEG-CARROT', name: 'Zanahoria', aliases: ['zanahoria'] },
  { sku: 'VEG-MUSHROOM', name: 'Champiñón', aliases: ['champinon laminado', 'champinon'] },
  { sku: 'DEL-OLIVE', name: 'Aceituna gordal', aliases: ['aceituna gordal', 'aceituna'] },
  { sku: 'EGG-L30', name: 'Huevos L 30 ud', aliases: ['huevos camperos', 'huevos'] },
  { sku: 'MEAT-BEEF-LOIN', name: 'Lomo bajo ternera', aliases: ['ternera lomo bajo', 'lomo bajo'] },
  { sku: 'MEAT-PORK-TENDERLOIN', name: 'Solomillo de cerdo', aliases: ['solomillo cerdo iberico', 'solomillo cerdo'] },
  { sku: 'MEAT-CHICKEN', name: 'Pollo campero', aliases: ['pollo campero entero', 'pollo campero', 'pollo'] },
  { sku: 'MEAT-LAMB-CHOP', name: 'Chuletilla cordero', aliases: ['chuletilla cordero lechal', 'chuletilla cordero'] },
  { sku: 'DELI-HAM-100', name: 'Jamón cebo ibérico 100 g', aliases: ['jamon cebo iberico loncheado', 'jamon cebo iberico'] },
  { sku: 'DELI-CHORIZO', name: 'Chorizo sarta', aliases: ['chorizo sarta picante', 'chorizo sarta', 'chorizo'] },
  { sku: 'MEAT-BURGER-180', name: 'Hamburguesa vacuno 180 g', aliases: ['hamburguesa vacuno', 'hamburguesa'] },
  { sku: 'PKG-VACUUM-BAG', name: 'Bolsa vacío 30x40', aliases: ['bolsa vacio'] },
  { sku: 'BEV-WINE-SOMONTANO', name: 'Vino Somontano crianza', aliases: ['vino tinto somontano crianza', 'somontano'] },
  { sku: 'BEV-BEER-33', name: 'Cerveza 33 cl caja 24', aliases: ['cerveza ambar especial', 'cerveza'] },
  { sku: 'BEV-COLA-20', name: 'Refresco cola 20 cl', aliases: ['refresco cola', 'cola'] },
  { sku: 'BEV-TONIC-20', name: 'Tónica premium 20 cl', aliases: ['tonica premium', 'tonica'] },
  { sku: 'BEV-WATER-15', name: 'Agua mineral 1,5 L', aliases: ['agua mineral'] },
  { sku: 'BEV-SPARKLING-50', name: 'Agua con gas 50 cl', aliases: ['agua con gas'] },
  { sku: 'BEV-OJ-1L', name: 'Zumo de naranja 1 L', aliases: ['zumo de naranja', 'zumo naranja'] },
  { sku: 'BEV-GIN-70', name: 'Ginebra London Dry', aliases: ['ginebra london dry', 'ginebra'] },
  { sku: 'BEV-VERMOUTH-1L', name: 'Vermut rojo 1 L', aliases: ['vermut rojo', 'vermut'] },
  { sku: 'CLN-DISHWASH-20', name: 'Detergente lavavajillas 20 L', aliases: ['detergente lavavajillas'] },
  { sku: 'CLN-RINSE-10', name: 'Abrillantador 10 L', aliases: ['abrillantador lavavajillas', 'abrillantador'] },
  { sku: 'CLN-DEGREASER-5', name: 'Desengrasante 5 L', aliases: ['desengrasante cocina', 'desengrasante'] },
  { sku: 'CLN-BLEACH-5', name: 'Lejía alimentaria 5 L', aliases: ['lejia apta uso alimentario', 'lejia'] },
  { sku: 'DSP-NAPKIN-40', name: 'Servilleta 40x40', aliases: ['servilleta papel', 'servilleta'] },
  { sku: 'DSP-FILM-300', name: 'Film transparente 300 m', aliases: ['film transparente'] },
  { sku: 'DSP-GLOVE-M', name: 'Guante nitrilo M', aliases: ['guante nitrilo'] },
  { sku: 'DRY-SALT-1K', name: 'Sal fina 1 kg', aliases: ['sal fina'] },
];

/**
 * Lower case, no accents, letters and digits only. Umlauts and their transliterations fold to the
 * same letters ("Hüfte", "HUEFTE", "HUFTE" → "hufte"; ß → ss; æ → ae → a; ø → o): one document
 * may print "Ü" and the other "UE", and a reader may drop either. Applied to both sides alike.
 */
export const normalizeDescription = (s: string) =>
  s
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/([aou])e/g, '$1')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const tokens = (s: string) => new Set(normalizeDescription(s).split(' ').filter((t) => t.length > 1));

/** At most one inserted, deleted or substituted character. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Long words only: in "pollo" / "bollo" one letter is a different product, in "schweinenacken" it is a misread. */
const FUZZY_MIN_LENGTH = 6;
const sameToken = (t: string, others: Set<string>) =>
  others.has(t) || (t.length >= FUZZY_MIN_LENGTH && [...others].some((o) => o.length >= FUZZY_MIN_LENGTH && withinOneEdit(t, o)));

/** Jaccard similarity on word tokens: robust to word order, case, units appended by one document and one misread letter. */
export function textSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (sameToken(t, tb)) inter++;
  return inter / (ta.size + tb.size - inter);
}

export interface SkuMatch {
  sku: string;
  name: string;
  confidence: number;
}

/** Best catalog item whose alias appears (as whole words) in the description; longer aliases win. */
export function matchSku(description: string, catalog: CatalogItem[] = MOCK_CATALOG): SkuMatch | null {
  const text = ` ${normalizeDescription(description)} `;
  let best: SkuMatch | null = null;
  let bestLen = 0;
  for (const item of catalog) {
    for (const alias of item.aliases) {
      const a = normalizeDescription(alias);
      if (text.includes(` ${a} `) && a.length > bestLen) {
        bestLen = a.length;
        best = { sku: item.sku, name: item.name, confidence: Math.min(0.99, 0.6 + a.length / 40) };
      }
    }
  }
  return best;
}

/** Similarity used to pair invoice and delivery-note lines: same SKU = 1, else token similarity. */
export function lineAffinity(a: string, b: string): { score: number; sku: string | null } {
  const sa = matchSku(a);
  const sb = matchSku(b);
  if (sa && sb) return sa.sku === sb.sku ? { score: 1, sku: sa.sku } : { score: 0, sku: null };
  return { score: textSimilarity(a, b), sku: sa?.sku ?? sb?.sku ?? null };
}
