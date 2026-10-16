import { AlertTriangle } from 'lucide-react';
import { TERMS_SECTIONS, type TermsBlock } from '../../../constants/terms';

function Block({ block }: { block: TermsBlock }) {
  if (block.kind === 'p') {
    return <p className="leading-relaxed">{block.text}</p>;
  }

  const list = (
    <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed marker:text-brand-text-muted">
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );

  if (block.kind === 'gap') {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-300 light:text-amber-800">
          <AlertTriangle size={14} aria-hidden="true" /> {block.title}
        </p>
        {list}
      </div>
    );
  }

  return (
    <div>
      {block.title && <p className="text-sm font-semibold text-brand-text">{block.title}</p>}
      {list}
    </div>
  );
}

/** The full Terms body, shared by the /terms page and the register-form modal so they can never diverge. */
export default function TermsContent({ headingLevel = 'h2' }: { headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <div className="space-y-8 text-sm text-brand-text-secondary">
      {TERMS_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24 space-y-3">
          <Heading id={`${section.id}-heading`} className="text-base font-bold text-brand-text">
            {section.heading}
          </Heading>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
