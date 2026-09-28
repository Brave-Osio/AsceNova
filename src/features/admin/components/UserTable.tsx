import { Link } from 'react-router-dom';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminUserActions } from '../hooks/useAdminUserActions';
import { adminUserDetailPath } from '../../../constants/routes';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import type { AccountStatus } from '../../../types/admin.types';

const STATUS_OPTIONS: { label: string; value: AccountStatus | undefined }[] = [
  { label: 'All statuses', value: undefined },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

const STATUS_BADGE: Record<AccountStatus, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-300 light:text-emerald-700',
  SUSPENDED: 'bg-amber-500/15 text-amber-300 light:text-amber-700',
  DELETED: 'bg-red-500/15 text-red-300 light:text-red-700',
};

export default function UserTable() {
  const { result, isLoading, search, setSearch, status, setStatus, page, setPage, pageSize } = useAdminUsers();
  const { suspendUser, reactivateUser, deleteUser, exportCsv, pendingUserId } = useAdminUserActions();

  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <TextField label="Search" value={search} onChange={setSearch} placeholder="Email or name…" />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">Status</span>
            <select
              value={status ?? ''}
              onChange={(e) => setStatus((e.target.value || undefined) as AccountStatus | undefined)}
              className="rounded-xl border border-brand-border bg-brand-card px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ''} className="bg-brand-surface">
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
              <th className="py-2 pr-4 font-semibold">Name</th>
              <th className="py-2 pr-4 font-semibold">Email</th>
              <th className="py-2 pr-4 font-semibold">Status</th>
              <th className="py-2 pr-4 font-semibold">Role</th>
              <th className="py-2 pr-4 font-semibold">XP / Rank</th>
              <th className="py-2 pr-4 font-semibold">Joined</th>
              <th className="py-2 pr-0 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-brand-text-muted">
                  Loading…
                </td>
              </tr>
            ) : !result || result.users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-brand-text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              result.users.map((u) => (
                <tr key={u.id} className="workout-row border-b border-brand-border text-brand-text-secondary">
                  <td className="py-3 pr-4">
                    <Link to={adminUserDetailPath(u.id)} className="font-medium text-brand-text hover:text-brand-primary-light">
                      {u.profile?.fullName ?? '—'}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-brand-text-secondary">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`chip px-2 py-0.5 text-xs ${STATUS_BADGE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{u.role}</td>
                  <td className="py-3 pr-4">
                    {u.userProgress ? `${u.userProgress.totalXp} XP · ${u.userProgress.cachedRank}` : '—'}
                  </td>
                  <td className="py-3 pr-4 text-brand-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-0">
                    <div className="flex justify-end gap-2">
                      {u.status === 'SUSPENDED' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={pendingUserId === u.id}
                          onClick={() => reactivateUser(u.id)}
                        >
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={pendingUserId === u.id}
                          onClick={() => {
                            if (window.confirm(`Suspend ${u.email}? They won't be able to log in.`)) {
                              suspendUser(u.id);
                            }
                          }}
                        >
                          Suspend
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={pendingUserId === u.id}
                        onClick={() => {
                          if (window.confirm(`Delete ${u.email}? This can't be undone from this panel.`)) {
                            deleteUser(u.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
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
