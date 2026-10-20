import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import { PAGE_SIZE_OPTIONS } from '../../constants/pagination';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  noun?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/** Shared footer for paged tables: row count, an editable rows-per-page selector, and prev/next. */
export default function TablePagination({ page, pageSize, total, noun = 'total', onPageChange, onPageSizeChange }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-text-muted">
      <span aria-live="polite">
        Page {page} of {totalPages} · {total} {noun}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-brand-border bg-brand-card px-2 py-1.5 text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size} className="bg-brand-surface">
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={14} /> Prev
          </Button>
          <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
