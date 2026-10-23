'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/i18n';
import type { Highlight } from '@/lib/highlights';
import { cn } from '@/lib/utils';

/** A piece of printed text with its box, in fractions of its page (0–1), so it scales with the page. */
interface Token {
  text: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Box {
  n: number;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

const digits = (s: string) => s.replace(/\D/g, '');
const alnum = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const NUMBER = /\d[\d.,'\s  ]*\d|\d/g;

/** Where `h` is printed among the tokens: amounts by their digits, ids by letters and digits. */
export function findBoxes(h: Highlight, tokens: Token[]): Box[] {
  const out: Box[] = [];
  const want = h.kind === 'amount' ? digits(h.text) : alnum(h.text);
  for (const t of tokens) {
    const len = Math.max(t.text.length, 1);
    if (h.kind === 'amount') {
      for (const m of t.text.matchAll(NUMBER)) {
        if (digits(m[0]) !== want) continue;
        const start = m.index ?? 0;
        out.push({ n: h.n, page: t.page, x: t.x + (t.w * start) / len, y: t.y, w: (t.w * m[0].length) / len, h: t.h });
      }
    } else if (alnum(t.text).includes(want)) {
      const at = t.text.toUpperCase().indexOf(h.text.toUpperCase());
      out.push(at < 0 ? { n: h.n, page: t.page, x: t.x, y: t.y, w: t.w, h: t.h } : { n: h.n, page: t.page, x: t.x + (t.w * at) / len, y: t.y, w: (t.w * h.text.length) / len, h: t.h });
    }
  }
  return out;
}

/** OCR word pairs ("pagare 660,42") find the same figure as the single word: keep one box per spot. */
function dedupe(boxes: Box[]): Box[] {
  const overlap = (a: Box, b: Box) => {
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return a.page === b.page && w > 0 && h > 0 && (w * h) / Math.min(a.w * a.h, b.w * b.h) > 0.5;
  };
  return boxes.reduce<Box[]>((kept, b) => (kept.some((k) => overlap(k, b)) ? kept : [...kept, b]), []);
}

type State ={ phase: 'loading' | 'reading' } | { phase: 'done'; boxes: Box[]; missing: Highlight[] } | { phase: 'error'; message: string };

async function pdfTokens(src: string, canvases: HTMLDivElement): Promise<Token[]> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/api/vendor/pdf-worker';
  const pdf = await pdfjs.getDocument({ url: src }).promise;
  const tokens: Token[] = [];
  canvases.replaceChildren();
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.className = 'block h-auto w-full';
    canvas.dataset.page = String(p);
    canvases.appendChild(canvas);
    await page.render({ canvas, viewport }).promise;
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const tx = pdfjs.Util.transform(viewport.transform, item.transform);
      const height = Math.hypot(tx[2], tx[3]);
      tokens.push({ text: item.str, page: p, x: tx[4] / viewport.width, y: (tx[5] - height) / viewport.height, w: (item.width * viewport.scale) / viewport.width, h: height / viewport.height });
    }
  }
  return tokens;
}

async function imageTokens(img: HTMLImageElement): Promise<Token[]> {
  if (!img.complete) await new Promise((resolve) => img.addEventListener('load', resolve, { once: true }));
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    // A phone photo of a whole page can be ~700 px wide, so its digits are a few pixels tall and
    // Tesseract skips them: upscale to ~2000 px on the long side first. Boxes are fractions of the
    // canvas, so they still land on the displayed image.
    const scale = Math.min(4, Math.max(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight)));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    const W = canvas.width;
    const H = canvas.height;
    const tokens: Token[] = [];
    for (const block of data.blocks ?? [])
      for (const para of block.paragraphs)
        for (const line of para.lines) {
          const words = line.words;
          words.forEach((w, i) => {
            const box = (a: typeof w.bbox, b: typeof w.bbox, text: string): Token => ({ text, page: 1, x: a.x0 / W, y: Math.min(a.y0, b.y0) / H, w: (b.x1 - a.x0) / W, h: (Math.max(a.y1, b.y1) - Math.min(a.y0, b.y0)) / H });
            tokens.push(box(w.bbox, w.bbox, w.text));
            // "1 234,56" (thousands separated by a space) is two OCR words.
            const next = words[i + 1];
            if (next) tokens.push(box(w.bbox, next.bbox, `${w.text} ${next.text}`));
          });
        }
    return tokens;
  } finally {
    await worker.terminate();
  }
}

/**
 * The original document with the printed figures behind each error circled in red.
 * Positions come from the PDF's own text layer, or from OCR run in the browser for scans and
 * photos; a figure that cannot be found is listed instead of being guessed.
 */
export function DocumentViewer({ src, mediaType, highlights, alt }: { src: string; mediaType: string; highlights: Highlight[]; alt: string }) {
  const isPdf = mediaType === 'application/pdf';
  const { t } = useI18n();
  const pages = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<State>({ phase: 'loading' });
  const [pageCount, setPageCount] = useState(1);
  const key = JSON.stringify(highlights);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isPdf) {
          const tokens = await pdfTokens(src, pages.current!);
          if (cancelled) return;
          setPageCount(pages.current!.children.length);
          finish(tokens);
        } else {
          if (!highlights.length) return setState({ phase: 'done', boxes: [], missing: [] });
          setState({ phase: 'reading' });
          const tokens = await imageTokens(img.current!);
          if (!cancelled) finish(tokens);
        }
      } catch (e) {
        if (!cancelled) setState({ phase: 'error', message: e instanceof Error ? e.message : String(e) });
      }
    })();
    function finish(tokens: Token[]) {
      const boxes: Box[] = [];
      const missing: Highlight[] = [];
      for (const h of highlights) {
        const found = dedupe(findBoxes(h, tokens));
        if (found.length) boxes.push(...found);
        else missing.push(h);
      }
      setState({ phase: 'done', boxes, missing });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, isPdf, key]);

  const boxes = state.phase === 'done' ? state.boxes : [];
  const overlay = (page: number) =>
    boxes
      .filter((b) => b.page === page)
      .map((b, i) => (
        <span
          key={`${b.n}-${i}`}
          id={i === boxes.findIndex((x) => x.n === b.n) ? `marca-${b.n}` : undefined}
          title={highlights.find((h) => h.n === b.n)?.label}
          className="absolute scroll-mt-16 rounded-[2px] border-2 border-danger bg-danger/10"
          style={{ left: `${(b.x - 0.004) * 100}%`, top: `${(b.y - 0.004) * 100}%`, width: `${(b.w + 0.008) * 100}%`, height: `${(b.h + 0.008) * 100}%` }}
        >
          <span className="absolute -top-2.5 -left-2.5 grid size-[18px] place-items-center rounded-full bg-danger text-[10.5px] font-bold text-white">{b.n}</span>
        </span>
      ));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5">
      <div className="min-h-0 flex-1 overflow-auto rounded-sm border bg-sheet">
        {isPdf ? (
          <div className="relative">
            <div ref={pages} />
            {/* One overlay per page, stacked like the canvases (pages share a width; heights are proportional). */}
            <div className="pointer-events-none absolute inset-0 flex flex-col">
              {Array.from({ length: pageCount }, (_, p) => (
                <div key={p} className="relative flex-1">
                  {overlay(p + 1)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={img} src={src} alt={alt} className="block h-auto w-full" />
            <div className="pointer-events-none absolute inset-0">{overlay(1)}</div>
          </div>
        )}
      </div>
      {highlights.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
          {state.phase === 'loading' && (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> {t.viewer.loading}
            </>
          )}
          {state.phase === 'reading' && (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> {t.viewer.ocr}
            </>
          )}
          {state.phase === 'error' && <span className="text-danger">{t.viewer.failed(state.message)}</span>}
          {state.phase === 'done' && (
            <span>
              <span className={cn(state.missing.length === 0 && 'text-foreground')}>
                {t.viewer.marked(highlights.length - state.missing.length, highlights.length)}
              </span>
              {state.missing.length > 0 && t.viewer.missing(state.missing.map((m) => `${m.n} (${m.text})`).join(', '))}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

/** The number of a highlight next to the error it belongs to; jumps to the mark on the original. */
export function MarkRef({ n }: { n: number | undefined }) {
  const { t } = useI18n();
  if (n === undefined) return null;
  return (
    <a href={`#marca-${n}`} title={t.viewer.seeOriginal} className="grid size-[18px] shrink-0 place-items-center rounded-full bg-danger text-[10.5px] font-bold text-white no-underline hover:opacity-80">
      {n}
    </a>
  );
}
