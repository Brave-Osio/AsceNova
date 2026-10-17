import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminUserActions } from '../hooks/useAdminUserActions';
import { adminUserDetailPath } from '../../../constants/routes';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';
import type { AccountStatus, AdminUserListItem } from '../../../types/admin.types';

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

type PendingAction = { kind: 'role'; user: AdminUserListItem } | { kind: 'suspend' | 'delete'; user: AdminUserListItem };

const label = (u: AdminUserListItem) => u.email;

export default function UserTable() {
  const { result, isLoading, search, setSearch, status, setStatus, page, setPage, pageSize } = useAdminUsers();
  const { suspendUser, reactivateUser, deleteUser, setAdminAccess, exportCsv, pendingUserId } = useAdminUserActions();
  const { user: currentUser } = useAuth();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const isGranting = pending?.kind === 'role' && pending.user.role !== 'ADMIN';

  async function confirmPending() {
    if (!pending) return;
    if (pending.kind === 'role') await setAdminAccess(pending.user.id, isGranting);
    else if (pending.kind === 'suspend') await suspendUser(pending.user.id);
    else await deleteUser(pending.user.id);
    setPending(null);
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  const dialog = (() => {
    if (!pending) return { title: '', description: null as React.ReactNode, confirmLabel: 'Confirm' };
    const who = <strong>{label(pending.user)}</strong>;
    if (pending.kind === 'suspend') {
      return { title: 'Suspend this account?', description: <>{who} will not be able to sign in until reactivated.</>, confirmLabel: 'Suspend' };
    }
    if (pending.kind === 'delete') {
      return {
        title: 'Delete this account?',
        description: <>{who} will be deactivated now and permanently erased after the retention period. This is recorded in the audit log.</>,
        confirmLabel: 'Delete',
      };
    }
    return isGranting
      ? { title: 'Grant administrator access?', description: <>{who} will be able to manage users and view platform analytics.</>, confirmLabel: 'Grant admin' }
      : { title: 'Revoke administrator access?', description: <>{who} will lose access to the admin area.</>, confirmLabel: 'Revoke admin' };
  })();

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <TextField label="Search" value={search} onChange={setSearch} placeholder="Username or ID…" />
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
      <p className="mt-3 text-xs text-brand-text-muted">
        Accounts are shown by username and system ID with aggregate activity only. Recovery emails, full names and health data are not available to administrators.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
              <th className="py-2 pr-4 font-semibold">Username</th>
              <th className="py-2 pr-4 font-semibold">User ID</th>
              <th className="py-2 pr-4 font-semibold">Status</th>
              <th className="py-2 pr-4 font-semibold">Role</th>
              <th className="py-2 pr-4 font-semibold">Check-ins</th>
              <th className="py-2 pr-4 font-semibold">Workouts</th>
              <th className="py-2 pr-4 font-semibold">XP / Rank</th>
              <th className="py-2 pr-4 font-semibold">Joined</th>
              <th className="py-2 pr-0 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-brand-text-muted">
                  Loading…
                </td>
              </tr>
            ) : !result || result.users.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-brand-text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              result.users.map((u) => (
                <tr key={u.id} className="workout-row border-b border-brand-border text-brand-text-secondary">
                  <td className="py-3 pr-4 font-medium text-brand-text">{u.email}</td>
                  <td className="py-3 pr-4">
                    <Link to={adminUserDetailPath(u.id)} className="font-mono text-xs font-medium text-brand-text hover:text-brand-primary-light" title={u.id}>
                      {u.id.slice(0, 12)}…
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`chip px-2 py-0.5 text-xs ${STATUS_BADGE[u.status]}`}>{u.status}</span>
                  </td>
                  <td className="py-3 pr-4">{u.role}</td>
                  <td className="py-3 pr-4">{u.checkIns}</td>
                  <td className="py-3 pr-4">{u.workoutsCompleted}</td>
                  <td className="py-3 pr-4">
                    {u.userProgress ? `${u.userProgress.totalXp} XP · ${u.userProgress.cachedRank}` : '-'}
                  </td>
                  <td className="py-3 pr-4 text-brand-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-0">
                    <div className="flex justify-end gap-2">
                      {u.id !== currentUser?.id && u.status === 'ACTIVE' && (
                        <Button size="sm" variant="ghost" disabled={pendingUserId === u.id} onClick={() => setPending({ kind: 'role', user: u })}>
                          {u.role === 'ADMIN' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          {u.role === 'ADMIN' ? 'Revoke admin' : 'Make admin'}
                        </Button>
                      )}
                      {u.status === 'SUSPENDED' ? (
                        <Button size="sm" variant="ghost" loading={pendingUserId === u.id} onClick={() => reactivateUser(u.id)}>
                          Reactivate
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" loading={pendingUserId === u.id} onClick={() => setPending({ kind: 'suspend', user: u })}>
                          Suspend
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" loading={pendingUserId === u.id} onClick={() => setPending({ kind: 'delete', user: u })}>
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
      <ConfirmDialog
        isOpen={pending !== null}
        title={dialog.title}
        description={dialog.description}
        confirmLabel={dialog.confirmLabel}
        isLoading={pending !== null && pendingUserId === pending.user.id}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
