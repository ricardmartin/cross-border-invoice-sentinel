'use client';

import { useState } from 'react';
import { SectionHead } from '@/components/audit';
import { useI18n } from '@/components/i18n';
import { Input } from '@/components/ui/input';
import { GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryCategory } from '@/lib/glossary';

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Every term by category, with a filter and a review mode that hides the definitions until clicked. */
export function GlossaryList() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [quiz, setQuiz] = useState(false);
  const q = fold(query.trim());
  const terms = q ? GLOSSARY.filter((g) => fold([g.term, g.en, ...g.match].join(' ')).includes(q)) : GLOSSARY;
  const categories = Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[];

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.glossary.search} aria-label={t.glossary.search} className="w-64 max-w-full" />
        <label className="flex items-center gap-1.5 text-[13px]">
          <input type="checkbox" checked={quiz} onChange={(e) => setQuiz(e.target.checked)} />
          {t.glossary.quiz}
        </label>
        <span className="text-xs text-muted-foreground">{t.glossary.count(terms.length)}</span>
      </div>
      {terms.length === 0 && <p className="text-muted-foreground">{t.glossary.none}</p>}
      {categories.map((c) => {
        const list = terms.filter((g) => g.category === c);
        if (!list.length) return null;
        return (
          <section key={c} aria-labelledby={`cat-${c}`}>
            <SectionHead id={`cat-${c}`}>{GLOSSARY_CATEGORIES[c]}</SectionHead>
            <dl lang="es" className="border-t border-rule">
              {list.map((g) => (
                <div key={g.id} id={g.id} className="scroll-mt-16 border-b border-rule py-2.5 target:bg-hover">
                  <dt data-no-glossary className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[14px] font-bold">{g.term}</span>
                    <span lang="en" className="text-xs text-muted-foreground">
                      <span className="mr-1 font-mono text-[11px] font-semibold">EN</span>
                      {g.en}
                    </span>
                  </dt>
                  {quiz ? (
                    <dd>
                      <details className="mt-0.5">
                        <summary className="text-xs font-semibold text-muted-foreground underline">{t.glossary.reveal}</summary>
                        <Definition def={g.def} here={g.here} />
                      </details>
                    </dd>
                  ) : (
                    <dd>
                      <Definition def={g.def} here={g.here} />
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </>
  );
}

function Definition({ def, here }: { def: string; here?: string }) {
  const { t } = useI18n();
  return (
    <>
      <p className="mt-0.5 max-w-prose text-[13.5px] leading-relaxed">{def}</p>
      {here && (
        <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">{t.glossary.here}</span> {here}
        </p>
      )}
    </>
  );
}
