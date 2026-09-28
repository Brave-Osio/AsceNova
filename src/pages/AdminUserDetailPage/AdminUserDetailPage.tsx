import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminUserDetail } from '../../features/admin/hooks/useAdminUserDetail';
import { useAdminUserActions } from '../../features/admin/hooks/useAdminUserActions';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';

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

  if (isLoading || !detail) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-brand-text-muted">
        Loading…
      </section>
    );
  }

  const { user, dailyProgressCount, chatMessageCount } = detail;
  const isPending = pendingUserId === user.id;

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Link to={ROUTES.admin} className="flex items-center gap-1 text-xs text-brand-text-muted hover:text-brand-text-secondary">
        <ArrowLeft size={12} /> Back to Admin
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text">{user.profile?.fullName ?? user.email}</h1>
          <p className="mt-1 text-sm text-brand-text-muted">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.status === 'SUSPENDED' ? (
            <Button size="sm" variant="secondary" loading={isPending} onClick={() => reactivateUser(user.id)}>
              Reactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              loading={isPending}
              onClick={() => {
                if (window.confirm(`Suspend ${user.email}?`)) suspendUser(user.id);
              }}
            >
              Suspend
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            loading={isPending}
            onClick={() => {
              if (window.confirm(`Delete ${user.email}? This can't be undone from this panel.`)) deleteUser(user.id);
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="card mt-6 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Account</div>
        <div className="mt-2">
          <Row label="Status" value={user.status} />
          <Row label="Role" value={user.role} />
          <Row label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>
      </div>

      {user.profile && (
        <div className="card mt-4 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Profile</div>
          <div className="mt-2">
            <Row label="Goal" value={user.profile.goal} />
            <Row label="Fitness Level" value={user.profile.fitnessLevel} />
            <Row label="Current Weight" value={`${user.profile.currentWeightKg} kg`} />
            {user.profile.goalWeightKg != null && (
              <Row label="Goal Weight" value={`${user.profile.goalWeightKg} kg`} />
            )}
          </div>
        </div>
      )}

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
          <Row label="Daily logs" value={String(dailyProgressCount)} />
          <Row label="Coach messages" value={String(chatMessageCount)} />
          <Row label="Active workout plans" value={String(user.workoutPlans.length)} />
        </div>
      </div>
    </section>
  );
}
