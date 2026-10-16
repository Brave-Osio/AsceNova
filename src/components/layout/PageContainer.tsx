import type { ReactNode } from 'react';

/**
 * The one content container for authenticated pages (the Dashboard's width is
 * the reference): same max width, gutters and vertical padding everywhere, so
 * headings, cards and grids line up from page to page. It is a plain
 * `w-full max-w-6xl` block inside `<main class="min-w-0 flex-1">`, so it grows
 * and shrinks with the sidebar automatically (no per-page width math).
 * Pages place their own responsive grids inside it.
 */
export default function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 ${className}`}>{children}</section>;
}
