import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminUsers } from '../../../services/adminService';
import { adminUserDetailPath } from '../../../constants/routes';
import { queryKeys } from '../../../lib/queryKeys';
import { useAdminCoachClients, useCoachAssignmentActions, useCoaches } from '../hooks/useCoachAssignments';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import type { AdminUserDetail } from '../../../types/admin.types';

const SELECT_CLASS =
  'rounded-xl border border-brand-border bg-brand-card px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/60';

/** A regular user's coach: pick one (or remove). One coach per client. */
function ClientCoachPicker({ userId, coachId }: { userId: string; coachId: string | null }) {
  const { coaches, isLoading } = useCoaches();
  const { assign, unassign, isPending } = useCoachAssignmentActions();
  const [selected, setSelected] = useState('');
  const current = coaches.find((c) => c.id === coachId);

  return (
    <>
      <p className="mt-2 text-sm text-brand-text-secondary">
        Coach:{' '}
        {coachId ? (
          <Link to={adminUserDetailPath(coachId)} className="font-semibold text-brand-text hover:text-brand-primary-light">
            {current?.email ?? coachId}
          </Link>
        ) : (
          <span className="font-semibold text-brand-text">None</span>
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">{coachId ? 'Move to coach' : 'Assign to coach'}</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} disabled={isLoading} className={SELECT_CLASS}>
            <option value="" className="bg-brand-surface">
              {coaches.length === 0 && !isLoading ? 'No coaches yet' : 'Select a coach…'}
            </option>
            {coaches
              .filter((c) => c.id !== coachId)
              .map((c) => (
                <option key={c.id} value={c.id} className="bg-brand-surface">
                  {c.email} ({c.clientCount} clients)
                </option>
              ))}
          </select>
        </label>
        <Button size="sm" disabled={!selected} loading={isPending} onClick={() => assign(selected, userId).then(() => setSelected(''))}>
          {coachId ? 'Move' : 'Assign'}
        </Button>
        {coachId && (
          <Button size="sm" variant="ghost" loading={isPending} onClick={() => unassign(coachId, userId)}>
            Remove coach
          </Button>
        )}
      </div>
    </>
  );
}

/** A coach's clients: list with unassign, plus a username search to add regular users. */
function CoachClients({ coachId }: { coachId: string }) {
  const { clients, isLoading } = useAdminCoachClients(coachId);
  const { assign, unassign, isPending } = useCoachAssignmentActions();
  const [search, setSearch] = useState('');
  const term = search.trim();

  const { data: matches } = useQuery({
    queryKey: queryKeys.admin.users({ search: term, picker: true }),
    queryFn: () => listAdminUsers({ search: term, status: 'ACTIVE', page: 1, pageSize: 8 }),
    enabled: term.length >= 1,
  });
  const clientIds = new Set(clients.map((c) => c.id));
  const candidates = (matches?.users ?? []).filter((u) => u.role === 'USER' && !clientIds.has(u.id));

  return (
    <>
      <ul className="mt-2 divide-y divide-brand-border">
        {isLoading ? (
          <li className="py-2 text-sm text-brand-text-muted">Loading…</li>
        ) : clients.length === 0 ? (
          <li className="py-2 text-sm text-brand-text-muted">No clients assigned.</li>
        ) : (
          clients.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <Link to={adminUserDetailPath(c.id)} className="font-medium text-brand-text hover:text-brand-primary-light">
                {c.email}
              </Link>
              <Button size="sm" variant="ghost" disabled={isPending} onClick={() => unassign(coachId, c.id)}>
                Unassign
              </Button>
            </li>
          ))
        )}
      </ul>

      <div className="mt-4 w-64">
        <TextField label="Add a client" value={search} onChange={setSearch} placeholder="Search username…" />
      </div>
      {term.length >= 1 && (
        <ul className="mt-2 divide-y divide-brand-border">
          {candidates.length === 0 ? (
            <li className="py-2 text-sm text-brand-text-muted">No matching regular users.</li>
          ) : (
            candidates.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-brand-text">{u.email}</span>
                <Button size="sm" variant="secondary" disabled={isPending} onClick={() => assign(coachId, u.id)}>
                  Assign
                </Button>
              </li>
            ))
          )}
        </ul>
      )}
    </>
  );
}

export default function CoachAssignmentPanel({ detail }: { detail: AdminUserDetail }) {
  const { user, coachId } = detail;
  if (user.role === 'ADMIN') return null;

  return (
    <div className="card mt-4 rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">
        {user.role === 'COACH' ? `Clients (${detail.clientCount ?? 0})` : 'Coaching'}
      </div>
      {user.role === 'COACH' ? <CoachClients coachId={user.id} /> : <ClientCoachPicker userId={user.id} coachId={coachId} />}
    </div>
  );
}
