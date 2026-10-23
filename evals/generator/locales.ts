import { fromCents, frPack, itPack, luhnValid, partitaIvaControl, pctCents, sumCents, toCents, tvaKey, validateFrenchTaxId, validateItalianTaxId, type CountryPack, type ExtractedDocument, type PrintedCharge } from '@sentinel/core';
import { DE_CONFIG, DK_CONFIG, GB_CONFIG, IE_CONFIG, PT_CONFIG } from './locales-more';
import type { CatalogItem, Supplier } from './es/suppliers';
import type { TemplateLabels } from './templates';

/** Everything a country contributes to the synthetic dataset: suppliers, restaurants, labels and its "stale ERP" bugs. */
export interface CountryGenConfig {
  code: string;
  pack: CountryPack;
  /** Added to the global seed so each country has its own RNG stream; never change it once a baseline exists. */
  seedOffset: number;
  /** Base documents before the delivery-note scenarios are appended. */
  baseCount: number;
  suppliers: Supplier[];
  recipients: { name: string; taxId: string; address: string }[];
  labels: TemplateLabels;
  /** Outdated rate an old ERP would still apply (FR 19,6 % until 2014, IT 21 % until 2013). */
  staleRate: Record<number, number>;
  corruptTaxId: (id: string) => string;
  deliveryNoteNumber: (n: number) => string;
  /** Local equivalents of the ES stamp / handwritten-note texts, same order. */
  stamps: [string, string, string];
  notes: [string, string, string, string, string];
  /** Tax regions (Azores, Canarias…): extra documents appended after the others, so existing ids never move. */
  regions?: RegionGenConfig[];
  /** Invoices with surcharges / withholdings / stamp duty, appended after everything else. */
  charges?: ChargeGenConfig[];
  /** Tax-authority control code (PT ATCUD) printed on every invoice and credit note. */
  controlCode?: (doc: ExtractedDocument) => string;
}

export interface ChargeGenConfig {
  supplier: Supplier;
  recipient: { name: string; taxId: string; address: string };
  /** The charge rows, computed from the document's lines and summary as the supplier's ERP would. */
  charges: (doc: ExtractedDocument) => PrintedCharge[];
  plant?: 'TOTAL_OFFSET' | 'CHARGE_AMOUNT';
  labels?: Partial<TemplateLabels>;
}

export interface RegionGenConfig {
  /** Pack region id, checked against `taxRegimeFor` when building. */
  id: string;
  /** Suppliers of the region; their catalogs carry mainland rates, translated with `rateMap`. */
  suppliers: Supplier[];
  /** Restaurants in the region (their postal code selects the regime). */
  recipients: { name: string; taxId: string; address: string }[];
  rateMap: Record<number, number>;
  /** Label overrides, e.g. "IGIC" instead of "IVA" in the summary. */
  labels?: Partial<TemplateLabels>;
  /** Documents for this region; the second one is billed at a mainland rate (stale-ERP bug). */
  count: number;
}

const item = (description: string, unit: string, price: number, rate: number, qty: [number, number], qtyDecimals = 0): CatalogItem => ({
  description,
  unit,
  price,
  rate,
  qty,
  qtyDecimals,
});

// --- id helpers ----------------------------------------------------------------

const sirenFrom = (eight: string) => {
  for (let d = 0; d < 10; d++) if (luhnValid(eight + d)) return eight + d;
  throw new Error('unreachable');
};
const siretFrom = (siren: string, nic4: string) => {
  for (let d = 0; d < 10; d++) if (luhnValid(siren + nic4 + d)) return siren + nic4 + d;
  throw new Error('unreachable');
};
const frIds = (eight: string, nic4: string) => {
  const siren = sirenFrom(eight);
  const siret = siretFrom(siren, nic4);
  return { tva: `FR${tvaKey(siren)}${siren}`, siret: `SIRET ${siret.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4')}` };
};
const piva = (ten: string) => ten + partitaIvaControl(ten);

// --- France ------------------------------------------------------------------------

const PRIMEURS = frIds('81726354', '0011');
const LEMOINE = frIds('49283716', '0024');
const CAVE = frIds('53019284', '0016');
const HYGIENE = frIds('42918372', '0039');

export const FR_CONFIG: CountryGenConfig = {
  code: 'FR',
  pack: frPack,
  seedOffset: 2000,
  baseCount: 22,
  suppliers: [
    {
      id: 'fr-primeurs',
      name: 'Primeurs du Val de Loire SARL',
      taxId: PRIMEURS.tva,
      secondaryIds: [PRIMEURS.siret],
      address: 'MIN de Rungis, Bât. D4 · 94150 Rungis',
      phone: '01 46 87 12 33',
      template: 'classic',
      accent: '#3f6212',
      numbering: (n) => `FA-2026-${String(10400 + n * 3).padStart(6, '0')}`,
      lines: [4, 8],
      discounts: false,
      catalog: [
        item('Tomates grappe', 'kg', 2.85, 5.5, [3, 15], 1),
        item('Salade batavia', 'pièce', 0.95, 5.5, [6, 24]),
        item('Carottes des sables', 'kg', 1.1, 5.5, [5, 20], 1),
        item('Pommes Golden', 'kg', 2.2, 5.5, [3, 12], 1),
        item('Oignons jaunes', 'kg', 1.05, 5.5, [5, 20], 1),
        item('Champignons de Paris', 'kg', 4.3, 5.5, [1, 5], 1),
        item('Herbes fraîches (botte)', 'botte', 1.2, 5.5, [5, 20]),
      ],
    },
    {
      id: 'fr-lemoine',
      name: 'Boucherie Charcuterie Lemoine SAS',
      taxId: LEMOINE.tva,
      secondaryIds: [LEMOINE.siret],
      address: '18 rue des Abattoirs · 69007 Lyon',
      phone: '04 78 61 22 90',
      template: 'erp',
      accent: '#000000',
      numbering: (n) => `F26/${String(7100 + n * 9).padStart(5, '0')}`,
      lines: [3, 7],
      discounts: true,
      catalog: [
        item('ENTRECOTE BOEUF CHAROLAIS', 'KG', 32.9, 5.5, [2, 8], 3),
        item('FILET DE VOLAILLE LABEL ROUGE', 'KG', 12.4, 5.5, [3, 10], 3),
        item('JAMBON BLANC SUPERIEUR', 'KG', 14.8, 5.5, [1, 4], 3),
        item('SAUCISSE DE TOULOUSE', 'KG', 9.6, 5.5, [2, 6], 3),
        item('BAVETTE D ALOYAU', 'KG', 21.5, 5.5, [2, 6], 3),
        item('FILM ETIRABLE 300M', 'RLX', 11.9, 20, [1, 3]),
      ],
    },
    {
      id: 'fr-cave',
      name: 'Cave & Boissons Rhône-Alpes SAS',
      taxId: CAVE.tva,
      secondaryIds: [CAVE.siret],
      address: '230 avenue Jean Jaurès · 69007 Lyon',
      phone: '04 72 33 18 05',
      template: 'modern',
      accent: '#7f1d1d',
      numbering: (n) => `CB${String(26000 + n * 7)}`,
      lines: [3, 7],
      discounts: false,
      catalog: [
        item('Vin rouge Côtes du Rhône 75cl', 'bouteille', 6.9, 20, [6, 36]),
        item('Champagne brut 75cl', 'bouteille', 22.5, 20, [2, 12]),
        item('Bière blonde 33cl (x24)', 'caisse', 21.6, 20, [1, 6]),
        item('Eau minérale 1L (x6)', 'pack', 3.1, 5.5, [5, 20]),
        item("Jus d'orange 1L", 'bouteille', 1.95, 5.5, [6, 24]),
        item('Sirop de grenadine 1L', 'bouteille', 3.4, 5.5, [1, 6]),
        item('Cognac VSOP 70cl', 'bouteille', 34.9, 20, [1, 3]),
      ],
    },
    {
      id: 'fr-hygiene',
      name: 'Hygiène Pro Atlantique SARL',
      taxId: HYGIENE.tva,
      secondaryIds: [HYGIENE.siret],
      address: '5 rue de la Garenne · 44300 Nantes',
      phone: '02 40 52 77 14',
      template: 'classic',
      accent: '#0e7490',
      numbering: (n) => `HPA-${String(2600 + n * 4)}`,
      lines: [3, 6],
      discounts: false,
      catalog: [
        item('Détergent vaisselle machine 20L', 'bidon', 34.9, 20, [1, 3]),
        item('Dégraissant cuisine 5L', 'bidon', 12.5, 20, [1, 4]),
        item('Eau de Javel 5L', 'bidon', 3.9, 20, [2, 8]),
        item('Serviettes papier 40x40 (x1000)', 'carton', 15.8, 20, [1, 5]),
        item('Gants nitrile taille M (x100)', 'boîte', 6.4, 20, [1, 6]),
        item('Sel fin 1kg', 'paquet', 0.55, 5.5, [5, 20]),
      ],
    },
  ],
  recipients: [
    { name: 'Bistrot du Canal SAS', taxId: frIds('88214907', '0018').tva, address: '45 quai de Valmy · 75010 Paris' },
    { name: 'Brasserie des Halles SARL', taxId: frIds('79055213', '0027').tva, address: '12 rue Montorgueil · 75001 Paris' },
  ],
  labels: {
    invoice: 'FACTURE',
    creditNote: 'AVOIR',
    deliveryNote: 'BON DE LIVRAISON',
    number: 'N°',
    date: 'Date :',
    client: 'Client',
    deliverTo: 'Livré à',
    taxIdLabel: 'N° TVA intracom.',
    clientTaxIdLabel: 'TVA',
    cols: { code: 'Réf.', desc: 'Désignation', qty: 'Qté', unit: 'Unité', price: 'PU HT', disc: 'Remise', rate: 'TVA', amount: 'Montant HT', check: 'Contrôle' },
    summary: { base: 'Base HT', rate: 'Taux', tax: 'Montant TVA', total: 'Total TTC' },
    deliveryRef: (n, d) => `BL n° ${n} du ${d}`,
    payment: 'Paiement à 30 jours fin de mois par virement — IBAN FR76 3000 4012 3400 0101 2345 678',
    legal: 'Pénalités de retard : 3 fois le taux d’intérêt légal. Indemnité forfaitaire pour frais de recouvrement : 40 €.',
    noteFooter: ['Marchandise reçue conforme (signature et cachet)', 'Livreur'],
    unvalued: 'Bon de livraison non valorisé : les prix figurent sur la facture.',
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  },
  staleRate: { 20: 19.6, 10: 7, 5.5: 7 },
  corruptTaxId: (id) => {
    const bad = id.slice(0, 2) + String((Number(id.slice(2, 4)) + 7) % 97).padStart(2, '0') + id.slice(4);
    if (validateFrenchTaxId(bad).valid) throw new Error(`corrupted id ${bad} still valid`);
    return bad;
  },
  deliveryNoteNumber: (n) => `BL-26${String(4000 + n * 13).padStart(5, '0')}`,
  stamps: ['PAYÉ', 'REÇU', 'COMPTABILISÉ'],
  notes: ['Vérifié - Paul', 'Manque 1 carton', 'Payer le 15', 'OK cuisine', 'Appeler Julie'],
};

// --- Italy -------------------------------------------------------------------------

export const IT_CONFIG: CountryGenConfig = {
  code: 'IT',
  pack: itPack,
  seedOffset: 3000,
  baseCount: 22,
  suppliers: [
    {
      id: 'it-ortofrutta',
      name: 'Ortofrutta Lombarda S.r.l.',
      taxId: piva('0451238790'),
      secondaryIds: ['REA MI-1987654'],
      address: 'Via Lodi 140 · 20139 Milano (MI)',
      phone: '02 5521 4430',
      template: 'classic',
      accent: '#166534',
      numbering: (n) => `${String(1200 + n * 3)}/2026`,
      lines: [4, 8],
      discounts: false,
      catalog: [
        item('Pomodori ciliegini', 'kg', 3.4, 4, [3, 12], 1),
        item('Insalata iceberg', 'pz', 0.9, 4, [6, 24]),
        item('Zucchine', 'kg', 1.8, 4, [3, 12], 1),
        item('Limoni di Sicilia', 'kg', 2.1, 4, [2, 8], 1),
        item('Patate novelle', 'kg', 0.85, 4, [5, 25], 1),
        item('Carciofi romaneschi', 'pz', 1.15, 4, [6, 24]),
      ],
    },
    {
      id: 'it-valtellina',
      name: 'Salumificio Valtellina S.p.A.',
      taxId: piva('0712345678'),
      secondaryIds: ['Cap. Soc. € 1.200.000 i.v.'],
      address: 'Via Stelvio 9 · 23100 Sondrio (SO)',
      phone: '0342 51 88 20',
      template: 'erp',
      accent: '#000000',
      numbering: (n) => `SV/26/${String(5200 + n * 5).padStart(6, '0')}`,
      lines: [3, 7],
      discounts: true,
      catalog: [
        item('BRESAOLA DELLA VALTELLINA IGP', 'KG', 29.5, 10, [1, 5], 3),
        item('PROSCIUTTO CRUDO STAGIONATO', 'KG', 21.9, 10, [2, 6], 3),
        item('SALAME MILANO', 'KG', 16.4, 10, [1, 4], 3),
        item('MOZZARELLA FIOR DI LATTE', 'KG', 9.4, 4, [3, 10], 3),
        item('BURRO DI MONTAGNA', 'KG', 11.6, 4, [1, 5], 3),
        item('PELLICOLA ALIMENTARE 300M', 'PZ', 10.8, 22, [1, 3]),
      ],
    },
    {
      id: 'it-enoteca',
      name: 'Enoteca Distribuzione Veneto S.r.l.',
      taxId: piva('0398765432'),
      address: 'Viale della Repubblica 88 · 31100 Treviso (TV)',
      phone: '0422 41 17 60',
      template: 'modern',
      accent: '#6b21a8',
      numbering: (n) => `EDV-2026-${String(880 + n * 2).padStart(5, '0')}`,
      lines: [3, 7],
      discounts: false,
      catalog: [
        item('Valpolicella Classico DOC 75cl', 'bt', 8.9, 22, [6, 36]),
        item('Prosecco DOC Treviso 75cl', 'bt', 7.4, 22, [6, 36]),
        item('Birra artigianale 33cl (x24)', 'cassa', 26.4, 22, [1, 6]),
        item('Acqua minerale 1L (x6)', 'conf', 2.8, 22, [5, 20]),
        item('Grappa di Prosecco 70cl', 'bt', 18.5, 22, [1, 4]),
        item('Amaro alle erbe 70cl', 'bt', 14.2, 22, [1, 4]),
      ],
    },
    {
      id: 'it-pastificio',
      name: 'Pastificio e Panificio Emiliano S.r.l.',
      taxId: piva('0287654310'),
      address: 'Via Emilia Est 412 · 41122 Modena (MO)',
      phone: '059 36 22 81',
      template: 'classic',
      accent: '#b45309',
      numbering: (n) => `PPE ${String(310 + n * 2)}/26`,
      lines: [3, 7],
      discounts: false,
      catalog: [
        item('Farina tipo 00', 'kg', 0.98, 4, [10, 50]),
        item('Tagliatelle fresche all’uovo', 'kg', 6.2, 4, [2, 10], 1),
        item('Pane casereccio', 'kg', 3.1, 4, [3, 12], 1),
        item('Grissini torinesi (conf.)', 'conf', 2.4, 4, [5, 20]),
        item('Olio extravergine di oliva 5L', 'latta', 44.5, 4, [1, 3]),
        item('Detersivo piatti 5L', 'tanica', 9.8, 22, [1, 3]),
      ],
    },
  ],
  recipients: [
    { name: 'Trattoria Navigli S.r.l.', taxId: piva('0912345670'), address: 'Alzaia Naviglio Grande 66 · 20144 Milano' },
    { name: 'Osteria del Ponte S.n.c.', taxId: piva('0256781234'), address: 'Via Garibaldi 21 · 37121 Verona' },
  ],
  labels: {
    invoice: 'FATTURA',
    creditNote: 'NOTA DI CREDITO',
    deliveryNote: 'DOCUMENTO DI TRASPORTO (D.d.t.)',
    number: 'n.',
    date: 'Data',
    client: 'Cessionario',
    deliverTo: 'Destinatario',
    taxIdLabel: 'P.IVA',
    clientTaxIdLabel: 'P.IVA',
    cols: { code: 'Codice', desc: 'Descrizione', qty: 'Q.tà', unit: 'U.M.', price: 'Prezzo', disc: 'Sc. %', rate: 'IVA', amount: 'Importo', check: 'Colli' },
    summary: { base: 'Imponibile', rate: 'Aliquota', tax: 'Imposta', total: 'Totale documento', amountDue: 'Netto a pagare' },
    deliveryRef: (n, d) => `Rif. DDT n. ${n} del ${d}`,
    payment: 'Pagamento: bonifico bancario 30 gg d.f.f.m. — IBAN IT60 X054 2811 1010 0000 0123 456',
    legal: 'Fattura emessa anche in formato elettronico (SdI). Contributo CONAI assolto ove dovuto.',
    noteFooter: ['Causale del trasporto: vendita — Aspetto dei beni: colli', 'Firma del destinatario', 'Firma del vettore'],
    unvalued: 'Merce non valorizzata: i prezzi sono riportati in fattura (fattura differita).',
    months: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  },
  staleRate: { 22: 21, 10: 20, 4: 20, 5: 20 },
  corruptTaxId: (id) => {
    const bad = id.slice(0, 10) + String((Number(id[10]) + 3) % 10);
    if (validateItalianTaxId(bad).valid) throw new Error(`corrupted id ${bad} still valid`);
    return bad;
  },
  deliveryNoteNumber: (n) => `${String(2100 + n * 3)}/D`,
  stamps: ['PAGATO', 'RICEVUTO', 'CONTABILIZZATO'],
  notes: ['Controllato - Luca', 'Manca 1 cassa', 'Pagare il 15', 'OK cucina', 'Chiamare Giulia'],
};

// Ritenuta d'acconto (a food-safety consultant, 20 %) and bollo (a food supplier charging it on a VAT invoice).
const haccp: Supplier = {
  id: 'it-studio-haccp',
  name: 'Dott. Marco Bellini · Studio Sicurezza Alimentare',
  taxId: piva('0451238907'),
  address: 'Via dei Mille 14 · 40121 Bologna (BO)',
  phone: '051 23 45 61',
  template: 'modern',
  accent: '#0e7490',
  numbering: (n) => `${String(40 + n)}/2026`,
  lines: [2, 3],
  discounts: false,
  catalog: [
    item('Consulenza HACCP semestrale', 'serv', 450, 22, [1, 1]),
    item('Analisi microbiologiche (campione)', 'pz', 38, 22, [2, 6]),
    item('Corso formazione alimentaristi', 'pers', 60, 22, [1, 4]),
  ],
};
const ritenuta = (doc: ExtractedDocument): PrintedCharge[] => {
  const base = sumCents(doc.printedTaxBreakdown.map((b) => toCents(b.base)));
  return [{ kind: 'WITHHOLDING', label: "Ritenuta d'acconto 20 %", rate: 20, base: fromCents(base), amount: fromCents(pctCents(base, 20)) }];
};
const bollo = (): PrintedCharge[] => [{ kind: 'STAMP_DUTY', label: 'Imposta di bollo', rate: null, base: null, amount: 2 }];
IT_CONFIG.charges = [
  { supplier: haccp, recipient: IT_CONFIG.recipients[0]!, charges: ritenuta },
  { supplier: haccp, recipient: IT_CONFIG.recipients[1]!, charges: ritenuta, plant: 'TOTAL_OFFSET' },
  { supplier: IT_CONFIG.suppliers.find((s) => s.id === 'it-pastificio')!, recipient: IT_CONFIG.recipients[0]!, charges: bollo },
];

/** Countries built by the generic localized generator (ES has its own, frozen generator). Adding a country = one entry here. */
export const COUNTRY_CONFIGS: Record<string, CountryGenConfig> = {
  fr: FR_CONFIG,
  it: IT_CONFIG,
  pt: PT_CONFIG,
  ie: IE_CONFIG,
  dk: DK_CONFIG,
  de: DE_CONFIG,
  gb: GB_CONFIG,
};
