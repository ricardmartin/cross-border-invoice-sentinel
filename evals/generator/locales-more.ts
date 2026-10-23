import {
  cifControl,
  esPack,
  cvrValid,
  dePack,
  dkPack,
  gbPack,
  iePack,
  irishCheckLetter,
  nifControl,
  ptPack,
  ustIdControl,
  validateBritishTaxId,
  validateDanishTaxId,
  validateGermanTaxId,
  validateIrishTaxId,
  validatePortugueseTaxId,
  type TaxIdCheck,
} from '@sentinel/core';
import { createHash } from 'node:crypto';
import { fromCents, pctCents, sumCents, toCents, type ExtractedDocument, type PrintedCharge } from '@sentinel/core';
import type { CatalogItem, Supplier } from './es/suppliers';
import type { CountryGenConfig } from './locales';

/**
 * Dataset configs for PT, IE, DK, DE and GB. Same generic builder and templates
 * as FR/IT: a country only brings suppliers, labels, ids and its stale-ERP rates.
 * Every rate in a catalog has a stale counterpart so any line can carry the planted error.
 */

const item = (description: string, unit: string, price: number, rate: number, qty: [number, number], qtyDecimals = 0): CatalogItem => ({
  description,
  unit,
  price,
  rate,
  qty,
  qtyDecimals,
});

/** Shifts the last character and checks the result really fails the pack's validator. */
const corruptLast = (validate: (id: string) => TaxIdCheck) => (id: string) => {
  const last = id.at(-1)!;
  const replacement = /\d/.test(last) ? String((Number(last) + 3) % 10) : last === 'A' ? 'B' : 'A';
  const bad = id.slice(0, -1) + replacement;
  if (validate(bad).valid) throw new Error(`corrupted id ${bad} still valid`);
  return bad;
};

// --- id helpers ----------------------------------------------------------------

const nif = (eight: string) => `PT${eight}${nifControl(eight)}`;
/** Post-2013 format when a second letter is given ("1234567FA"). */
const ieVat = (seven: string, second = '') => `IE${seven}${irishCheckLetter(seven, second)}${second}`;
const cvr = (seven: string) => {
  for (let d = 0; d < 10; d++) if (cvrValid(seven + d)) return `DK${seven}${d}`;
  throw new Error(`no CVR control digit for ${seven}`);
};
const ustId = (eight: string) => `DE${eight}${ustIdControl(eight)}`;
const gbVat = (seven: string) => {
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(seven[i]) * (8 - i);
  return `GB${seven}${String((97 - (sum % 97)) % 97).padStart(2, '0')}`;
};

// --- Portugal (mainland) -------------------------------------------------------------

/**
 * ATCUD = <validation code of the series>-<sequence number>. The AT assigns one code per document series;
 * here it is derived from the series (document number without its trailing digits) and the document type.
 */
function atcud(doc: ExtractedDocument): string {
  const series = doc.documentNumber.replace(/\d+\s*$/, '');
  const code = createHash('md5').update(`${doc.docType}|${series}`).digest('hex').slice(0, 8).toUpperCase();
  return `${code}-${Number(/(\d+)\s*$/.exec(doc.documentNumber)![1])}`;
}

export const PT_CONFIG: CountryGenConfig = {
  code: 'PT',
  pack: ptPack,
  seedOffset: 4000,
  baseCount: 22,
  suppliers: [
    {
      id: 'pt-hortofruticola',
      name: 'Hortofrutícola do Oeste, Lda.',
      taxId: nif('50731842'),
      secondaryIds: ['Capital social 50.000 €'],
      address: 'MARL, Pavilhão B3 · 2660-421 São Julião do Tojal',
      phone: '219 470 112',
      template: 'classic',
      accent: '#15803d',
      numbering: (n) => `FT 2026A/${1500 + n * 3}`,
      lines: [4, 8],
      discounts: false,
      catalog: [
        item('Tomate chucha', 'kg', 1.95, 6, [3, 15], 1),
        item('Alface frisada', 'un', 0.75, 6, [6, 24]),
        item('Batata branca', 'kg', 0.68, 6, [10, 40], 1),
        item('Cebola', 'kg', 0.82, 6, [5, 20], 1),
        item('Laranja do Algarve', 'kg', 1.25, 6, [5, 20], 1),
        item('Coentros (molho)', 'molho', 0.6, 6, [5, 20]),
      ],
    },
    {
      id: 'pt-talho',
      name: 'Carnes e Charcutaria Minhota, S.A.',
      taxId: nif('50918273'),
      address: 'Zona Industrial de Lousado, Lote 12 · 4760-469 Vila Nova de Famalicão',
      phone: '252 490 330',
      template: 'erp',
      accent: '#000000',
      numbering: (n) => `FT CM26/${String(8100 + n * 7).padStart(6, '0')}`,
      lines: [3, 7],
      discounts: true,
      catalog: [
        item('LOMBO DE PORCO', 'KG', 6.4, 6, [3, 10], 3),
        item('VITELA PARA BIFES', 'KG', 14.9, 6, [2, 8], 3),
        item('FRANGO DO CAMPO', 'KG', 4.2, 6, [3, 12], 3),
        item('CHOURICO DE CARNE', 'KG', 9.8, 6, [1, 4], 3),
        item('PRESUNTO FATIADO', 'KG', 18.5, 6, [1, 3], 3),
        item('PELICULA ADERENTE 300M', 'UN', 9.9, 23, [1, 3]),
      ],
    },
    {
      id: 'pt-bebidas',
      name: 'Distribuidora de Bebidas Tejo, Lda.',
      taxId: nif('51428391'),
      address: 'Rua da Indústria 45 · 2690-353 Santa Iria de Azóia',
      phone: '219 538 774',
      template: 'modern',
      accent: '#9f1239',
      numbering: (n) => `FT DBT/${26000 + n * 5}`,
      lines: [3, 7],
      discounts: false,
      catalog: [
        item('Vinho tinto Alentejo 75cl', 'gf', 4.6, 13, [6, 36]),
        item('Vinho verde 75cl', 'gf', 3.9, 13, [6, 36]),
        item('Cerveja 33cl (x24)', 'grade', 17.8, 23, [1, 6]),
        item('Água mineral 1,5L (x6)', 'pack', 2.4, 6, [5, 20]),
        item('Refrigerante cola 33cl (x24)', 'grade', 14.6, 23, [1, 4]),
        item('Aguardente velha 70cl', 'gf', 16.9, 23, [1, 3]),
      ],
    },
    {
      id: 'pt-limpeza',
      name: 'Higiene Total Lisboa, Unipessoal Lda.',
      taxId: nif('51630947'),
      address: 'Av. Infante D. Henrique 312 · 1950-421 Lisboa',
      phone: '218 312 905',
      template: 'classic',
      accent: '#0369a1',
      numbering: (n) => `FT HT/${String(3300 + n * 4)}`,
      lines: [3, 6],
      discounts: false,
      catalog: [
        item('Detergente máquina loiça 20L', 'bidão', 32.5, 23, [1, 3]),
        item('Desengordurante cozinha 5L', 'bidão', 11.9, 23, [1, 4]),
        item('Lixívia 5L', 'bidão', 2.95, 23, [2, 8]),
        item('Guardanapos papel 40x40 (x1000)', 'cx', 14.2, 23, [1, 5]),
        item('Luvas nitrilo M (x100)', 'cx', 5.9, 23, [1, 6]),
        item('Sal marinho 1kg', 'pct', 0.45, 6, [5, 20]),
      ],
    },
  ],
  recipients: [
    { name: 'Taberna do Largo, Lda.', taxId: nif('51522874'), address: 'Largo do Intendente 7 · 1100-285 Lisboa' },
    { name: 'Restaurante Ribeira Douro, Lda.', taxId: nif('50864217'), address: 'Cais da Ribeira 22 · 4050-509 Porto' },
  ],
  labels: {
    invoice: 'FATURA',
    creditNote: 'NOTA DE CRÉDITO',
    deliveryNote: 'GUIA DE REMESSA',
    number: 'N.º',
    date: 'Data:',
    client: 'Cliente',
    deliverTo: 'Local de descarga',
    taxIdLabel: 'NIF',
    clientTaxIdLabel: 'NIF',
    cols: { code: 'Ref.', desc: 'Descrição', qty: 'Qtd.', unit: 'Un.', price: 'Preço unit.', disc: 'Desc.', rate: 'IVA', amount: 'Valor', check: 'Conferido' },
    summary: { base: 'Incidência', rate: 'Taxa', tax: 'Valor IVA', total: 'Total' },
    deliveryRef: (n, d) => `V/ Guia n.º ${n} de ${d}`,
    payment: 'Pagamento a 30 dias por transferência — IBAN PT50 0035 0123 0001 2345 6780 9',
    legal: 'Processado por programa certificado n.º 1234/AT',
    controlCodeLabel: 'ATCUD',
    noteFooter: ['Recebi a mercadoria em boas condições (assinatura)', 'Motorista'],
    unvalued: 'Guia não valorizada: os preços constam da fatura.',
    months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
    longDate: (d, m, y) => `${d} de ${m} de ${y}`,
  },
  staleRate: { 23: 21, 13: 12, 6: 5 },
  controlCode: atcud,
  corruptTaxId: corruptLast(validatePortugueseTaxId),
  deliveryNoteNumber: (n) => `GR 2026/${4000 + n * 13}`,
  stamps: ['PAGO', 'RECEBIDO', 'CONTABILIZADO'],
  notes: ['Conferido - Rui', 'Falta 1 caixa', 'Pagar dia 15', 'OK cozinha', 'Ligar à Inês'],
  regions: [
    {
      id: 'MADEIRA',
      rateMap: { 6: 4, 13: 12, 23: 22 },
      count: 5,
      suppliers: [
        {
          id: 'pt-madeira-dist',
          name: 'Distribuidora Atlântica da Madeira, Lda.',
          taxId: nif('51274930'),
          address: 'Zona Franca Industrial, Lote 8 · 9200-047 Caniçal',
          phone: '291 960 210',
          template: 'classic',
          accent: '#0f766e',
          numbering: (n) => `FT DAM/${4100 + n * 3}`,
          lines: [3, 7],
          discounts: false,
          catalog: [
            item('Banana da Madeira', 'kg', 1.45, 6, [5, 20], 1),
            item('Peixe-espada preto', 'kg', 9.8, 6, [2, 8], 1),
            item('Vinho Madeira 75cl', 'gf', 8.9, 13, [3, 12]),
            item('Cerveja 33cl (x24)', 'grade', 16.9, 23, [1, 6]),
            item('Detergente máquina loiça 20L', 'bidão', 31.5, 23, [1, 3]),
            item('Pão de caco', 'un', 0.85, 6, [10, 40]),
          ],
        },
      ],
      recipients: [{ name: 'Restaurante Mercado Velho, Lda.', taxId: nif('51633015'), address: 'Rua do Mercado 12 · 9000-050 Funchal' }],
    },
    {
      id: 'AZORES',
      rateMap: { 6: 4, 13: 9, 23: 16 },
      count: 5,
      suppliers: [
        {
          id: 'pt-acores-dist',
          name: 'Abastecedora Açoriana, S.A.',
          taxId: nif('51208472'),
          address: 'Rua do Paim 40 · 9500-095 Ponta Delgada',
          phone: '296 302 455',
          template: 'modern',
          accent: '#1d4ed8',
          numbering: (n) => `FT AA26/${7200 + n * 5}`,
          lines: [3, 7],
          discounts: false,
          catalog: [
            item('Ananás dos Açores', 'kg', 4.2, 6, [3, 12], 1),
            item('Queijo de São Jorge', 'kg', 12.9, 6, [1, 5], 1),
            item('Carne dos Açores (vazia)', 'kg', 16.5, 6, [2, 8], 1),
            item('Vinho verdelho 75cl', 'gf', 9.5, 13, [3, 12]),
            item('Cerveja Especial 33cl (x24)', 'grade', 15.8, 23, [1, 6]),
            item('Guardanapos papel (x1000)', 'cx', 13.9, 23, [1, 4]),
          ],
        },
      ],
      recipients: [{ name: 'Tasca do Porto, Lda.', taxId: nif('51755408'), address: 'Largo da Matriz 5 · 9500-094 Ponta Delgada' }],
    },
  ],
};

// --- Spain, Canarias (IGIC) ----------------------------------------------------------
// ES keeps its frozen generator for es-001…es-045; these documents are appended after them
// and use the generic templates with Spanish labels.

const cif = (org: string, digits7: string) => {
  const c = cifControl(digits7);
  return org + digits7 + ('PQRSNW'.includes(org) ? c.letter : c.digit);
};

export const ES_REGIONAL_CONFIG: CountryGenConfig = {
  code: 'ES',
  pack: esPack,
  seedOffset: 9000,
  baseCount: 0,
  suppliers: [],
  recipients: [],
  labels: {
    invoice: 'FACTURA',
    creditNote: 'FACTURA RECTIFICATIVA',
    deliveryNote: 'ALBARÁN',
    number: 'Nº',
    date: 'Fecha:',
    client: 'Cliente',
    deliverTo: 'Entregar en',
    taxIdLabel: 'CIF',
    clientTaxIdLabel: 'CIF',
    cols: { code: 'Código', desc: 'Descripción', qty: 'Cant.', unit: 'Ud.', price: 'Precio', disc: 'Dto.', rate: '% IGIC', amount: 'Importe', check: 'Revisado' },
    summary: { base: 'Base imponible', rate: '% IGIC', tax: 'Cuota IGIC', total: 'Total factura' },
    deliveryRef: (n, d) => `Albarán nº ${n} de ${d}`,
    payment: 'Forma de pago: transferencia a 30 días — IBAN ES91 2100 0418 4502 0005 1332',
    legal: 'Operación sujeta al Impuesto General Indirecto Canario (IGIC).',
    noteFooter: ['Recibí conforme (firma y sello)', 'Transportista'],
    unvalued: 'Albarán sin valorar: los precios figuran en la factura.',
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    longDate: (d, m, y) => `${d} de ${m} de ${y}`,
  },
  staleRate: {},
  corruptTaxId: (id) => id,
  deliveryNoteNumber: (n) => `ALB-${n}`,
  stamps: ['PAGADO', 'RECIBIDO', 'CONTABILIZADO'],
  notes: ['Revisado - Juan', 'Falta 1 caja', 'Pagar día 15', 'OK cocina', 'Llamar a Marta'],
  regions: [
    {
      id: 'CANARIAS',
      // Peninsular IVA → IGIC: basic food 0 %, the rest at the 7 % general rate.
      rateMap: { 4: 0, 10: 7, 21: 7 },
      count: 6,
      suppliers: [
        {
          id: 'es-canarias-frutas',
          name: 'Frutas y Verduras del Atlántico, S.L.',
          taxId: cif('B', '3582146'),
          address: 'Mercalaspalmas, Nave 14 · 35229 Las Palmas de Gran Canaria',
          phone: '928 41 22 90',
          template: 'classic',
          accent: '#15803d',
          numbering: (n) => `FV-26/${String(1800 + n * 3).padStart(5, '0')}`,
          lines: [4, 7],
          discounts: false,
          catalog: [
            item('Plátano de Canarias', 'kg', 1.35, 4, [5, 20], 1),
            item('Papas negras', 'kg', 2.9, 4, [3, 12], 1),
            item('Tomate canario', 'kg', 1.85, 4, [3, 12], 1),
            item('Queso majorero', 'kg', 13.5, 10, [1, 5], 1),
            item('Mojo picón 1L', 'bote', 4.8, 10, [2, 8]),
            item('Agua mineral 1,5L (x6)', 'pack', 2.6, 10, [5, 20]),
          ],
        },
        {
          id: 'es-canarias-bebidas',
          name: 'Distribuciones Teide Bebidas, S.A.',
          taxId: cif('A', '3874120'),
          address: 'Polígono El Mayorazgo, Parcela 9 · 38108 Santa Cruz de Tenerife',
          phone: '922 21 45 60',
          template: 'erp',
          accent: '#000000',
          numbering: (n) => `TB${String(260000 + n * 7)}`,
          lines: [3, 6],
          discounts: true,
          catalog: [
            item('CERVEZA DORADA 33CL (X24)', 'CJ', 15.9, 21, [1, 6]),
            item('VINO MALVASIA LANZAROTE 75CL', 'BOT', 9.4, 21, [3, 12]),
            item('REFRESCO NARANJA 33CL (X24)', 'CJ', 12.6, 21, [1, 4]),
            item('CAFE MOLIDO 1KG', 'PAQ', 11.8, 10, [1, 5]),
            item('LECHE ENTERA 1L (X6)', 'PACK', 5.4, 4, [2, 8]),
            item('DETERGENTE LAVAVAJILLAS 20L', 'GARRAFA', 33.5, 21, [1, 3]),
          ],
        },
      ],
      recipients: [
        { name: 'Restaurante La Puntilla, S.L.', taxId: cif('B', '3561948'), address: 'C/ Prudencio Morales 20 · 35009 Las Palmas de Gran Canaria' },
        { name: 'Guachinche El Lagar, S.L.', taxId: cif('B', '3842075'), address: 'Camino La Cruz 4 · 38300 La Orotava' },
      ],
    },
    {
      id: 'CEUTA',
      // Synthetic IPSI rates inside the ordinance range; 21 % (IVA) is the planted mainland rate.
      rateMap: { 4: 0.5, 10: 2, 21: 8 },
      count: 2,
      suppliers: [ipsiSupplier('es-ceuta-dist', 'Distribuciones del Estrecho, S.L.', cif('B', '5102846'), 'Polígono del Tarajal, Nave 6 · 51003 Ceuta', 'classic', (n) => `DE-${String(600 + n * 3)}`)],
      recipients: [{ name: 'Restaurante El Desnarigado, S.L.', taxId: cif('B', '5104172'), address: 'Paseo de las Palmeras 14 · 51001 Ceuta' }],
      labels: ipsiLabels('Ceuta'),
    },
    {
      id: 'MELILLA',
      rateMap: { 4: 0.5, 10: 2, 21: 8 },
      count: 2,
      suppliers: [ipsiSupplier('es-melilla-dist', 'Suministros Hosteleros Melilla, S.L.', cif('B', '5201937'), 'Polígono SEPES, Calle B 12 · 52006 Melilla', 'erp', (n) => `SHM${String(26000 + n * 7)}`)],
      recipients: [{ name: 'Casa de Comidas La Alcazaba, S.L.', taxId: cif('B', '5203618'), address: 'Avenida Juan Carlos I 31 · 52001 Melilla' }],
      labels: ipsiLabels('Melilla'),
    },
  ],
};

function ipsiSupplier(id: string, name: string, taxId: string, address: string, template: 'classic' | 'erp', numbering: (n: number) => string): Supplier {
  return {
    id,
    name,
    taxId,
    address,
    phone: '956 51 20 00',
    template,
    accent: '#1d4ed8',
    numbering,
    lines: [3, 6],
    discounts: false,
    catalog: [
      item('Pan de molde', 'ud', 1.9, 4, [5, 20]),
      item('Leche entera 1L (x6)', 'pack', 5.4, 4, [2, 8]),
      item('Pechuga de pollo', 'kg', 6.8, 10, [2, 8], 1),
      item('Agua mineral 1,5L (x6)', 'pack', 2.6, 10, [5, 20]),
      item('Cerveza 33cl (x24)', 'caja', 15.9, 21, [1, 6]),
      item('Detergente lavavajillas 20L', 'garrafa', 33.5, 21, [1, 3]),
    ],
  };
}

function ipsiLabels(city: string) {
  return {
    cols: { code: 'Código', desc: 'Descripción', qty: 'Cant.', unit: 'Ud.', price: 'Precio', disc: 'Dto.', rate: '% IPSI', amount: 'Importe', check: 'Revisado' },
    summary: { base: 'Base imponible', rate: '% IPSI', tax: 'Cuota IPSI', total: 'Total factura' },
    legal: `Operación sujeta al Impuesto sobre la Producción, los Servicios y la Importación (IPSI) de ${city}.`,
  };
}

// --- Spain, recargo de equivalencia and retención IRPF ---------------------------------

const dni = (eight: string) => eight + 'TRWAGMYFPDXBNJZSQVHLCKE'[Number(eight) % 23];
const esPct = (n: number) => `${String(n).replace('.', ',')} %`;
const ES_MAINLAND_LABELS = {
  cols: { code: 'Código', desc: 'Descripción', qty: 'Cant.', unit: 'Ud.', price: 'Precio', disc: 'Dto.', rate: '% IVA', amount: 'Importe', check: 'Revisado' },
  summary: { base: 'Base imponible', rate: '% IVA', tax: 'Cuota IVA', total: 'Total factura', amountDue: 'Total a pagar' },
};

/** One recargo row per IVA bracket, at the rate the pack ties to it. */
const recargo = (doc: ExtractedDocument): PrintedCharge[] =>
  doc.printedTaxBreakdown.map((b) => {
    const rate = esPack.charges!.surcharge!.rateByTaxRate[b.rate]!;
    return { kind: 'SURCHARGE', label: `Recargo equivalencia ${esPct(rate)}`, rate, base: b.base, amount: fromCents(pctCents(toCents(b.base), rate)) };
  });

/** Withholding on the whole taxable base. */
const irpf = (rate: number) => (doc: ExtractedDocument): PrintedCharge[] => {
  const base = sumCents(doc.printedTaxBreakdown.map((b) => toCents(b.base)));
  return [{ kind: 'WITHHOLDING', label: `Retención IRPF ${esPct(rate)}`, rate, base: fromCents(base), amount: fromCents(pctCents(base, rate)) }];
};

const huerta: Supplier = {
  id: 'es-huerta-navarro',
  name: 'José Navarro Ruiz · Huerta Navarro',
  taxId: dni('48271635'),
  address: 'Partida de la Foia 12 · 46470 Catarroja (Valencia)',
  phone: '961 26 30 41',
  template: 'classic',
  accent: '#65a30d',
  numbering: (n) => `HN-2026/${String(140 + n * 2).padStart(4, '0')}`,
  lines: [3, 6],
  discounts: false,
  catalog: [
    item('Tomate valenciano', 'kg', 2.1, 4, [5, 20], 1),
    item('Alcachofa', 'kg', 2.8, 4, [3, 10], 1),
    item('Lechuga romana', 'ud', 0.85, 4, [10, 30]),
    item('Cebolla tierna (manojo)', 'ud', 1.2, 4, [5, 15]),
    item('Naranja de zumo', 'kg', 0.95, 4, [10, 40], 1),
    item('Calabacín', 'kg', 1.6, 4, [3, 12], 1),
  ],
};

const mayorista: Supplier = {
  id: 'es-mayorista-sur',
  name: 'Comercial Mayorista del Sur, S.L.',
  taxId: cif('B', '4127390'),
  address: 'Polígono Store, Calle A 23 · 41008 Sevilla',
  phone: '954 43 18 70',
  template: 'erp',
  accent: '#000000',
  numbering: (n) => `CMS${String(81000 + n * 7)}`,
  lines: [4, 7],
  discounts: false,
  catalog: [
    item('ACEITE OLIVA VIRGEN EXTRA 5L', 'GARRAFA', 28.9, 4, [1, 4]),
    item('ARROZ BOMBA 5KG', 'SACO', 14.6, 10, [1, 4]),
    item('ATUN CLARO ACEITE 1KG', 'LATA', 9.8, 10, [2, 6]),
    item('CERVEZA 33CL (X24)', 'CJ', 15.9, 21, [1, 6]),
    item('VINO TINTO RIOJA 75CL', 'BOT', 5.6, 21, [6, 24]),
    item('LEJIA 5L', 'GARRAFA', 2.4, 21, [2, 8]),
  ],
};

const ES_RECIPIENT = { name: 'Restaurante La Barra, S.L.', taxId: cif('B', '8712345'), address: 'Calle de Ponzano 41 · 28003 Madrid' };
const IRPF_LEGAL = { ...ES_MAINLAND_LABELS, legal: 'Actividad agrícola en estimación objetiva: retención del 2 %.' };
const RECARGO_LEGAL = { ...ES_MAINLAND_LABELS, legal: 'Recargo de equivalencia aplicado según los datos fiscales del cliente.' };

ES_REGIONAL_CONFIG.charges = [
  { supplier: huerta, recipient: ES_RECIPIENT, charges: irpf(2), labels: IRPF_LEGAL },
  { supplier: huerta, recipient: ES_RECIPIENT, charges: irpf(2), plant: 'TOTAL_OFFSET', labels: IRPF_LEGAL },
  { supplier: mayorista, recipient: ES_RECIPIENT, charges: recargo, labels: RECARGO_LEGAL },
  { supplier: mayorista, recipient: ES_RECIPIENT, charges: recargo, plant: 'CHARGE_AMOUNT', labels: RECARGO_LEGAL },
];


// --- Ireland ---------------------------------------------------------------------------

export const IE_CONFIG: CountryGenConfig = {
  code: 'IE',
  pack: iePack,
  seedOffset: 5000,
  baseCount: 22,
  suppliers: [
    {
      id: 'ie-greengrocer',
      name: 'Liffey Fresh Produce Ltd',
      taxId: ieVat('6431852'),
      secondaryIds: ['Company No. 412873'],
      address: 'Unit 4, Dublin Food Market, Malahide Road · Dublin 17, D17 X2K4',
      phone: '01 847 3321',
      template: 'classic',
      accent: '#166534',
      numbering: (n) => `INV-${String(30400 + n * 3)}`,
      lines: [4, 8],
      discounts: false,
      catalog: [
        item('Potatoes, Rooster', 'kg', 0.95, 0, [10, 40], 1),
        item('Carrots', 'kg', 0.85, 0, [5, 20], 1),
        item('Onions, brown', 'kg', 0.9, 0, [5, 20], 1),
        item('Tomatoes, vine', 'kg', 3.2, 0, [3, 12], 1),
        item('Lettuce, butterhead', 'each', 0.95, 0, [6, 24]),
        item('Apples, Bramley', 'kg', 2.4, 0, [3, 10], 1),
      ],
    },
    {
      id: 'ie-butcher',
      name: 'Midland Meats & Provisions Ltd',
      taxId: ieVat('3384120', 'H'),
      address: 'Clonminch Industrial Estate · Tullamore, Co. Offaly, R35 F2W8',
      phone: '057 932 1180',
      template: 'erp',
      accent: '#000000',
      numbering: (n) => `MMP/${String(71000 + n * 9).padStart(6, '0')}`,
      lines: [3, 7],
      discounts: true,
      catalog: [
        item('BEEF STRIPLOIN IRISH', 'KG', 24.9, 0, [2, 8], 3),
        item('LAMB RUMP', 'KG', 17.5, 0, [2, 6], 3),
        item('CHICKEN FILLETS', 'KG', 8.6, 0, [3, 10], 3),
        item('BACK RASHERS', 'KG', 9.4, 0, [1, 5], 3),
        item('PORK SAUSAGES', 'KG', 7.2, 0, [2, 6], 3),
        item('CLING FILM 300M', 'ROLL', 10.5, 23, [1, 3]),
      ],
    },
    {
      id: 'ie-drinks',
      name: 'Shannon Beverage Distributors Ltd',
      taxId: ieVat('9512376', 'W'),
      address: 'Smithstown Industrial Estate · Shannon, Co. Clare, V14 K2C9',
      phone: '061 702 455',
      template: 'modern',
      accent: '#1e3a8a',
      numbering: (n) => `SBD${26000 + n * 7}`,
      lines: [3, 7],
      discounts: false,
      catalog: [
        item('Stout keg 50L', 'keg', 189, 23, [1, 3]),
        item('Lager 33cl (x24)', 'case', 32.5, 23, [1, 6]),
        item('Red wine, Rioja 75cl', 'btl', 8.4, 23, [6, 24]),
        item('Irish whiskey 70cl', 'btl', 27.9, 23, [1, 4]),
        item('Still water 500ml (x24)', 'case', 7.8, 23, [2, 8]),
        item('Fruit scones (x12)', 'tray', 6.9, 13.5, [1, 6]),
      ],
    },
    {
      id: 'ie-hygiene',
      name: 'Atlantic Catering Supplies Ltd',
      taxId: ieVat('8204715'),
      address: 'Ballybrit Business Park · Galway, H91 R2T6',
      phone: '091 755 019',
      template: 'classic',
      accent: '#0e7490',
      numbering: (n) => `ACS-${String(5200 + n * 4)}`,
      lines: [3, 6],
      discounts: false,
      catalog: [
        item('Dishwasher detergent 20L', 'drum', 41.5, 23, [1, 3]),
        item('Kitchen degreaser 5L', 'drum', 13.9, 23, [1, 4]),
        item('Thick bleach 5L', 'drum', 4.6, 23, [2, 8]),
        item('Napkins 40x40 (x1000)', 'case', 16.5, 23, [1, 5]),
        item('Nitrile gloves M (x100)', 'box', 6.9, 23, [1, 6]),
        item('Plain flour 16kg', 'sack', 14.8, 0, [1, 3]),
      ],
    },
  ],
  recipients: [
    { name: 'The Quay Kitchen Ltd', taxId: ieVat('6729034'), address: '14 Wellington Quay · Dublin 2, D02 X524' },
    { name: 'Corrib Bistro Ltd', taxId: ieVat('4120876', 'H'), address: '3 Quay Street · Galway, H91 C9P2' },
  ],
  labels: {
    invoice: 'INVOICE',
    creditNote: 'CREDIT NOTE',
    deliveryNote: 'DELIVERY DOCKET',
    number: 'No.',
    date: 'Date:',
    client: 'Bill to',
    deliverTo: 'Deliver to',
    taxIdLabel: 'VAT No.',
    clientTaxIdLabel: 'VAT No.',
    cols: { code: 'Code', desc: 'Description', qty: 'Qty', unit: 'Unit', price: 'Unit Price', disc: 'Disc.', rate: 'VAT', amount: 'Net', check: 'Checked' },
    summary: { base: 'Net', rate: 'VAT Rate', tax: 'VAT', total: 'Invoice Total' },
    deliveryRef: (n, d) => `Docket No. ${n} of ${d}`,
    payment: 'Payment terms: 30 days from invoice date by EFT — IBAN IE29 AIBK 9311 5212 3456 78',
    legal: 'Goods remain the property of the supplier until paid in full. Registered in Ireland.',
    noteFooter: ['Received in good condition (signature)', 'Driver'],
    unvalued: 'Prices are shown on the invoice.',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  staleRate: { 23: 21, 13.5: 12.5, 0: 21 },
  corruptTaxId: corruptLast(validateIrishTaxId),
  deliveryNoteNumber: (n) => `DD-${String(46000 + n * 13)}`,
  stamps: ['PAID', 'RECEIVED', 'POSTED'],
  notes: ['Checked - Sean', '1 case short', 'Pay on 15th', 'OK kitchen', 'Call Aoife'],
};

// --- Denmark ---------------------------------------------------------------------------

export const DK_CONFIG: CountryGenConfig = {
  code: 'DK',
  pack: dkPack,
  seedOffset: 6000,
  baseCount: 22,
  suppliers: [
    {
      id: 'dk-gront',
      name: 'Grønttorvet Engros ApS',
      taxId: cvr('3851274'),
      address: 'Grønttorvet 8 · 2500 Valby',
      phone: '36 44 21 90',
      template: 'classic',
      accent: '#15803d',
      numbering: (n) => `${String(52000 + n * 3)}`,
      lines: [4, 8],
      discounts: false,
      catalog: [
        item('Kartofler, nye', 'kg', 9.5, 25, [10, 40], 1),
        item('Gulerødder', 'kg', 7.25, 25, [5, 20], 1),
        item('Løg, gule', 'kg', 6.8, 25, [5, 20], 1),
        item('Tomater, stilk', 'kg', 24.5, 25, [3, 12], 1),
        item('Salat, iceberg', 'stk', 9.95, 25, [6, 24]),
        item('Æbler, Ingrid Marie', 'kg', 18.9, 25, [3, 10], 1),
      ],
    },
    {
      id: 'dk-slagter',
      name: 'Jysk Kød & Pålæg A/S',
      taxId: cvr('2716493'),
      address: 'Industrivej 41 · 8600 Silkeborg',
      phone: '86 82 13 40',
      template: 'erp',
      accent: '#000000',
      numbering: (n) => `JKP-${String(91000 + n * 9).padStart(6, '0')}`,
      lines: [3, 7],
      discounts: true,
      catalog: [
        item('OKSEMØRBRAD', 'KG', 289, 25, [1, 5], 3),
        item('SVINEKAM M/SVÆR', 'KG', 64.5, 25, [3, 10], 3),
        item('KYLLINGEBRYST', 'KG', 79.9, 25, [3, 10], 3),
        item('RUGBRØD, SKIVESKÅRET', 'STK', 18.5, 25, [5, 20]),
        item('LEVERPOSTEJ', 'KG', 54, 25, [1, 4], 3),
        item('HUSHOLDNINGSFILM 300M', 'RL', 79, 25, [1, 3]),
      ],
    },
    {
      id: 'dk-drikke',
      name: 'Øresund Drikkevarer A/S',
      taxId: cvr('3394017'),
      address: 'Amager Strandvej 120 · 2300 København S',
      phone: '32 54 77 10',
      template: 'modern',
      accent: '#1e40af',
      numbering: (n) => `ØD${26000 + n * 7}`,
      lines: [3, 7],
      discounts: false,
      catalog: [
        item('Pilsner 33cl (x30)', 'ramme', 189, 25, [1, 6]),
        item('Rødvin, Côtes du Rhône 75cl', 'fl', 59, 25, [6, 24]),
        item('Akvavit 70cl', 'fl', 169, 25, [1, 4]),
        item('Danskvand 50cl (x24)', 'kasse', 96, 25, [2, 8]),
        item('Æblemost 1L', 'fl', 22.5, 25, [6, 24]),
        item('Kaffebønner 1kg', 'pose', 149, 25, [1, 5]),
      ],
    },
    {
      id: 'dk-rengoring',
      name: 'Nordisk Rengøring & Hygiejne ApS',
      taxId: cvr('4012856'),
      address: 'Hjulmagervej 15 · 5000 Odense C',
      phone: '66 13 29 80',
      template: 'classic',
      accent: '#0e7490',
      numbering: (n) => `NRH-${String(7700 + n * 4)}`,
      lines: [3, 6],
      discounts: false,
      catalog: [
        item('Opvaskemiddel maskine 20L', 'dunk', 389, 25, [1, 3]),
        item('Affedtning køkken 5L', 'dunk', 129, 25, [1, 4]),
        item('Klorin 5L', 'dunk', 45, 25, [2, 8]),
        item('Servietter 40x40 (x1000)', 'kasse', 159, 25, [1, 5]),
        item('Nitrilhandsker M (x100)', 'æske', 69, 25, [1, 6]),
        item('Groft salt 1kg', 'pk', 12.5, 25, [5, 20]),
      ],
    },
  ],
  recipients: [
    { name: 'Restaurant Havnefronten ApS', taxId: cvr('3627180'), address: 'Nyhavn 31 · 1051 København K' },
    { name: 'Café Åboulevard I/S', taxId: cvr('3195642'), address: 'Åboulevard 52 · 8000 Aarhus C' },
  ],
  labels: {
    invoice: 'FAKTURA',
    creditNote: 'KREDITNOTA',
    deliveryNote: 'FØLGESEDDEL',
    number: 'Nr.',
    date: 'Dato:',
    client: 'Kunde',
    deliverTo: 'Leveres til',
    taxIdLabel: 'CVR-nr.',
    clientTaxIdLabel: 'CVR-nr.',
    cols: { code: 'Varenr.', desc: 'Beskrivelse', qty: 'Antal', unit: 'Enhed', price: 'Stk. pris', disc: 'Rabat', rate: 'Moms', amount: 'Beløb', check: 'Kontrol' },
    summary: { base: 'Momsgrundlag', rate: 'Momssats', tax: 'Moms', total: 'Total inkl. moms' },
    deliveryRef: (n, d) => `Følgeseddel nr. ${n} af ${d}`,
    payment: 'Betalingsbetingelser: netto 30 dage — Reg.nr. 1234 Kontonr. 0012345678',
    legal: 'Ved betaling efter forfald tilskrives renter på 0,8 % pr. påbegyndt måned.',
    noteFooter: ['Varer modtaget i god stand (underskrift)', 'Chauffør'],
    unvalued: 'Priserne fremgår af fakturaen.',
    months: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'],
    longDate: (d, m, y) => `${d}. ${m} ${y}`,
  },
  staleRate: { 25: 22 },
  corruptTaxId: corruptLast(validateDanishTaxId),
  deliveryNoteNumber: (n) => `FS${String(60000 + n * 13)}`,
  stamps: ['BETALT', 'MODTAGET', 'BOGFØRT'],
  notes: ['Tjekket - Mads', 'Mangler 1 kasse', 'Betal d. 15', 'OK køkken', 'Ring til Freja'],
};

// --- Germany ---------------------------------------------------------------------------

export const DE_CONFIG: CountryGenConfig = {
  code: 'DE',
  pack: dePack,
  seedOffset: 7000,
  baseCount: 22,
  suppliers: [
    {
      id: 'de-frische',
      name: 'Frischeparadies Großmarkt Süd GmbH',
      taxId: ustId('24718365'),
      secondaryIds: ['St.-Nr. 143/218/40512', 'HRB 18342 München'],
      address: 'Schäftlarnstraße 10 · 81371 München',
      phone: '089 76 22 410',
      template: 'classic',
      accent: '#15803d',
      numbering: (n) => `RE-2026-${String(40400 + n * 3)}`,
      lines: [4, 8],
      discounts: false,
      catalog: [
        item('Kartoffeln festkochend', 'kg', 0.98, 7, [10, 40], 1),
        item('Zwiebeln gelb', 'kg', 0.85, 7, [5, 20], 1),
        item('Tomaten Strauch', 'kg', 3.4, 7, [3, 12], 1),
        item('Kopfsalat', 'Stk', 0.95, 7, [6, 24]),
        item('Spargel weiß Kl. I', 'kg', 9.8, 7, [2, 8], 1),
        item('Äpfel Elstar', 'kg', 2.1, 7, [3, 10], 1),
      ],
    },
    {
      id: 'de-metzgerei',
      name: 'Metzgerei Hofmann & Söhne GmbH',
      taxId: ustId('81264930'),
      address: 'Schlachthofstraße 22 · 90443 Nürnberg',
      phone: '0911 42 18 70',
      template: 'erp',
      accent: '#000000',
      numbering: (n) => `${String(260000 + n * 9)}`,
      lines: [3, 7],
      discounts: true,
      catalog: [
        item('RINDERHUEFTE', 'KG', 26.9, 7, [2, 8], 3),
        item('SCHWEINENACKEN', 'KG', 8.4, 7, [3, 10], 3),
        item('NUERNBERGER BRATWURST', 'KG', 12.6, 7, [2, 6], 3),
        item('HAEHNCHENBRUST', 'KG', 11.2, 7, [3, 10], 3),
        item('SCHINKEN GEKOCHT', 'KG', 14.5, 7, [1, 4], 3),
        item('FRISCHHALTEFOLIE 300M', 'RL', 11.5, 19, [1, 3]),
      ],
    },
    {
      id: 'de-getraenke',
      name: 'Getränke Rheinland Vertriebs GmbH',
      taxId: ustId('12593741'),
      address: 'Industriestraße 77 · 50735 Köln',
      phone: '0221 97 31 50',
      template: 'modern',
      accent: '#7c2d12',
      numbering: (n) => `GRV-${26000 + n * 7}`,
      lines: [3, 7],
      discounts: false,
      catalog: [
        item('Kölsch 0,33 l (Kasten 24)', 'Kasten', 21.9, 19, [1, 6]),
        item('Riesling trocken 0,75 l', 'Fl', 6.9, 19, [6, 24]),
        item('Mineralwasser 0,7 l (Kasten 12)', 'Kasten', 7.2, 19, [2, 8]),
        item('Apfelschorle 0,5 l (Kasten 20)', 'Kasten', 14.8, 19, [1, 4]),
        item('Weizenbier 0,5 l (Kasten 20)', 'Kasten', 19.9, 19, [1, 4]),
        item('Vollmilch 3,5 % 1 l', 'Pkg', 1.15, 7, [6, 24]),
      ],
    },
    {
      id: 'de-hygiene',
      name: 'Gastro Hygiene Nord GmbH',
      taxId: ustId('30472816'),
      address: 'Billbrookdeich 112 · 22113 Hamburg',
      phone: '040 73 44 81 0',
      template: 'classic',
      accent: '#0e7490',
      numbering: (n) => `GHN${String(8800 + n * 4)}`,
      lines: [3, 6],
      discounts: false,
      catalog: [
        item('Spülmittel Maschine 20 l', 'Kanister', 36.9, 19, [1, 3]),
        item('Fettlöser Küche 5 l', 'Kanister', 12.8, 19, [1, 4]),
        item('Desinfektionsreiniger 5 l', 'Kanister', 15.4, 19, [1, 4]),
        item('Servietten 40x40 (1000 Stk)', 'Karton', 15.9, 19, [1, 5]),
        item('Nitrilhandschuhe M (100 Stk)', 'Box', 6.2, 19, [1, 6]),
        item('Speisesalz 1 kg', 'Pkg', 0.49, 7, [5, 20]),
      ],
    },
  ],
  recipients: [
    { name: 'Wirtshaus am Viktualienmarkt GmbH', taxId: ustId('27341586'), address: 'Frauenstraße 9 · 80469 München' },
    { name: 'Brauhaus Altstadt GmbH & Co. KG', taxId: ustId('21590374'), address: 'Am Hof 18 · 50667 Köln' },
  ],
  labels: {
    invoice: 'RECHNUNG',
    creditNote: 'GUTSCHRIFT',
    deliveryNote: 'LIEFERSCHEIN',
    number: 'Nr.',
    date: 'Datum:',
    client: 'Kunde',
    deliverTo: 'Lieferanschrift',
    taxIdLabel: 'USt-IdNr.',
    clientTaxIdLabel: 'USt-IdNr.',
    cols: { code: 'Art.-Nr.', desc: 'Bezeichnung', qty: 'Menge', unit: 'ME', price: 'Einzelpreis', disc: 'Rabatt', rate: 'USt.', amount: 'Betrag', check: 'Geprüft' },
    summary: { base: 'Netto', rate: 'USt.-Satz', tax: 'USt.', total: 'Gesamtbetrag' },
    deliveryRef: (n, d) => `Lieferschein Nr. ${n} vom ${d}`,
    payment: 'Zahlbar innerhalb 14 Tagen ohne Abzug — IBAN DE89 3704 0044 0532 0130 00',
    legal: 'Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum. Lieferdatum = Rechnungsdatum.',
    noteFooter: ['Ware erhalten (Unterschrift)', 'Fahrer'],
    unvalued: 'Preise siehe Rechnung.',
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    longDate: (d, m, y) => `${d}. ${m} ${y}`,
  },
  staleRate: { 19: 16, 7: 5 },
  corruptTaxId: corruptLast(validateGermanTaxId),
  deliveryNoteNumber: (n) => `LS-26-${String(5000 + n * 13)}`,
  stamps: ['BEZAHLT', 'ERHALTEN', 'GEBUCHT'],
  notes: ['Geprüft - Jonas', 'Fehlt 1 Kiste', 'Zahlen am 15.', 'OK Küche', 'Lena anrufen'],
};

// --- United Kingdom --------------------------------------------------------------------

export const GB_CONFIG: CountryGenConfig = {
  code: 'GB',
  pack: gbPack,
  seedOffset: 8000,
  baseCount: 22,
  suppliers: [
    {
      id: 'gb-greengrocer',
      name: 'Covent Garden Fresh Ltd',
      taxId: gbVat('2417358'),
      secondaryIds: ['Company No. 08214763'],
      address: 'New Covent Garden Market, Nine Elms Lane · London SW8 5LL',
      phone: '020 7622 4410',
      template: 'classic',
      accent: '#166534',
      numbering: (n) => `INV${String(204000 + n * 3)}`,
      lines: [4, 8],
      discounts: false,
      catalog: [
        item('Potatoes, Maris Piper', 'kg', 0.78, 0, [10, 40], 1),
        item('Carrots', 'kg', 0.72, 0, [5, 20], 1),
        item('Onions, brown', 'kg', 0.8, 0, [5, 20], 1),
        item('Tomatoes, vine', 'kg', 2.9, 0, [3, 12], 1),
        item('Lettuce, little gem', 'each', 0.55, 0, [6, 24]),
        item('Apples, Cox', 'kg', 2.2, 0, [3, 10], 1),
      ],
    },
    {
      id: 'gb-butcher',
      name: 'Yorkshire Dales Meat Co. Ltd',
      taxId: gbVat('6382105'),
      address: 'Leyburn Business Park · Leyburn, North Yorkshire DL8 5QA',
      phone: '01969 624 310',
      template: 'erp',
      accent: '#000000',
      numbering: (n) => `YDM/${String(55000 + n * 9).padStart(6, '0')}`,
      lines: [3, 7],
      discounts: true,
      catalog: [
        item('BEEF SIRLOIN DRY AGED', 'KG', 28.5, 0, [2, 8], 3),
        item('LAMB SHOULDER', 'KG', 12.9, 0, [2, 6], 3),
        item('CHICKEN BREAST FILLET', 'KG', 7.9, 0, [3, 10], 3),
        item('BACK BACON', 'KG', 8.2, 0, [1, 5], 3),
        item('CUMBERLAND SAUSAGES', 'KG', 6.8, 0, [2, 6], 3),
        item('CLING FILM 300M', 'ROLL', 9.5, 20, [1, 3]),
      ],
    },
    {
      id: 'gb-drinks',
      name: 'Thames Valley Drinks Wholesale Ltd',
      taxId: gbVat('9045217'),
      address: 'Unit 9, Suttons Business Park · Reading RG6 1AZ',
      phone: '0118 966 2207',
      template: 'modern',
      accent: '#1e3a8a',
      numbering: (n) => `TVD-${26000 + n * 7}`,
      lines: [3, 7],
      discounts: false,
      catalog: [
        item('IPA cask 9 gal', 'cask', 118, 20, [1, 3]),
        item('Lager 330ml (x24)', 'case', 26.4, 20, [1, 6]),
        item('House red wine 75cl', 'btl', 5.9, 20, [6, 24]),
        item('London dry gin 70cl', 'btl', 19.5, 20, [1, 4]),
        item('Cola 330ml (x24)', 'case', 13.2, 20, [1, 4]),
        item('Semi-skimmed milk 2L', 'btl', 1.65, 0, [6, 24]),
      ],
    },
    {
      id: 'gb-hygiene',
      name: 'Pennine Catering Supplies Ltd',
      taxId: gbVat('3159046'),
      address: 'Trafford Park Road 210 · Manchester M17 1HH',
      phone: '0161 872 5530',
      template: 'classic',
      accent: '#0e7490',
      numbering: (n) => `PCS${String(6100 + n * 4)}`,
      lines: [3, 6],
      discounts: false,
      catalog: [
        item('Dishwasher detergent 20L', 'drum', 34.9, 20, [1, 3]),
        item('Kitchen degreaser 5L', 'drum', 11.5, 20, [1, 4]),
        item('Thick bleach 5L', 'drum', 3.9, 20, [2, 8]),
        item('Napkins 40x40 (x1000)', 'case', 13.9, 20, [1, 5]),
        item('Nitrile gloves M (x100)', 'box', 5.6, 20, [1, 6]),
        item('Plain flour 16kg', 'sack', 12.4, 0, [1, 3]),
      ],
    },
  ],
  recipients: [
    { name: 'The Anchor Dining Rooms Ltd', taxId: gbVat('2860415'), address: '34 Bankside · London SE1 9DT' },
    { name: 'Northern Quarter Kitchen Ltd', taxId: gbVat('4720139'), address: '61 Thomas Street · Manchester M4 1NA' },
  ],
  labels: {
    invoice: 'VAT INVOICE',
    creditNote: 'CREDIT NOTE',
    deliveryNote: 'DELIVERY NOTE',
    number: 'No.',
    date: 'Date:',
    client: 'Invoice to',
    deliverTo: 'Deliver to',
    taxIdLabel: 'VAT Reg No.',
    clientTaxIdLabel: 'VAT Reg No.',
    cols: { code: 'Code', desc: 'Description', qty: 'Qty', unit: 'Unit', price: 'Unit Price', disc: 'Disc.', rate: 'VAT', amount: 'Net', check: 'Checked' },
    summary: { base: 'Net', rate: 'VAT Rate', tax: 'VAT', total: 'Invoice Total' },
    deliveryRef: (n, d) => `Delivery Note ${n} of ${d}`,
    payment: 'Payment terms: 30 days net by BACS — Sort code 20-00-00, Account 12345678',
    legal: 'Registered in England and Wales. Title to goods passes on payment in full.',
    noteFooter: ['Received in good condition (signature)', 'Driver'],
    unvalued: 'Prices are shown on the invoice.',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  staleRate: { 20: 17.5, 0: 17.5 },
  corruptTaxId: corruptLast(validateBritishTaxId),
  deliveryNoteNumber: (n) => `DN${String(77000 + n * 13)}`,
  stamps: ['PAID', 'RECEIVED', 'POSTED'],
  notes: ['Checked - Tom', '1 case short', 'Pay on 15th', 'OK kitchen', 'Call Emma'],
};
