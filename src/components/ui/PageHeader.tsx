import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageEnter } from '../../lib/motion';

interface PageHeaderProps {
  /** Small muted label above the title (the section this page belongs to). */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional right-aligned actions. */
  actions?: ReactNode;
}

/**
 * Single page-header treatment shared by every authenticated page, so title
 * size, muted eyebrow, description color and spacing never drift per page.
 */
export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={pageEnter}
      className="flex flex-wrap items-start justify-between gap-4"
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-brand-text-muted/80">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">{title}</h1>
        {description && (
          <div className="mt-2 max-w-prose text-sm leading-relaxed text-brand-text-secondary sm:text-base">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </motion.header>
  );
}
