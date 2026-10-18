import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useCoachClients } from '../hooks/useCoachClients';
import { coachClientPath } from '../../../constants/routes';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';

export default function ClientTable() {
  const { result, isLoading, isError, search, setSearch, page, setPage, pageSize } = useCoachClients();
  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return (
    <div className="card rounded-2xl p-5">
      <div className="w-64">
        <TextField label="Search" value={search} onChange={setSearch} placeholder="Username…" />
      </div>
      <p className="mt-3 text-xs text-brand-text-muted">
        You see progress and habit activity only — not weight, body measurements, notes, contact details or chats. Opening a client is recorded in the audit log.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
              <th className="py-2 pr-4 font-semibold">Username</th>
              <th className="py-2 pr-4 font-semibold">Rank</th>
              <th className="py-2 pr-4 font-semibold">XP</th>
              <th className="py-2 pr-4 font-semibold">Streak</th>
              <th className="py-2 pr-4 font-semibold">Last check-in</th>
              <th className="py-2 pr-0 font-semibold text-right">Dashboard</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-brand-text-muted">
                  Loading…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-red-400 light:text-red-700" role="alert">
                  Couldn&apos;t load your clients. Try again in a moment.
                </td>
              </tr>
            ) : !result || result.clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-brand-text-muted">
                  {search ? 'No clients match this search.' : 'No clients are assigned to you yet.'}
                </td>
              </tr>
            ) : (
              result.clients.map((c) => (
                <tr key={c.id} className="workout-row border-b border-brand-border text-brand-text-secondary">
                  <td className="py-3 pr-4 font-medium text-brand-text">
                    {c.username}
                    {c.role !== 'USER' && (
                      <span className="chip ml-2 bg-brand-primary/15 px-2 py-0.5 text-xs text-brand-primary-light">{c.role}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">{c.rank}</td>
                  <td className="py-3 pr-4">{c.totalXp}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1">
                      <Flame size={13} className="text-brand-accent-ink" /> {c.currentStreak}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-brand-text-muted">{c.lastLogDate ?? 'Never'}</td>
                  <td className="py-3 pr-0 text-right">
                    <Link to={coachClientPath(c.id)} className="text-sm font-semibold text-brand-primary-light hover:text-brand-text">
                      View
                    </Link>
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
            Page {page} of {totalPages} · {result.total} total
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
  );
}
