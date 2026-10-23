import { GlossaryList } from '@/components/glossary-list';
import { getI18n } from '@/lib/i18n/server';

/** The study glossary: every term the hover cards explain, on one page. */
export default async function GlossaryPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.glossary.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.glossary.lead}</p>
      </header>
      <GlossaryList />
    </div>
  );
}
