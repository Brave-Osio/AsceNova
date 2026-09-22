import { useAdminStats } from '../../features/admin/hooks/useAdminStats';
import UserTable from '../../features/admin/components/UserTable';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { stats, isLoading } = useAdminStats();

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <div className="orb w-96 h-96 bg-violet-600/8 -top-20 -right-32" />

      <div>
        <p className="text-sm text-gray-500 mb-1">Admin</p>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Platform Overview</h1>
      </div>

      {isLoading || !stats ? (
        <div className="mt-8 text-sm text-gray-500">Loading stats…</div>
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
            <div className="glass mt-4 rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Goal Distribution</div>
              <div className="mt-3 space-y-2 text-sm">
                {stats.goalDistribution.map((row) => (
                  <div key={row.goal} className="flex items-center justify-between">
                    <span className="text-gray-400">{row.goal}</span>
                    <span className="font-bold text-white">{row.count}</span>
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
    </section>
  );
}
