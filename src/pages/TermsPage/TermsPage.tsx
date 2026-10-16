import PageHeader from '../../components/ui/PageHeader';
import PageContainer from '../../components/layout/PageContainer';
import TermsContent from '../../features/auth/components/TermsContent';
import { TERMS_LAST_UPDATED, TERMS_SECTIONS, TERMS_SUBTITLE, TERMS_TITLE } from '../../constants/terms';

export default function TermsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Legal"
        title={TERMS_TITLE}
        description={
          <>
            {TERMS_SUBTITLE}. <span className="text-brand-text-muted">Last updated {TERMS_LAST_UPDATED}.</span>
          </>
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Terms sections" className="hidden lg:block">
          <ul className="sticky top-8 space-y-1 text-sm">
            {TERMS_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-1.5 text-brand-text-secondary transition-colors hover:bg-brand-card-alt hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="card max-w-3xl rounded-2xl p-5 sm:p-8">
          <TermsContent />
        </article>
      </div>
    </PageContainer>
  );
}
