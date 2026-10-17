import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuditLogs } from '../../features/admin/hooks/useAuditLogs';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';
import type { AuditAction, AuditEvent, AuditOutcome } from '../../types/admin.types';

const ACTION_LABEL: Record<AuditAction, string> = {
  ADMIN_LOGIN: 'Admin sign-in',
  ADMIN_LOGOUT: 'Admin sign-out',
  USER_SUSPEND: 'User suspended',
  USER_REACTIVATE: 'User reactivated',
  USER_GRANT_ADMIN: 'Admin role granted',
  USER_REVOKE_ADMIN: 'Admin role revoked',
  USER_DELETE: 'User deleted',
  ACHIEVEMENT_UPDATE: 'Achievement edited',
  USER_EXPORT: 'User export',
};

const OUTCOME_BADGE: Record<AuditOutcome, string> = {
  SUCCESS: 'bg-emerald-500/15 text-emerald-300 light:text-emerald-700',
  FAILURE: 'bg-red-500/15 text-red-300 light:text-red-700',
};

const SELECT_CLASS =
  'w-full rounded-xl border border-brand-border bg-brand-card px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/60';

/** Shown in the viewer's locale, with the UTC instant available on hover/in the detail view. */
function formatLocal(iso: string): string {
  return new Date(iso).toLocaleString();
}

function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}

function person(username: string | null, id: string): string {
  return username ?? `${shortId(id)} (deleted account)`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-brand-border py-2.5 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">{label}</dt>
      <dd className="mt-0.5 break-all text-sm text-brand-text">{value}</dd>
    </div>
  );
}

function EventDetail({ event, onClose }: { event: AuditEvent; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-detail-title"
        className="card relative h-full w-full max-w-md overflow-y-auto rounded-none p-6 shadow-xl sm:rounded-l-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="audit-detail-title" className="text-base font-bold text-brand-text">
              {ACTION_LABEL[event.action] ?? event.action}
            </h2>
            <span className={`chip mt-2 inline-block px-2 py-0.5 text-xs ${OUTCOME_BADGE[event.outcome]}`}>{event.outcome}</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-1.5 text-brand-text-muted hover:bg-brand-card-alt hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-sm text-brand-text-secondary">{event.description}</p>

        <dl className="mt-4">
          <DetailRow label="Time (UTC)" value={event.createdAt} />
          <DetailRow label="Time (local)" value={formatLocal(event.createdAt)} />
          <DetailRow label="Event ID" value={event.id} />
          <DetailRow label="Administrator" value={event.actorUsername ?? '(deleted account)'} />
          <DetailRow label="Administrator ID" value={event.actorId} />
          <DetailRow label="Action" value={event.action} />
          <DetailRow label="Target type" value={event.targetType ?? '—'} />
          {event.targetType === 'USER' && <DetailRow label="Target user" value={event.targetUsername ?? '(deleted account)'} />}
          <DetailRow label="Target ID" value={event.targetId ?? '—'} />
          <DetailRow label="Request ID" value={event.requestId ?? '—'} />
        </dl>

        <p className="mt-4 text-xs text-brand-text-muted">
          Audit records are append-only and never include passwords, tokens or request contents.
        </p>
      </aside>
    </div>
  );
}

export default function AdminAuditLogsPage() {
  const {
    result,
    isLoading,
    isError,
    isFetching,
    refetch,
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    rangeIsInvalid,
    page,
    setPage,
    pageSize,
  } = useAuditLogs();
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return (
    <PageContainer>
      <Link to={ROUTES.admin} className="mb-4 flex items-center gap-1 text-xs text-brand-text-muted hover:text-brand-text-secondary">
        <ArrowLeft size={12} /> Back to Admin
      </Link>
      <PageHeader
        eyebrow="Admin"
        title="Audit logs"
        description="A tamper-resistant record of administrative actions, newest first. Events cannot be edited or deleted."
      />

      <div className="card mt-8 rounded-2xl p-5">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
          aria-label="Audit log filters"
        >
          <TextField
            label="Administrator"
            value={filters.actor}
            onChange={(v) => setFilters({ actor: v })}
            placeholder="Username or ID…"
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">Action</span>
            <select
              className={SELECT_CLASS}
              value={filters.action}
              onChange={(e) => setFilters({ action: e.target.value as AuditAction | '' })}
            >
              <option value="">All actions</option>
              {(Object.keys(ACTION_LABEL) as AuditAction[]).map((a) => (
                <option key={a} value={a} className="bg-brand-surface">
                  {ACTION_LABEL[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">Outcome</span>
            <select
              className={SELECT_CLASS}
              value={filters.outcome}
              onChange={(e) => setFilters({ outcome: e.target.value as AuditOutcome | '' })}
            >
              <option value="">All outcomes</option>
              <option value="SUCCESS" className="bg-brand-surface">
                Success
              </option>
              <option value="FAILURE" className="bg-brand-surface">
                Failure
              </option>
            </select>
          </label>
          <TextField label="From" type="date" value={filters.fromDay} onChange={(v) => setFilters({ fromDay: v })} />
          <TextField
            label="To"
            type="date"
            value={filters.toDay}
            onChange={(v) => setFilters({ toDay: v })}
            error={rangeIsInvalid ? '“To” must be on or after “From”' : undefined}
          />
        </form>
        {hasActiveFilters && (
          <div className="mt-3">
            <Button size="sm" variant="ghost" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        )}

        <div className="mt-5 overflow-x-auto" aria-busy={isLoading || isFetching}>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Administrative audit events, newest first</caption>
            <thead>
              <tr className="border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
                <th scope="col" className="py-2 pr-4 font-semibold">Time</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Action</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Administrator</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Target</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Outcome</th>
                <th scope="col" className="py-2 pr-0 text-right font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-brand-text-muted" role="status">
                    Loading audit events…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <p className="text-sm text-red-400 light:text-red-700" role="alert">
                      Couldn't load audit events.
                    </p>
                    <div className="mt-3">
                      <Button size="sm" variant="secondary" onClick={() => refetch()}>
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : !result || result.events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-brand-text-muted">
                    {hasActiveFilters ? 'No events match these filters.' : 'No administrative events have been recorded yet.'}
                  </td>
                </tr>
              ) : (
                result.events.map((event) => (
                  <tr key={event.id} className="workout-row border-b border-brand-border text-brand-text-secondary">
                    <td className="whitespace-nowrap py-3 pr-4" title={event.createdAt}>
                      {formatLocal(event.createdAt)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-brand-text">{ACTION_LABEL[event.action] ?? event.action}</td>
                    <td className="py-3 pr-4" title={event.actorId}>
                      {person(event.actorUsername, event.actorId)}
                    </td>
                    <td className="py-3 pr-4" title={event.targetId ?? undefined}>
                      {event.targetType === 'USER' && event.targetId
                        ? person(event.targetUsername, event.targetId)
                        : (event.targetType ?? '—')}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`chip px-2 py-0.5 text-xs ${OUTCOME_BADGE[event.outcome]}`}>{event.outcome}</span>
                    </td>
                    <td className="py-3 pr-0 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(event)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {result && result.total > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-brand-text-muted">
            <span>
              Page {page} of {totalPages} · {result.total} event{result.total === 1 ? '' : 's'}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={14} /> Prev
              </Button>
              <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selected && <EventDetail event={selected} onClose={() => setSelected(null)} />}
    </PageContainer>
  );
}
