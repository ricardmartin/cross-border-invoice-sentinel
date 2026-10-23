import { fromCents, sumCents, toCents, type CountryPack, type ExtractedDocument, type PrintedCharge } from '@sentinel/core';
import type { BuiltDoc } from './es/build';
import type { Paper } from './es/templates';

/**
 * Country-agnostic invoice / delivery-note templates. A country only supplies
 * its labels and its pack (number format): adding a country to the dataset
 * does not need new HTML.
 */

export interface TemplateLabels {
  invoice: string;
  creditNote: string;
  deliveryNote: string;
  number: string;
  date: string;
  client: string;
  deliverTo: string;
  taxIdLabel: string;
  clientTaxIdLabel: string;
  cols: { code: string; desc: string; qty: string; unit: string; price: string; disc: string; rate: string; amount: string; check: string };
  summary: { base: string; rate: string; tax: string; total: string; /** After withholdings: "Total a pagar", "Netto a pagare". */ amountDue?: string };
  deliveryRef: (number: string, date: string) => string;
  payment: string;
  legal: string;
  noteFooter: string[];
  unvalued: string;
  months: readonly string[];
  /** Printed before the document's control code, e.g. "ATCUD". */
  controlCodeLabel?: string;
  /** Long date as printed by the modern template; default "7 octobre 2026". */
  longDate?: (day: number, month: string, year: number) => string;
}

/** How each currency is printed next to an amount (the pack formats the number itself). */
const CURRENCY_PRINT: Record<string, (amount: string) => string> = {
  EUR: (a) => `${a} €`,
  GBP: (a) => `£${a}`,
  DKK: (a) => `${a} kr.`,
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const decimalsOf = (n: number) => (Number.isInteger(n) ? 0 : (String(n).split('.')[1]?.length ?? 0));
const qty = (n: number, decimals = decimalsOf(n)) => n.toFixed(decimals).replace('.', ',');
const ddmmyyyy = (iso: string) => iso.split('-').reverse().join('/');
const ddmmyy = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y!.slice(2)}`;
};
const longDate = (iso: string, L: TemplateLabels) => {
  const [y, m, d] = iso.split('-').map(Number);
  return L.longDate ? L.longDate(d!, L.months[m! - 1]!, y!) : `${d} ${L.months[m! - 1]} ${y}`;
};
const rate = (r: number) => `${String(r).replace('.', ',')} %`;

interface Ctx {
  doc: BuiltDoc;
  L: TemplateLabels;
  pack: CountryPack;
  /** Delivery-note date per referenced number, printed next to the reference. */
  refDate: string;
  /** Pack's decimal separator: quantities, rates and ERP unit prices are printed with it too. */
  dec: ',' | '.';
  /** Amount with its currency sign, e.g. "12,50 €", "£12.50", "12,50 kr.". */
  cur: (amount: string) => string;
}

/** The helpers above print a decimal comma; dot-decimal countries swap it. */
const local = (c: Ctx, s: string) => (c.dec === ',' ? s : s.replace(',', '.'));

const idsLine = ({ doc, L }: Ctx) => {
  // The printed id is the ground truth's (possibly corrupted by a planted error), with the usual FR TVA spacing.
  const printed = (doc.groundTruth.issuer.taxId ?? '').replace(/^([A-Z]{2})(\w{2})(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4 $5');
  return [...(doc.supplier.secondaryIds ?? []), `${L.taxIdLabel} ${printed}`].join(' · ');
};
const title = ({ doc, L }: Ctx) => (doc.groundTruth.docType === 'CREDIT_NOTE' ? L.creditNote : L.invoice);
/**
 * Charges and the control code print only when the document has them, so documents without them
 * render exactly the HTML they did before (their bytes, and so their LLM cache entries, do not move).
 */
const chargesOf = (d: ExtractedDocument) => d.printedCharges ?? [];
const withheldCents = (d: ExtractedDocument) => sumCents(chargesOf(d).filter((ch) => ch.kind === 'WITHHOLDING').map((ch) => toCents(ch.amount)));
/** The ground-truth total is the amount due; the gross total printed above it adds the withholdings back. */
const grossTotal = (d: ExtractedDocument) => fromCents(toCents(d.printedTotal!) + withheldCents(d));
const chargeAmount = (ch: PrintedCharge, m: (n: number) => string) => `${ch.kind === 'WITHHOLDING' ? '-' : ''}${m(ch.amount)}`;
const controlCode = ({ doc, L }: Ctx, wrap: (s: string) => string) =>
  doc.groundTruth.documentControlCode ? wrap(`${esc(L.controlCodeLabel ?? '')}: ${esc(doc.groundTruth.documentControlCode)}`) : '';
const amountDue = ({ doc, L }: Ctx, wrap: (label: string) => string) => (withheldCents(doc.groundTruth) ? wrap(esc(L.summary.amountDue ?? L.summary.total)) : '');

const refs = (c: Ctx) => c.doc.groundTruth.deliveryNoteRefs.map((r) => c.L.deliveryRef(r, ddmmyyyy(c.refDate))).join(' · ');

function classic(c: Ctx): Paper {
  const { doc, L, pack } = c;
  const d = doc.groundTruth;
  const m = pack.formatAmount;
  const rows = d.lines
    .map(
      (l, i) => `<tr><td>${String(10 + i * 10).padStart(4, '0')}</td><td>${esc(l.description)}</td><td class="r">${local(c, qty(l.quantity))}</td><td>${esc(l.unit ?? '')}</td>
      <td class="r">${m(l.unitPrice!)}</td><td class="r">${local(c, rate(l.taxRate!))}</td><td class="r">${m(l.lineAmount!)}</td></tr>`,
    )
    .join('');
  const summary =
    d.printedTaxBreakdown.map((b) => `<tr><td class="r">${local(c, rate(b.rate))}</td><td class="r">${m(b.base)}</td><td class="r">${m(b.tax)}</td></tr>`).join('') +
    chargesOf(d).map((ch) => `<tr><td class="r">${esc(ch.label)}</td><td class="r">${ch.base === null ? '' : m(ch.base)}</td><td class="r">${chargeAmount(ch, m)}</td></tr>`).join('');
  return {
    width: '794px',
    css: `
      .paper{font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#222;padding:56px 48px}
      .head{display:flex;justify-content:space-between;align-items:flex-start}
      .logo{font-size:21px;font-weight:700;color:${doc.supplier.accent}}
      .meta{text-align:right}
      .client{margin:22px 0 0 auto;width:45%;border:1px solid #aaa;padding:10px 14px}
      table{width:100%;border-collapse:collapse;margin-top:22px}
      th{border-bottom:2px solid ${doc.supplier.accent};text-align:left;padding:6px;font-size:12px}
      td{padding:5px 6px;border-bottom:1px solid #e6e6e6}
      .r{text-align:right}
      .sum{width:50%;margin-left:auto}
      .total{text-align:right;font-size:17px;font-weight:700;margin-top:12px}
      .foot{margin-top:36px;font-size:11px;color:#666}`,
    html: `
      <div class="head"><div><div class="logo">${esc(doc.supplier.name)}</div><div>${esc(doc.supplier.address)}</div><div>${esc(idsLine(c))}</div></div>
      <div class="meta"><div style="font-size:22px;font-weight:700;letter-spacing:1px">${esc(title(c))}</div><div>${esc(L.number)} <b>${esc(d.documentNumber)}</b></div>
      <div>${esc(L.date)} ${ddmmyyyy(d.issueDate)}</div>${controlCode(c, (s) => `<div>${s}</div>`)}${d.deliveryNoteRefs.length ? `<div>${esc(refs(c))}</div>` : ''}</div></div>
      <div class="client"><b>${esc(L.client)}</b><br>${esc(d.recipient.name)}<br>${esc(d.recipient.address ?? '')}<br>${esc(L.clientTaxIdLabel)} ${esc(d.recipient.taxId ?? '')}</div>
      <table><tr><th>${L.cols.code}</th><th>${L.cols.desc}</th><th class="r">${L.cols.qty}</th><th>${L.cols.unit}</th><th class="r">${L.cols.price}</th><th class="r">${L.cols.rate}</th><th class="r">${L.cols.amount}</th></tr>${rows}</table>
      <table class="sum"><tr><th class="r">${L.summary.rate}</th><th class="r">${L.summary.base}</th><th class="r">${L.summary.tax}</th></tr>${summary}</table>
      <div class="total">${esc(L.summary.total)} : ${c.cur(m(grossTotal(d)))}</div>${amountDue(c, (label) => `<div class="total">${label} : ${c.cur(m(d.printedTotal!))}</div>`)}
      <div class="foot">${esc(L.payment)}<br>${esc(L.legal)}</div>`,
  };
}

function erp(c: Ctx): Paper {
  const { doc, L, pack } = c;
  const d = doc.groundTruth;
  const m = pack.formatAmount;
  const rows = d.lines
    .map(
      (l, i) => `<tr><td>${String(5000 + i * 11)}</td><td>${esc(l.description)}</td><td class="r">${local(c, qty(l.quantity, l.unit === 'KG' ? 3 : 0))}</td>
      <td class="r">${local(c, l.unitPrice!.toFixed(4).replace('.', ','))}</td><td class="r">${l.discountPct ? local(c, qty(l.discountPct, 2)) : ''}</td><td class="r">${local(c, qty(l.taxRate!, 2))}</td><td class="r">${m(l.lineAmount!)}</td></tr>`,
    )
    .join('');
  const summary =
    d.printedTaxBreakdown.map((b) => `<tr><td class="r">${local(c, qty(b.rate, 2))}</td><td class="r">${m(b.base)}</td><td class="r">${m(b.tax)}</td></tr>`).join('') +
    chargesOf(d).map((ch) => `<tr><td class="r">${esc(ch.label.toUpperCase())}</td><td class="r">${ch.base === null ? '' : m(ch.base)}</td><td class="r">${chargeAmount(ch, m)}</td></tr>`).join('');
  return {
    width: '794px',
    css: `
      .paper{font-family:'Courier New',Courier,monospace;font-size:12.5px;color:#111;padding:46px 40px}
      .box{border:1px dashed #333;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th{border-top:1px dashed #333;border-bottom:1px dashed #333;text-align:left;padding:4px}
      td{padding:3px 4px}
      .r{text-align:right}
      .sum{width:60%;margin-left:auto;margin-top:16px}
      .tot{margin-top:10px;text-align:right;font-weight:700;font-size:15px;border-top:1px dashed #333;padding-top:6px}`,
    html: `
      <div style="font-size:16px;font-weight:700">${esc(doc.supplier.name.toUpperCase())}</div><div>${esc(doc.supplier.address)}</div><div>${esc(idsLine(c))}</div>
      <div class="box"><div>${esc(title(c))} ${esc(L.number)} ${esc(d.documentNumber)}</div><div>${esc(L.date)} ${ddmmyy(d.issueDate)}</div>${controlCode(c, (s) => `<div style="grid-column:span 2">${s}</div>`)}
      <div>${esc(L.client.toUpperCase())}: ${esc(d.recipient.name.toUpperCase())}</div><div>${esc(L.clientTaxIdLabel)} ${esc(d.recipient.taxId ?? '')}</div>
      ${d.deliveryNoteRefs.length ? `<div style="grid-column:span 2">${esc(refs(c).toUpperCase())}</div>` : ''}</div>
      <table><tr><th>${L.cols.code.toUpperCase()}</th><th>${L.cols.desc.toUpperCase()}</th><th class="r">${L.cols.qty.toUpperCase()}</th><th class="r">${L.cols.price.toUpperCase()}</th><th class="r">${L.cols.disc.toUpperCase()}</th><th class="r">${L.cols.rate.toUpperCase()}</th><th class="r">${L.cols.amount.toUpperCase()}</th></tr>${rows}</table>
      <table class="sum"><tr><th class="r">${L.summary.rate.toUpperCase()}</th><th class="r">${L.summary.base.toUpperCase()}</th><th class="r">${L.summary.tax.toUpperCase()}</th></tr>${summary}</table>
      <div class="tot">${esc(L.summary.total.toUpperCase())} ${pack.currency} ..... ${m(grossTotal(d))}</div>${amountDue(c, (label) => `<div class="tot">${label.toUpperCase()} ${pack.currency} ..... ${m(d.printedTotal!)}</div>`)}<br><div>${esc(L.payment.toUpperCase())}</div>`,
  };
}

function modern(c: Ctx): Paper {
  const { doc, L, pack } = c;
  const d = doc.groundTruth;
  const m = pack.formatAmount;
  const rows = d.lines
    .map(
      (l) => `<tr><td>${esc(l.description)}</td><td class="r">${local(c, qty(l.quantity))} ${esc(l.unit ?? '')}</td><td class="r">${c.cur(m(l.unitPrice!))}</td><td class="r">${local(c, rate(l.taxRate!))}</td><td class="r">${c.cur(m(l.lineAmount!))}</td></tr>`,
    )
    .join('');
  const summary = d.printedTaxBreakdown
    .map((b) => `<div class="kv"><span>${esc(L.summary.base)} ${local(c, rate(b.rate))}</span><span>${c.cur(m(b.base))}</span></div><div class="kv"><span>${esc(L.summary.tax)} ${local(c, rate(b.rate))}</span><span>${c.cur(m(b.tax))}</span></div>`)
    .join('') + chargesOf(d).map((ch) => `<div class="kv"><span>${esc(ch.label)}</span><span>${c.cur(chargeAmount(ch, m))}</span></div>`).join('');
  return {
    width: '794px',
    css: `
      .paper{font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#1f2937}
      .band{background:${doc.supplier.accent};color:#fff;padding:34px 48px;display:flex;justify-content:space-between;align-items:flex-end}
      .band h1{margin:0;font-size:24px}
      .body{padding:26px 48px 46px}
      table{width:100%;border-collapse:collapse;margin-top:24px}
      th{text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;border-bottom:2px solid #e5e7eb;padding:8px 4px}
      td{padding:9px 4px;border-bottom:1px solid #f1f5f9}
      .r{text-align:right}
      .sum{width:310px;margin-left:auto;margin-top:20px}
      .kv{display:flex;justify-content:space-between;padding:3px 0}
      .grand{border-top:2px solid ${doc.supplier.accent};margin-top:8px;padding-top:8px;font-size:18px;font-weight:700;color:${doc.supplier.accent}}`,
    html: `
      <div class="band"><div><h1>${esc(doc.supplier.name)}</h1><div>${esc(doc.supplier.address)}</div><div>${esc(idsLine(c))}</div></div>
      <div style="text-align:right"><div style="font-size:12px;opacity:.85">${esc(title(c))}</div><div style="font-size:18px;font-weight:700">${esc(d.documentNumber)}</div>
      <div>${longDate(d.issueDate, L)}</div>${controlCode(c, (s) => `<div style="font-size:12px;opacity:.85">${s}</div>`)}${d.deliveryNoteRefs.length ? `<div style="font-size:12px;opacity:.85">${esc(refs(c))}</div>` : ''}</div></div>
      <div class="body"><div><b>${esc(L.client)}</b><br>${esc(d.recipient.name)}<br>${esc(d.recipient.address ?? '')}<br>${esc(L.clientTaxIdLabel)} ${esc(d.recipient.taxId ?? '')}</div>
      <table><tr><th>${L.cols.desc}</th><th class="r">${L.cols.qty}</th><th class="r">${L.cols.price}</th><th class="r">${L.cols.rate}</th><th class="r">${L.cols.amount}</th></tr>${rows}</table>
      <div class="sum">${summary}<div class="kv grand"><span>${esc(L.summary.total)}</span><span>${c.cur(m(grossTotal(d)))}</span></div>${amountDue(c, (label) => `<div class="kv grand"><span>${label}</span><span>${c.cur(m(d.printedTotal!))}</span></div>`)}</div></div>`,
  };
}

function deliveryNote(c: Ctx): Paper {
  const { doc, L } = c;
  const d = doc.groundTruth;
  const rows = d.lines
    .map((l, i) => `<tr><td>${String(300 + i * 4)}</td><td>${esc(l.description.toUpperCase())}</td><td class="r">${local(c, qty(l.quantity))}</td><td>${esc((l.unit ?? '').toUpperCase())}</td><td></td></tr>`)
    .join('');
  return {
    width: '794px',
    css: `
      .paper{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#222;padding:46px}
      .head{display:flex;justify-content:space-between;border-bottom:2px solid #555;padding-bottom:12px}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{border:1px solid #999;background:#f0f0f0;text-align:left;padding:6px;font-size:12px}
      td{border:1px solid #bbb;padding:6px}
      .r{text-align:right}
      .sign{display:flex;gap:40px;margin-top:44px}
      .sign div{flex:1;border-top:1px solid #555;padding-top:6px;font-size:11px;color:#555}`,
    html: `
      <div class="head"><div><div style="font-size:18px;font-weight:700">${esc(doc.supplier.name)}</div><div>${esc(doc.supplier.address)}</div><div>${esc(idsLine(c))}</div></div>
      <div style="text-align:right"><div style="font-size:19px;font-weight:700">${esc(L.deliveryNote)}</div><div>N° <b>${esc(d.documentNumber)}</b></div><div>${esc(L.date)} ${ddmmyyyy(d.issueDate)}</div></div></div>
      <div style="margin-top:16px"><b>${esc(L.deliverTo)}:</b> ${esc(d.recipient.name)} · ${esc(d.recipient.address ?? '')} · ${esc(L.clientTaxIdLabel)} ${esc(d.recipient.taxId ?? '')}</div>
      <table><tr><th>${L.cols.code}</th><th>${L.cols.desc}</th><th class="r">${L.cols.qty}</th><th>${L.cols.unit}</th><th>${L.cols.check}</th></tr>${rows}</table>
      <div style="margin-top:14px;font-size:11px;color:#555">${esc(L.unvalued)}</div>
      <div class="sign">${L.noteFooter.map((f) => `<div>${esc(f)}</div>`).join('')}</div>`,
  };
}

export function renderLocalized(doc: BuiltDoc, L: TemplateLabels, pack: CountryPack, refDate: string): Paper {
  const cur = CURRENCY_PRINT[pack.currency];
  if (!cur) throw new Error(`No print format for currency ${pack.currency}: add it to CURRENCY_PRINT`);
  const dec = pack.formatAmount(0.5).includes(',') ? ',' : '.';
  const ctx: Ctx = { doc, L, pack, refDate, dec, cur };
  if (doc.groundTruth.docType === 'DELIVERY_NOTE') return deliveryNote(ctx);
  switch (doc.supplier.template) {
    case 'erp':
      return erp(ctx);
    case 'modern':
      return modern(ctx);
    default:
      return classic(ctx);
  }
}
