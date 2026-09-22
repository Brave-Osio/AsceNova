import { Link } from 'react-router-dom';
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
  ACTIVE: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  SUSPENDED: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  DELETED: 'bg-red-500/10 text-red-300 border-red-500/30',
};

export default function UserTable() {
  const { result, isLoading, search, setSearch, status, setStatus, page, setPage, pageSize } = useAdminUsers();
  const { suspendUser, reactivateUser, deleteUser, exportCsv, pendingUserId } = useAdminUserActions();

  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <TextField label="Search" value={search} onChange={setSearch} placeholder="Email or name…" />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-300">Status</span>
            <select
              value={status ?? ''}
              onChange={(e) => setStatus((e.target.value || undefined) as AccountStatus | undefined)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ''} className="bg-gray-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          ⬇ Export CSV
        </Button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-xs uppercase tracking-wider text-gray-500">
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
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : !result || result.users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              result.users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 text-gray-300">
                  <td className="py-3 pr-4">
                    <Link to={adminUserDetailPath(u.id)} className="font-medium text-white hover:text-violet-300">
                      {u.profile?.fullName ?? '—'}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{u.role}</td>
                  <td className="py-3 pr-4">
                    {u.userProgress ? `${u.userProgress.totalXp} XP · ${u.userProgress.cachedRank}` : '—'}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
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
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {page} of {totalPages} · {result.total} total
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ← Prev
            </Button>
            <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
