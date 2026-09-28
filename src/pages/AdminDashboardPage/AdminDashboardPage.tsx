import { useAdminStats } from '../../features/admin/hooks/useAdminStats';
import UserTable from '../../features/admin/components/UserTable';
import AchievementEditor from '../../features/admin/components/AchievementEditor';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{label}</div>
      <div className="mt-2 text-3xl font-black text-brand-text">{value}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { stats, isLoading } = useAdminStats();

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div>
        <p className="text-sm text-brand-text-muted mb-1">Admin</p>
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">Platform Overview</h1>
      </div>

      {isLoading || !stats ? (
        <div className="mt-8 text-sm text-brand-text-muted">Loading stats…</div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Total Users" value={String(stats.totalUsers)} />
            <StatCard label="Active" value={String(stats.activeUsers)} />
            <StatCard label="Suspended" value={String(stats.suspendedUsers)} />
            <StatCard label="Deleted" value={String(stats.deletedUsers)} />
            <StatCard label="New (7d)" value={String(stats.newUsers7d)} />
            <StatCard label="New (30d)" value={String(stats.newUsers30d)} />
            <StatCard label="Avg XP" value={String(stats.avgTotalXp)} />
            <StatCard label="Avg Streak" value={`${stats.avgStreak} days`} />
            <StatCard label="Workout Completion" value={`${Math.round(stats.workoutCompletionRate * 100)}%`} />
          </div>

          {stats.goalDistribution.length > 0 && (
            <div className="card mt-4 rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Goal Distribution</div>
              <div className="mt-3 space-y-2 text-sm">
                {stats.goalDistribution.map((row) => (
                  <div key={row.goal} className="flex items-center justify-between">
                    <span className="text-brand-text-secondary">{row.goal}</span>
                    <span className="font-bold text-brand-text">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <UserTable />
      </div>

      <div className="mt-8">
        <AchievementEditor />
      </div>
    </section>
  );
}
