import { esPack } from '@sentinel/core';
import type { BuiltDoc } from './build';

/** HTML templates mimicking four common Spanish invoice styles. Each returns the "paper" markup. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const money = (n: number) => esPack.formatAmount(n);
const plain = (n: number) => n.toFixed(2).replace('.', ',');
const qty = (n: number, decimals: number) => n.toFixed(decimals).replace('.', ',');
const decimalsOf = (n: number) => (Number.isInteger(n) ? 0 : (String(n).split('.')[1]?.length ?? 0));
const ddmmyyyy = (iso: string) => iso.split('-').reverse().join('/');
const ddmmyy = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y!.slice(2)}`;
};
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MONTHS[m! - 1]} de ${y}`;
};

const refs = (d: { deliveryNoteRefs: string[] }) => d.deliveryNoteRefs.join(', ');

export interface Paper {
  html: string;
  css: string;
  /** CSS width of the paper. */
  width: string;
  /** Narrow paper (tickets): overlays go in a reserved bottom margin so they never hide printed data. */
  compact?: boolean;
}

function clasica({ groundTruth: d, supplier: s, rectifies }: BuiltDoc): Paper {
  const isCredit = d.docType === 'CREDIT_NOTE';
  const rows = d.lines
    .map(
      (l, i) => `<tr><td>${String(i + 1).padStart(3, '0')}</td><td>${esc(l.description)}</td><td class="r">${qty(l.quantity, decimalsOf(l.quantity))}</td>
      <td>${esc(l.unit ?? '')}</td><td class="r">${money(l.unitPrice!)}</td><td class="r">${l.taxRate} %</td><td class="r">${money(l.lineAmount!)}</td></tr>`,
    )
    .join('');
  const summary = d.printedTaxBreakdown
    .map((b) => `<tr><td class="r">${money(b.base)}</td><td class="r">${b.rate} %</td><td class="r">${money(b.tax)}</td></tr>`)
    .join('');
  return {
    width: '794px',
    css: `
      .paper{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#222;padding:56px 48px}
      .head{display:flex;justify-content:space-between;border-bottom:3px solid ${s.accent};padding-bottom:14px}
      .logo{font-size:20px;font-weight:700;color:${s.accent}}
      .box{border:1px solid #bbb;padding:10px 14px;margin-top:18px;width:46%}
      .meta{margin-top:18px;display:flex;gap:40px}
      table{width:100%;border-collapse:collapse;margin-top:22px}
      th{background:${s.accent};color:#fff;text-align:left;padding:6px;font-size:12px}
      td{padding:5px 6px;border-bottom:1px solid #e3e3e3}
      .r{text-align:right}
      .sum{width:55%;margin-left:auto}
      .total{font-size:17px;font-weight:700;text-align:right;margin-top:12px}
      .foot{margin-top:40px;font-size:11px;color:#666}`,
    html: `
      <div class="head"><div><div class="logo">${esc(s.name)}</div><div>${esc(s.address)}</div><div>Tel. ${s.phone} · CIF: ${esc(d.issuer.taxId!)}</div></div>
      <div style="text-align:right"><div style="font-size:22px;font-weight:700">${isCredit ? 'FACTURA RECTIFICATIVA' : 'FACTURA'}</div>
      <div>Nº factura: <b>${esc(d.documentNumber)}</b></div><div>Fecha: ${ddmmyyyy(d.issueDate)}</div>
      ${rectifies ? `<div>Rectifica a: ${esc(rectifies)}</div>` : ''}${d.deliveryNoteRefs.length ? `<div>Albarán nº ${esc(refs(d))}</div>` : ''}</div></div>
      <div class="box"><b>Cliente</b><br>${esc(d.recipient.name)}<br>${esc(d.recipient.address ?? '')}<br>CIF: ${esc(d.recipient.taxId ?? '')}</div>
      <table><tr><th>Código</th><th>Descripción</th><th class="r">Cant.</th><th>Ud.</th><th class="r">Precio</th><th class="r">IVA</th><th class="r">Importe</th></tr>${rows}</table>
      <table class="sum"><tr><th class="r">Base imponible</th><th class="r">% IVA</th><th class="r">Cuota IVA</th></tr>${summary}</table>
      <div class="total">TOTAL FACTURA: ${money(d.printedTotal!)} €</div>
      <div class="foot">Forma de pago: transferencia a 30 días · IBAN ES12 0049 1500 0512 3456 7890<br>Inscrita en el Registro Mercantil. Tomo 4.512, Folio 33, Hoja V-81234.</div>`,
  };
}

function erp({ groundTruth: d, supplier: s }: BuiltDoc): Paper {
  const rows = d.lines
    .map(
      (l, i) =>
        `<tr><td>${String(1000 + i * 7)}</td><td>${esc(l.description)}</td><td class="r">${qty(l.quantity, l.unit === 'KG' ? 3 : 0)}</td>
      <td class="r">${l.unitPrice!.toFixed(4).replace('.', ',')}</td><td class="r">${l.discountPct ? plain(l.discountPct) : ''}</td>
      <td class="r">${plain(l.taxRate!)}</td><td class="r">${money(l.lineAmount!)}</td></tr>`,
    )
    .join('');
  const summary = d.printedTaxBreakdown
    .map((b) => `<tr><td class="r">${money(b.base)}</td><td class="r">${plain(b.rate)}</td><td class="r">${money(b.tax)}</td></tr>`)
    .join('');
  return {
    width: '794px',
    css: `
      .paper{font-family:'Courier New',Courier,monospace;font-size:12.5px;color:#111;padding:48px 40px}
      .hdr{border:1px dashed #333;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th{border-top:1px dashed #333;border-bottom:1px dashed #333;text-align:left;padding:4px;font-weight:700}
      td{padding:3px 4px}
      .r{text-align:right}
      .sum{width:60%;margin-left:auto;margin-top:18px}
      .tot{margin-top:10px;text-align:right;font-weight:700;font-size:15px;border-top:1px dashed #333;padding-top:6px}`,
    html: `
      <div style="font-size:16px;font-weight:700">${esc(s.name.toUpperCase())}</div>
      <div>${esc(s.address)}</div><div>C.I.F. ${esc(d.issuer.taxId!)}   TLF ${s.phone}</div><br>
      <div class="hdr"><div>FACTURA Nº: ${esc(d.documentNumber)}</div><div>FECHA: ${ddmmyy(d.issueDate)}</div>
      <div>CLIENTE: ${esc(d.recipient.name.toUpperCase())}</div><div>N.I.F.: ${esc(d.recipient.taxId ?? '')}</div>
      <div style="grid-column:span 2">DIRECCION: ${esc((d.recipient.address ?? '').toUpperCase())}</div>${d.deliveryNoteRefs.length ? `<div style="grid-column:span 2">S/ALBARAN: ${esc(refs(d))}</div>` : ''}</div>
      <table><tr><th>COD.</th><th>DESCRIPCION</th><th class="r">CANTIDAD</th><th class="r">PRECIO</th><th class="r">DTO%</th><th class="r">%IVA</th><th class="r">IMPORTE</th></tr>${rows}</table>
      <table class="sum"><tr><th class="r">BASE IMPONIBLE</th><th class="r">%IVA</th><th class="r">CUOTA</th></tr>${summary}</table>
      <div class="tot">TOTAL FACTURA EUR ..... ${money(d.printedTotal!)}</div>
      <br><div>VENCIMIENTO: 30 DIAS F.F.   RECIBO DOMICILIADO</div>`,
  };
}

function moderna({ groundTruth: d, supplier: s }: BuiltDoc): Paper {
  const rows = d.lines
    .map(
      (l) =>
        `<tr><td>${esc(l.description)}</td><td class="r">${qty(l.quantity, decimalsOf(l.quantity))} ${esc(l.unit ?? '')}</td>
      <td class="r">${plain(l.unitPrice!)} €</td><td class="r">${l.taxRate}%</td><td class="r">${plain(l.lineAmount!)} €</td></tr>`,
    )
    .join('');
  const summary = d.printedTaxBreakdown
    .map((b) => `<div class="kv"><span>Base ${b.rate}%</span><span>${plain(b.base)} €</span></div><div class="kv"><span>IVA ${b.rate}%</span><span>${plain(b.tax)} €</span></div>`)
    .join('');
  return {
    width: '794px',
    css: `
      .paper{font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#1f2937}
      .band{background:${s.accent};color:#fff;padding:36px 48px;display:flex;justify-content:space-between;align-items:flex-end}
      .band h1{margin:0;font-size:26px;letter-spacing:.5px}
      .body{padding:28px 48px 48px}
      .cols{display:flex;justify-content:space-between;color:#4b5563}
      table{width:100%;border-collapse:collapse;margin-top:26px}
      th{text-align:left;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;border-bottom:2px solid #e5e7eb;padding:8px 4px}
      td{padding:9px 4px;border-bottom:1px solid #f1f5f9}
      .r{text-align:right}
      .sum{width:300px;margin-left:auto;margin-top:22px}
      .kv{display:flex;justify-content:space-between;padding:3px 0}
      .grand{border-top:2px solid ${s.accent};margin-top:8px;padding-top:8px;font-size:18px;font-weight:700;color:${s.accent}}`,
    html: `
      <div class="band"><div><h1>${esc(s.name)}</h1><div>${esc(s.address)}</div><div>NIF ${esc(d.issuer.taxId!)}</div></div>
      <div style="text-align:right"><div style="font-size:12px;opacity:.85">FACTURA</div><div style="font-size:18px;font-weight:700">${esc(d.documentNumber)}</div><div>${longDate(d.issueDate)}</div>${d.deliveryNoteRefs.length ? `<div style="font-size:12px;opacity:.85">Albarán ${esc(refs(d))}</div>` : ''}</div></div>
      <div class="body"><div class="cols"><div><b>Facturar a</b><br>${esc(d.recipient.name)}<br>${esc(d.recipient.address ?? '')}<br>NIF ${esc(d.recipient.taxId ?? '')}</div>
      <div style="text-align:right"><b>Pago</b><br>Domiciliación SEPA<br>Vencimiento 30 días</div></div>
      <table><tr><th>Producto</th><th class="r">Cantidad</th><th class="r">Precio</th><th class="r">IVA</th><th class="r">Importe</th></tr>${rows}</table>
      <div class="sum">${summary}<div class="kv grand"><span>Total</span><span>${plain(d.printedTotal!)} €</span></div></div></div>`,
  };
}

function ticket({ groundTruth: d, supplier: s }: BuiltDoc): Paper {
  const rows = d.lines
    .map(
      (l) =>
        `<div>${esc(l.description.toUpperCase())}</div><div class="kv"><span>${qty(l.quantity, 0)} x ${plain(l.unitPrice!)}  (${l.taxRate}%)</span><span>${plain(l.lineAmount!)}</span></div>`,
    )
    .join('');
  const summary = d.printedTaxBreakdown
    .map((b) => `<div class="kv"><span>IVA ${b.rate}%  Base ${plain(b.base)}</span><span>Cuota ${plain(b.tax)}</span></div>`)
    .join('');
  return {
    width: '340px',
    compact: true,
    css: `
      .paper{font-family:'Courier New',monospace;font-size:13px;color:#222;padding:22px 18px;background:#fbfbf7}
      .c{text-align:center}
      .kv{display:flex;justify-content:space-between}
      hr{border:0;border-top:1px dashed #555;margin:8px 0}
      .tot{font-size:17px;font-weight:700}`,
    html: `
      <div class="c" style="font-weight:700;font-size:15px">${esc(s.name.toUpperCase())}</div>
      <div class="c">${esc(s.address)}</div><div class="c">NIF ${esc(d.issuer.taxId!)}</div><hr>
      <div>FACTURA SIMPLIFICADA</div><div>Nº ${esc(d.documentNumber)}</div><div>${ddmmyyyy(d.issueDate)}  08:${String(10 + (d.lines.length * 7) % 50)}</div>
      <div>CLIENTE: ${esc(d.recipient.name)}</div><div>NIF CLIENTE: ${esc(d.recipient.taxId ?? '')}</div><hr>
      ${rows}<hr>${summary}<hr>
      <div class="kv tot"><span>TOTAL EUR</span><span>${plain(d.printedTotal!)}</span></div><hr>
      <div class="c">GRACIAS POR SU VISITA</div>`,
  };
}

/** Unvalued delivery note, as signed in the kitchen when the goods arrive. */
function albaran({ groundTruth: d, supplier: s }: BuiltDoc): Paper {
  const rows = d.lines
    .map(
      (l, i) =>
        `<tr><td>${String(200 + i * 3)}</td><td>${esc(l.description.toUpperCase())}</td><td class="r">${qty(l.quantity, decimalsOf(l.quantity))}</td><td>${esc((l.unit ?? '').toUpperCase())}</td><td class="chk"></td></tr>`,
    )
    .join('');
  return {
    width: '794px',
    css: `
      .paper{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#222;padding:48px}
      .head{display:flex;justify-content:space-between;border-bottom:2px solid ${s.accent === '#000000' ? '#444' : s.accent};padding-bottom:12px}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{border:1px solid #999;background:#f0f0f0;text-align:left;padding:6px;font-size:12px}
      td{border:1px solid #bbb;padding:6px}
      .r{text-align:right}
      .chk{width:60px}
      .sign{display:flex;gap:40px;margin-top:46px}
      .sign div{flex:1;border-top:1px solid #555;padding-top:6px;font-size:11px;color:#555}`,
    html: `
      <div class="head"><div><div style="font-size:18px;font-weight:700">${esc(s.name)}</div><div>${esc(s.address)}</div><div>CIF ${esc(d.issuer.taxId!)}</div></div>
      <div style="text-align:right"><div style="font-size:20px;font-weight:700">ALBARÁN DE ENTREGA</div><div>Nº: <b>${esc(d.documentNumber)}</b></div><div>Fecha: ${ddmmyyyy(d.issueDate)}</div></div></div>
      <div style="margin-top:16px"><b>Entregar a:</b> ${esc(d.recipient.name)} · ${esc(d.recipient.address ?? '')} · CIF ${esc(d.recipient.taxId ?? '')}</div>
      <table><tr><th>Ref.</th><th>Artículo</th><th class="r">Cantidad</th><th>Ud.</th><th>Check</th></tr>${rows}</table>
      <div style="margin-top:14px;font-size:11px;color:#555">Mercancía sin valorar. Los precios se indicarán en la factura.</div>
      <div class="sign"><div>Recibido conforme (firma y sello)</div><div>Transportista</div></div>`,
  };
}

export const ES_TEMPLATES = { clasica, erp, moderna, ticket, albaran } as const;
