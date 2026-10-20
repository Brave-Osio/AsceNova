import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ShieldCheck, ShieldOff, UserCheck, UserMinus } from 'lucide-react';
import { useAdminUsers, type AdminUserListFilters } from '../hooks/useAdminUsers';
import { useAdminUserActions } from '../hooks/useAdminUserActions';
import { adminUserDetailPath } from '../../../constants/routes';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import Tooltip from '../../../components/ui/Tooltip';
import TablePagination from '../../../components/ui/TablePagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';
import type { AccountStatus, AdminUserListItem, UserRole } from '../../../types/admin.types';

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

const SECTIONS: { role: UserRole; title: string; description: string; empty: string }[] = [
  { role: 'ADMIN', title: 'Administrators', description: 'Can manage accounts and see platform analytics.', empty: 'No administrators found.' },
  {
    role: 'COACH',
    title: 'Coaches',
    description: 'Can view the progress dashboards of the clients assigned to them. Open a coach to manage their clients.',
    empty: 'No coaches found. Use "Make coach" on a user below.',
  },
  { role: 'USER', title: 'Users', description: 'Regular accounts.', empty: 'No users found.' },
];

/** Fixed widths (the username column takes the rest) so every section's columns line up with the others. */
const COLUMN_WIDTHS = ['', 'w-28', 'w-24', 'w-24', 'w-44', 'w-28', 'w-[25rem]'];

type PendingAction = { kind: 'role' | 'coach' | 'suspend'; user: AdminUserListItem };

const label = (u: AdminUserListItem) => u.email;

interface UserSectionProps {
  section: (typeof SECTIONS)[number];
  filters: AdminUserListFilters;
  currentUserId: string | undefined;
  pendingUserId: string | null;
  onReactivate: (userId: string) => void;
  onPending: (action: PendingAction) => void;
}

function UserSection({ section, filters, currentUserId, pendingUserId, onReactivate, onPending }: UserSectionProps) {
  const { result, isLoading, page, setPage, pageSize, setPageSize } = useAdminUsers(section.role, filters);
  const headingId = `user-section-${section.role.toLowerCase()}`;
  const hasFilters = !!filters.search || !!filters.status;

  return (
    <section aria-labelledby={headingId} className="card rounded-2xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={headingId} className="text-lg font-bold text-brand-text">
          {section.title}
          <span className="ml-2 text-sm font-semibold text-brand-text-muted">{result ? result.total : '…'}</span>
        </h2>
      </div>
      <p className="mt-1 text-xs text-brand-text-muted">{section.description}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[68rem] table-fixed text-left text-sm">
          <colgroup>
            {COLUMN_WIDTHS.map((width, i) => (
              <col key={i} className={width} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-brand-border text-xs uppercase tracking-wider text-brand-text-muted">
              <th className="py-2 pr-4 font-semibold">Username</th>
              <th className="py-2 pr-4 font-semibold">Status</th>
              <th className="py-2 pr-4 font-semibold">Check-ins</th>
              <th className="py-2 pr-4 font-semibold">Workouts</th>
              <th className="py-2 pr-4 font-semibold">XP / Rank</th>
              <th className="py-2 pr-4 font-semibold">Joined</th>
              <th className="py-2 pr-0 text-center font-semibold">Actions</th>
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
                  {hasFilters ? 'No accounts match these filters.' : section.empty}
                </td>
              </tr>
            ) : (
              result.users.map((u) => (
                <tr key={u.id} className="workout-row border-b border-brand-border text-brand-text-secondary">
                  <td className="py-3 pr-4 font-medium">
                    <Tooltip label={`${u.email} · User ID: ${u.id}`} side="bottom" className="block min-w-0">
                      <Link to={adminUserDetailPath(u.id)} className="block truncate text-brand-text hover:text-brand-primary-light hover:underline">
                        {u.email}
                      </Link>
                    </Tooltip>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`chip px-2 py-0.5 text-xs ${STATUS_BADGE[u.status]}`}>{u.status}</span>
                  </td>
                  <td className="py-3 pr-4">{u.checkIns}</td>
                  <td className="py-3 pr-4">{u.workoutsCompleted}</td>
                  <td className="py-3 pr-4">
                    {u.userProgress ? `${u.userProgress.totalXp} XP · ${u.userProgress.cachedRank}` : '-'}
                  </td>
                  <td className="py-3 pr-4 text-brand-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-0">
                    <div className="flex justify-center gap-2">
                      {u.id !== currentUserId && u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                        <Button size="sm" variant="ghost" disabled={pendingUserId === u.id} onClick={() => onPending({ kind: 'coach', user: u })}>
                          {u.role === 'COACH' ? <UserMinus size={14} /> : <UserCheck size={14} />}
                          {u.role === 'COACH' ? 'Revoke coach' : 'Make coach'}
                        </Button>
                      )}
                      {u.id !== currentUserId && u.status === 'ACTIVE' && (
                        <Button size="sm" variant="ghost" disabled={pendingUserId === u.id} onClick={() => onPending({ kind: 'role', user: u })}>
                          {u.role === 'ADMIN' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          {u.role === 'ADMIN' ? 'Revoke admin' : 'Make admin'}
                        </Button>
                      )}
                      {u.status === 'SUSPENDED' ? (
                        <Button size="sm" variant="ghost" loading={pendingUserId === u.id} onClick={() => onReactivate(u.id)}>
                          Reactivate
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" loading={pendingUserId === u.id} onClick={() => onPending({ kind: 'suspend', user: u })}>
                          Suspend
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result && result.total > 0 && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={result.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </section>
  );
}

export default function UserTable() {
  const { suspendUser, reactivateUser, setAdminAccess, setCoachAccess, exportCsv, pendingUserId } = useAdminUserActions();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AccountStatus | undefined>(undefined);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const isGranting = pending?.kind === 'role' && pending.user.role !== 'ADMIN';

  async function confirmPending() {
    if (!pending) return;
    if (pending.kind === 'role') await setAdminAccess(pending.user.id, isGranting);
    else if (pending.kind === 'coach') await setCoachAccess(pending.user.id, pending.user.role !== 'COACH');
    else await suspendUser(pending.user.id);
    setPending(null);
  }

  const dialog = (() => {
    if (!pending) return { title: '', description: null as React.ReactNode, confirmLabel: 'Confirm' };
    const who = <strong>{label(pending.user)}</strong>;
    if (pending.kind === 'suspend') {
      return { title: 'Suspend this account?', description: <>{who} will not be able to sign in until reactivated.</>, confirmLabel: 'Suspend' };
    }
    if (pending.kind === 'coach') {
      return pending.user.role === 'COACH'
        ? { title: 'Revoke coach role?', description: <>{who} will lose the coach tab and all of their client assignments.</>, confirmLabel: 'Revoke coach' }
        : { title: 'Make this user a coach?', description: <>{who} will be able to view the progress dashboards of the clients you assign to them. This is recorded in the audit log.</>, confirmLabel: 'Make coach' };
    }
    return isGranting
      ? { title: 'Grant administrator access?', description: <>{who} will be able to manage users and view platform analytics.</>, confirmLabel: 'Grant admin' }
      : { title: 'Revoke administrator access?', description: <>{who} will lose access to the admin area.</>, confirmLabel: 'Revoke admin' };
  })();

  return (
    <div className="space-y-4">
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
      </div>

      {SECTIONS.map((section) => (
        <UserSection
          key={section.role}
          section={section}
          filters={{ search, status }}
          currentUserId={currentUser?.id}
          pendingUserId={pendingUserId}
          onReactivate={reactivateUser}
          onPending={setPending}
        />
      ))}

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
