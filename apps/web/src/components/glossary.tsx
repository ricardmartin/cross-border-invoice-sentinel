'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { useI18n } from '@/components/i18n';
import { GLOSSARY, GLOSSARY_CATEGORIES, glossaryById, type GlossaryTerm } from '@/lib/glossary';
import { cn } from '@/lib/utils';

export const GLOSSARY_COOKIE = 'glossary';

const GlossaryContext = createContext<{ on: boolean; setOn: (on: boolean) => void }>({ on: true, setOn: () => {} });

/** On/off for the hover layer, kept in a cookie so the server renders the toggle in the right state. */
export function GlossaryProvider({ initial, children }: { initial: boolean; children: ReactNode }) {
  const [on, setOn] = useState(initial);
  const set = (next: boolean) => {
    setOn(next);
    document.cookie = `${GLOSSARY_COOKIE}=${next ? 'on' : 'off'}; path=/; max-age=31536000; samesite=lax`;
  };
  return <GlossaryContext.Provider value={{ on, setOn: set }}>{children}</GlossaryContext.Provider>;
}

export function GlossaryToggle() {
  const { t } = useI18n();
  const { on, setOn } = useContext(GlossaryContext);
  const label = on ? t.glossary.toggleOn : t.glossary.toggleOff;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => setOn(!on)}
      className={cn('grid size-7 shrink-0 place-items-center rounded-sm', on ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
    >
      <BookOpen className="size-3.5" aria-hidden />
    </button>
  );
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALIAS_TO_ID = new Map(GLOSSARY.flatMap((g) => g.match.map((m) => [m.toLowerCase(), g.id] as const)));
/** Longest alias first, so "lectura dudosa" wins over "lectura"; whole words only (letters, digits and _ are word characters). */
const TERM_RE = new RegExp(
  `(?<![\\p{L}\\p{N}_])(?:${[...ALIAS_TO_ID.keys()].sort((a, b) => b.length - a.length).map(escape).join('|')})(?![\\p{L}\\p{N}_])`,
  'giu',
);
const SKIP = 'textarea, input, select, script, style, svg, [contenteditable], [data-no-glossary]';
const HOVER_MS = 350;
const LONG_PRESS_MS = 450;
const HIDE_MS = 200;

interface Hit {
  id: string;
  range: Range;
}

interface Shown {
  term: GlossaryTerm;
  anchor: DOMRect;
}

/** All glossary words inside `root`, as live ranges grouped by text node. Nothing in the DOM is touched. */
function scan(root: Element): Map<Text, Hit[]> {
  const hits = new Map<Text, Hit[]>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue?.trim() && !n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    for (const m of node.data.matchAll(TERM_RE)) {
      const id = ALIAS_TO_ID.get(m[0].toLowerCase());
      if (!id) continue;
      const range = document.createRange();
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const list = hits.get(node) ?? [];
      list.push({ id, range });
      hits.set(node, list);
    }
  }
  return hits;
}

/** The text node under a point, from whichever caret API the browser has. */
function textNodeAt(x: number, y: number): Node | null {
  const d = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  if (d.caretPositionFromPoint) return d.caretPositionFromPoint(x, y)?.offsetNode ?? null;
  return d.caretRangeFromPoint?.(x, y)?.startContainer ?? null;
}

const rectAt = (hit: Hit, x: number, y: number) => [...hit.range.getClientRects()].find((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);

const highlights = () => (typeof CSS !== 'undefined' && 'highlights' in CSS ? CSS.highlights : null);

/**
 * Hover glossary: underlines every known term in <main> (CSS Custom Highlight API, so React's DOM stays
 * untouched) and shows its card after resting the pointer on it, or after a long press on touch screens.
 */
export function GlossaryLayer() {
  const { on } = useContext(GlossaryContext);
  const [shown, setShown] = useState<Shown | null>(null);
  const hitsRef = useRef(new Map<Text, Hit[]>());
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = document.querySelector('main');
    const hl = highlights();
    if (!on || !main) {
      hitsRef.current = new Map();
      hl?.delete('glossary');
      setShown(null);
      return;
    }

    const rebuild = () => {
      hitsRef.current = scan(main);
      hl?.set('glossary', new Highlight(...[...hitsRef.current.values()].flat().map((h) => h.range)));
    };
    rebuild();
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(rebuild, 200);
    });
    observer.observe(main, { childList: true, subtree: true, characterData: true });

    const hitAt = (x: number, y: number) => {
      const node = textNodeAt(x, y);
      for (const hit of (node && hitsRef.current.get(node as Text)) || []) {
        const rect = rectAt(hit, x, y);
        if (rect) return { hit, rect };
      }
      return null;
    };

    let current: string | null = null;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    const show = (hit: Hit, rect: DOMRect) => {
      clearTimeout(hideTimer);
      current = hit.id;
      hl?.set('glossary-active', new Highlight(hit.range));
      setShown({ term: glossaryById.get(hit.id)!, anchor: rect });
    };
    const hide = () => {
      clearTimeout(showTimer);
      current = null;
      hl?.delete('glossary-active');
      setShown(null);
    };
    const overCard = (e: Event) => cardRef.current?.contains(e.target as Node) ?? false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (overCard(e)) {
          clearTimeout(hideTimer);
          return;
        }
        const found = hitAt(e.clientX, e.clientY);
        if (found && found.hit.id === current) {
          clearTimeout(hideTimer);
          return;
        }
        clearTimeout(showTimer);
        if (found) showTimer = setTimeout(() => show(found.hit, found.rect), HOVER_MS);
        if (current) {
          clearTimeout(hideTimer);
          hideTimer = setTimeout(hide, HIDE_MS);
        }
      });
    };

    let press: { x: number; y: number; timer: ReturnType<typeof setTimeout> } | null = null;
    let swallowClick = false;
    const onDown = (e: PointerEvent) => {
      if (overCard(e)) return;
      if (current) hide();
      if (e.pointerType !== 'touch') return;
      const found = hitAt(e.clientX, e.clientY);
      if (!found) return;
      press = {
        x: e.clientX,
        y: e.clientY,
        timer: setTimeout(() => {
          swallowClick = true;
          show(found.hit, found.rect);
        }, LONG_PRESS_MS),
      };
    };
    const endPress = () => {
      if (press) clearTimeout(press.timer);
      press = null;
    };
    const onTouchMove = (e: PointerEvent) => {
      if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) endPress();
    };
    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const onContextMenu = (e: MouseEvent) => {
      if (swallowClick || press) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hide();
    const onScroll = (e: Event) => !overCard(e) && current && hide();

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onTouchMove);
    document.addEventListener('pointerup', endPress);
    document.addEventListener('pointercancel', endPress);
    document.addEventListener('click', onClick, true);
    document.addEventListener('contextmenu', onContextMenu, true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', hide);
    return () => {
      observer.disconnect();
      clearTimeout(debounce);
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      cancelAnimationFrame(frame);
      endPress();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onTouchMove);
      document.removeEventListener('pointerup', endPress);
      document.removeEventListener('pointercancel', endPress);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('contextmenu', onContextMenu, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', hide);
      hl?.delete('glossary');
      hl?.delete('glossary-active');
    };
  }, [on]);

  // Below the word if it fits, else above; never off the sides of the screen.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!shown || !card) return;
    const { anchor } = shown;
    const gap = 6;
    const h = card.offsetHeight;
    const w = card.offsetWidth;
    const below = anchor.bottom + gap + h <= window.innerHeight - 8;
    card.style.top = `${Math.max(8, below ? anchor.bottom + gap : anchor.top - gap - h)}px`;
    card.style.left = `${Math.min(Math.max(8, anchor.left), window.innerWidth - w - 8)}px`;
    card.style.visibility = 'visible';
  }, [shown]);

  if (!shown) return null;
  return <GlossaryCard ref={cardRef} term={shown.term} />;
}

function GlossaryCard({ term, ref }: { term: GlossaryTerm; ref: Ref<HTMLDivElement> }) {
  const { t } = useI18n();
  return (
    <div
      ref={ref}
      role="tooltip"
      style={{ visibility: 'hidden' }}
      className="fixed top-0 left-0 z-50 w-[min(360px,calc(100vw-16px))] rounded-sm border border-foreground bg-sheet px-3 py-2.5 text-[13px] leading-relaxed"
    >
      <p className="flex items-baseline justify-between gap-3">
        <span lang="es" className="text-[14px] font-bold">{term.term}</span>
        <span className="shrink-0 text-[10.5px] font-bold tracking-[0.06em] text-muted-foreground uppercase">{GLOSSARY_CATEGORIES[term.category]}</span>
      </p>
      <p className="text-xs text-muted-foreground" lang="en">
        <span className="mr-1 font-mono text-[11px] font-semibold">EN</span>
        {term.en}
      </p>
      <p lang="es" className="mt-1.5">{term.def}</p>
      {term.here && (
        <p className="mt-1.5 border-t border-rule pt-1.5 text-muted-foreground">
          <span className="font-semibold text-foreground">{t.glossary.here}</span> <span lang="es">{term.here}</span>
        </p>
      )}
      <Link href={`/glosario#${term.id}`} className="mt-1.5 inline-block text-xs font-semibold underline">
        {t.glossary.seeAll}
      </Link>
    </div>
  );
}
