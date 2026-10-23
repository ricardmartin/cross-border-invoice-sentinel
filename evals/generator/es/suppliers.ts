import { cifControl } from '@sentinel/core';

/** Fictional Spanish suppliers. CIFs are generated with a valid control character. */

const cif = (org: string, digits7: string) => {
  const c = cifControl(digits7);
  return org + digits7 + ('PQRSNW'.includes(org) ? c.letter : c.digit);
};

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const nif = (digits8: string) => digits8 + DNI_LETTERS[Number(digits8) % 23];

export interface CatalogItem {
  description: string;
  unit: string;
  price: number;
  rate: number;
  qty: [min: number, max: number];
  qtyDecimals: number;
}

/** ES uses its own legacy templates; FR/IT use the generic localized ones (classic, erp, modern). */
export type TemplateId = 'clasica' | 'erp' | 'moderna' | 'ticket' | 'classic' | 'modern';

export interface Supplier {
  id: string;
  /** Extra identifiers printed in the header (e.g. SIRET next to the TVA number); not the extraction target. */
  secondaryIds?: string[];
  name: string;
  taxId: string;
  address: string;
  phone: string;
  template: TemplateId;
  accent: string;
  numbering: (n: number) => string;
  lines: [min: number, max: number];
  discounts: boolean;
  catalog: CatalogItem[];
}

const item = (description: string, unit: string, price: number, rate: number, qty: [number, number], qtyDecimals = 0): CatalogItem => ({
  description,
  unit,
  price,
  rate,
  qty,
  qtyDecimals,
});

export const ES_SUPPLIERS: Supplier[] = [
  {
    id: 'es-turia',
    name: 'Hortofrutícola del Turia S.L.',
    taxId: cif('B', '4639127'),
    address: 'Mercavalencia, Nave 14 · Ctra. en Corts 231 · 46013 Valencia',
    phone: '963 41 22 18',
    template: 'clasica',
    accent: '#2f6b3a',
    numbering: (n) => `F-2026/${String(4100 + n).padStart(5, '0')}`,
    lines: [4, 9],
    discounts: false,
    catalog: [
      item('Tomate pera', 'kg', 1.85, 4, [4, 20], 1),
      item('Lechuga romana', 'ud', 0.65, 4, [6, 30]),
      item('Cebolla dulce', 'kg', 1.15, 4, [5, 25], 1),
      item('Patata agria', 'kg', 0.89, 4, [10, 40], 1),
      item('Pimiento rojo', 'kg', 2.45, 4, [2, 10], 1),
      item('Limón', 'kg', 1.6, 4, [2, 8], 1),
      item('Naranja zumo', 'kg', 0.95, 4, [10, 30], 1),
      item('Zanahoria', 'kg', 0.79, 4, [3, 12], 1),
      item('Champiñón laminado', 'kg', 3.9, 4, [1, 5], 1),
      item('Aceituna gordal', 'kg', 5.4, 10, [1, 4], 1),
      item('Huevos camperos L (30 ud)', 'bandeja', 6.9, 4, [1, 6]),
    ],
  },
  {
    id: 'es-montes',
    name: 'Cárnicas Montes de Toledo S.A.',
    taxId: cif('A', '4518206'),
    address: 'Polígono Industrial Santa María de Benquerencia, C/ Río Jarama 52 · 45007 Toledo',
    phone: '925 23 08 77',
    template: 'erp',
    accent: '#000000',
    numbering: (n) => `FV26-${String(812 + n * 7).padStart(6, '0')}`,
    lines: [3, 8],
    discounts: true,
    catalog: [
      item('TERNERA LOMO BAJO EXTRA', 'KG', 24.9, 10, [2, 9], 3),
      item('SOLOMILLO CERDO IBERICO', 'KG', 15.75, 10, [1, 6], 3),
      item('POLLO CAMPERO ENTERO', 'KG', 4.35, 10, [4, 15], 3),
      item('CHULETILLA CORDERO LECHAL', 'KG', 19.8, 10, [1, 5], 3),
      item('JAMON CEBO IBERICO LONCHEADO 100G', 'UD', 6.45, 10, [5, 30]),
      item('CHORIZO SARTA PICANTE', 'KG', 8.9, 10, [1, 4], 3),
      item('HAMBURGUESA VACUNO 180G', 'UD', 1.38, 10, [20, 80]),
      item('BOLSA VACIO 30X40 (100 UD)', 'CAJA', 12.6, 21, [1, 3]),
    ],
  },
  {
    id: 'es-ebro',
    name: 'Distribuciones de Bebidas Ebro S.L.',
    taxId: cif('B', '5027443'),
    address: 'Av. de Cataluña 301 · 50014 Zaragoza',
    phone: '976 47 15 90',
    template: 'moderna',
    accent: '#1d4ed8',
    numbering: (n) => `EB-${2026}${String(2300 + n * 3)}`,
    lines: [3, 8],
    discounts: false,
    catalog: [
      item('Vino tinto Somontano crianza 75cl', 'botella', 7.2, 21, [6, 36]),
      item('Cerveza Ambar Especial 33cl (24 ud)', 'caja', 17.4, 21, [2, 10]),
      item('Refresco cola 20cl (24 ud)', 'caja', 13.9, 21, [1, 6]),
      item('Tónica premium 20cl (24 ud)', 'caja', 15.6, 21, [1, 4]),
      item('Agua mineral 1,5L (6 ud)', 'pack', 2.1, 10, [5, 30]),
      item('Agua con gas 50cl (24 ud)', 'caja', 9.8, 10, [1, 6]),
      item('Zumo de naranja 1L', 'brik', 1.45, 10, [6, 24]),
      item('Ginebra London Dry 70cl', 'botella', 13.95, 21, [1, 6]),
      item('Vermut rojo 1L', 'botella', 8.6, 21, [1, 6]),
    ],
  },
  {
    id: 'es-cantabrico',
    name: 'Limpiezas y Menaje Cantábrico S.L.',
    taxId: cif('B', '3915608'),
    address: 'C/ Marqués de la Hermida 44 · 39009 Santander',
    phone: '942 31 64 20',
    template: 'clasica',
    accent: '#0e7490',
    numbering: (n) => `LMC/${String(2026)}/${String(330 + n * 2).padStart(4, '0')}`,
    lines: [3, 7],
    discounts: false,
    catalog: [
      item('Detergente lavavajillas industrial 20L', 'garrafa', 38.5, 21, [1, 3]),
      item('Abrillantador lavavajillas 10L', 'garrafa', 27.35, 21, [1, 2]),
      item('Desengrasante cocina 5L', 'garrafa', 11.9, 21, [1, 4]),
      item('Lejía apta uso alimentario 5L', 'garrafa', 3.45, 21, [2, 8]),
      item('Servilleta papel 40x40 (1200 ud)', 'caja', 18.2, 21, [1, 5]),
      item('Film transparente 300m', 'rollo', 9.75, 21, [1, 6]),
      item('Guante nitrilo talla M (100 ud)', 'caja', 6.8, 21, [1, 6]),
      item('Sal fina 1kg', 'paquete', 0.42, 10, [5, 20]),
    ],
  },
  {
    id: 'es-sangines',
    name: 'Obrador San Ginés',
    taxId: nif('50731846'),
    address: 'C/ Arenal 11 · 28013 Madrid',
    phone: '915 47 80 12',
    template: 'ticket',
    accent: '#000000',
    numbering: (n) => `T-${String(77120 + n * 13)}`,
    lines: [2, 5],
    discounts: false,
    catalog: [
      item('Barra de pan', 'ud', 0.95, 4, [10, 60]),
      item('Pan de hogaza', 'ud', 3.2, 4, [2, 10]),
      item('Pan de molde', 'ud', 2.45, 4, [1, 6]),
      item('Croissant mantequilla', 'ud', 1.1, 10, [6, 40]),
      item('Napolitana chocolate', 'ud', 1.25, 10, [6, 24]),
      item('Bizcocho casero', 'ud', 6.5, 10, [1, 3]),
    ],
  },
];

export const ES_RECIPIENTS = [
  { name: 'Restaurante La Barra S.L.', taxId: cif('B', '8712345'), address: 'C/ de Ponzano 38 · 28003 Madrid' },
  { name: 'Taberna El Pósito S.L.', taxId: cif('B', '2754310'), address: 'Plaza Mayor 3 · 45001 Toledo' },
];
