import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminUserDetail } from '../../features/admin/hooks/useAdminUserDetail';
import { useAdminUserActions } from '../../features/admin/hooks/useAdminUserActions';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageContainer from '../../components/layout/PageContainer';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-border py-2 text-sm last:border-0">
      <span className="text-brand-text-muted">{label}</span>
      <span className="font-semibold text-brand-text">{value}</span>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { detail, isLoading } = useAdminUserDetail(userId ?? '');
  const { suspendUser, reactivateUser, deleteUser, pendingUserId } = useAdminUserActions();
  const [pending, setPending] = useState<'suspend' | 'delete' | null>(null);

  if (isLoading || !detail) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-brand-text-muted">
        Loading…
      </section>
    );
  }

  const { user, checkIns, workoutPlans, workoutsCompleted } = detail;
  const isPending = pendingUserId === user.id;

  async function confirmPending() {
    if (pending === 'suspend') await suspendUser(user.id);
    else if (pending === 'delete') await deleteUser(user.id);
    setPending(null);
  }

  return (
    <PageContainer>
      <Link to={ROUTES.admin} className="flex items-center gap-1 text-xs text-brand-text-muted hover:text-brand-text-secondary">
        <ArrowLeft size={12} /> Back to Admin
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-brand-text">{user.email}</h1>
          <p className="mt-1 break-all font-mono text-xs text-brand-text-muted">{user.id}</p>
        </div>
        <div className="flex gap-2">
          {user.status === 'SUSPENDED' ? (
            <Button size="sm" variant="secondary" loading={isPending} onClick={() => reactivateUser(user.id)}>
              Reactivate
            </Button>
          ) : (
            <Button size="sm" variant="secondary" loading={isPending} onClick={() => setPending('suspend')}>
              Suspend
            </Button>
          )}
          <Button size="sm" variant="ghost" loading={isPending} onClick={() => setPending('delete')}>
            Delete
          </Button>
        </div>
      </div>

      <p className="mt-3 text-xs text-brand-text-muted">
        Administrators see the username, account status and aggregate activity only — not recovery emails, names, health details or coach conversations.
      </p>

      <div className="card mt-6 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Account</div>
        <div className="mt-2">
          <Row label="Status" value={user.status} />
          <Row label="Role" value={user.role} />
          <Row label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>
      </div>

      {user.userProgress && (
        <div className="card mt-4 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Progress</div>
          <div className="mt-2">
            <Row label="Total XP" value={String(user.userProgress.totalXp)} />
            <Row label="Rank" value={user.userProgress.cachedRank} />
            <Row label="Current Streak" value={`${user.userProgress.currentStreak} days`} />
            <Row label="Longest Streak" value={`${user.userProgress.longestStreak} days`} />
          </div>
        </div>
      )}

      <div className="card mt-4 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Activity</div>
        <div className="mt-2">
          <Row label="Daily check-ins" value={String(checkIns)} />
          <Row label="Workouts completed" value={String(workoutsCompleted)} />
          <Row label="Workout plans generated" value={String(workoutPlans)} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={pending !== null}
        title={pending === 'delete' ? 'Delete this account?' : 'Suspend this account?'}
        description={
          pending === 'delete'
            ? 'The account is deactivated now and permanently erased after the retention period. This is recorded in the audit log.'
            : 'The user will not be able to sign in until reactivated. This is recorded in the audit log.'
        }
        confirmLabel={pending === 'delete' ? 'Delete' : 'Suspend'}
        isLoading={isPending}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </PageContainer>
  );
}
