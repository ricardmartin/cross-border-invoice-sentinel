import type { Browser } from 'playwright';
import type { RenderVariant } from './types';
import type { Paper } from './es/templates';

/**
 * Wraps a template's paper in a page that simulates how it reached us:
 * a clean PDF, a flatbed scan (slight skew, grain) or a phone photo (table
 * background, stronger rotation, shadow, optional low resolution), plus a
 * rubber stamp and a handwritten note when the variant asks for them.
 */
function pageHtml(paper: Paper, v: RenderVariant): string {
  const photo = v.mode === 'photo';
  const stampPos = paper.compact ? 'right:14px;bottom:14px' : 'left:56px;bottom:90px';
  const notePos = paper.compact ? 'left:16px;bottom:22px' : 'top:10px;right:28px';
  const overlays = [
    v.stamp
      ? `<div style="position:absolute;${stampPos};transform:rotate(-13deg);border:3px solid #b3261e;color:#b3261e;
         padding:6px 18px;font:800 26px Arial;letter-spacing:3px;opacity:.72;border-radius:6px">${v.stamp}</div>`
      : '',
    v.handwrittenNote
      ? `<div style="position:absolute;${notePos};transform:rotate(-4deg);color:#1f3a93;
         font:22px 'Segoe Print','Segoe Script','Bradley Hand','Comic Sans MS',cursive">${v.handwrittenNote}</div>`
      : '',
    v.noise
      ? `<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:${photo ? 0.13 : 0.09};pointer-events:none">
         <filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/></filter>
         <rect width="100%" height="100%" filter="url(#n)"/></svg>`
      : '',
  ].join('');

  const paperStyle = [
    'position:relative',
    'background:#fff',
    `width:${paper.width}`,
    paper.compact && (v.stamp || v.handwrittenNote) ? 'padding-bottom:78px' : '',
    v.rotation ? `transform:rotate(${v.rotation}deg)` : '',
    photo ? 'box-shadow:0 18px 40px rgba(0,0,0,.45)' : '',
    v.mode === 'scan' ? 'filter:grayscale(1) contrast(1.15) brightness(1.03)' : '',
    photo ? 'filter:sepia(.12) brightness(.96) contrast(1.05)' : '',
  ]
    .filter(Boolean)
    .join(';');

  const bodyStyle =
    v.mode === 'pdf'
      ? 'margin:0'
      : photo
        ? 'margin:0;padding:60px;background:radial-gradient(circle at 30% 20%,#8a6d55,#4a3628);display:inline-block'
        : 'margin:0;padding:24px;background:#f4f4f2;display:inline-block';

  return `<!doctype html><html><head><meta charset="utf-8"><style>${paper.css}</style></head>
  <body style="${bodyStyle}"><div id="doc" style="${paperStyle}"><div class="paper">${paper.html}</div>${overlays}</div></body></html>`;
}

export async function renderDocument(browser: Browser, paper: Paper, variant: RenderVariant): Promise<{ data: Buffer; ext: 'pdf' | 'jpg' }> {
  const page = await browser.newPage({ deviceScaleFactor: variant.lowRes ? 0.75 : 1.25 });
  try {
    await page.setContent(pageHtml(paper, variant), { waitUntil: 'load' });
    if (variant.mode === 'pdf') {
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      // Pin the embedded timestamps (same byte length, xref offsets intact) so renders are reproducible.
      return { data: Buffer.from(pdf.toString('latin1').replace(/D:\d{14}/g, 'D:20260101000000'), 'latin1'), ext: 'pdf' };
    }
    const body = page.locator('body');
    const data = await body.screenshot({ type: 'jpeg', quality: variant.lowRes ? 55 : 80 });
    return { data, ext: 'jpg' };
  } finally {
    await page.close();
  }
}
