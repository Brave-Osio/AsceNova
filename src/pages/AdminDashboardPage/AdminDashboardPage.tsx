import { useAdminStats } from '../../features/admin/hooks/useAdminStats';
import UserTable from '../../features/admin/components/UserTable';
import AchievementEditor from '../../features/admin/components/AchievementEditor';
import DonutChart from '../../components/charts/DonutChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import Button from '../../components/ui/Button';
import AiUsageCard from '../../features/admin/components/AiUsageCard';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{label}</div>
      <div className="mt-2 text-3xl font-black text-brand-text">{value}</div>
      {hint && <div className="mt-1 text-xs text-brand-text-muted">{hint}</div>}
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{title}</div>
      <p className="mt-1 mb-4 text-xs text-brand-text-muted">{description}</p>
      {children}
    </div>
  );
}

/** "2026-09-30" -> "09-30", matching the weight chart's compact axis labels. */
const shortDate = (iso: string) => iso.slice(5);

export default function AdminDashboardPage() {
  const { stats, isLoading, isError, refetch } = useAdminStats();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div>
        <p className="text-sm text-brand-text-muted mb-1">Admin</p>
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">Platform Overview</h1>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="card h-[106px] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : isError || !stats ? (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
          <p className="text-sm text-red-400 light:text-red-700">Couldn't load platform stats.</p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Account Status" description="How the user base splits by account state.">
              <DonutChart
                centerValue={String(stats.activeUsers + stats.suspendedUsers + stats.deletedUsers)}
                centerLabel="Accounts"
                data={[
                  { label: 'Active', value: stats.activeUsers, color: '#2dd4bf' },
                  { label: 'Suspended', value: stats.suspendedUsers, color: '#f59e0b' },
                  { label: 'Deleted', value: stats.deletedUsers, color: '#fb7185' },
                ]}
              />
            </ChartCard>

            <ChartCard title="Goal Distribution" description="What users are training for, from their profiles.">
              {stats.goalDistribution.length === 0 ? (
                <p className="py-10 text-center text-sm text-brand-text-muted">No profiles yet.</p>
              ) : (
                <DonutChart
                  centerValue={String(stats.goalDistribution.reduce((sum, row) => sum + row.count, 0))}
                  centerLabel="Profiles"
                  data={stats.goalDistribution.map((row, i) => ({
                    label: GOAL_LABEL[row.goal] ?? row.goal,
                    value: row.count,
                    color: ['#7c5cfc', '#38bdf8', '#2dd4bf'][i % 3],
                  }))}
                />
              )}
            </ChartCard>

            <ChartCard title="New Users per Day" description="Signups over the past 30 days (UTC).">
              {stats.newUsers30d === 0 ? (
                <p className="py-10 text-center text-sm text-brand-text-muted">No signups in the past 30 days.</p>
              ) : (
                <SimpleBarChart
                  unitLabel="new users"
                  data={stats.signupsByDay.map((d) => ({ label: shortDate(d.date), value: d.count }))}
                />
              )}
            </ChartCard>

            <ChartCard title="User Growth" description="Total accounts over the past 30 days.">
              <SimpleLineChart
                unitLabel=" users"
                data={stats.signupsByDay.map((d) => ({ label: shortDate(d.date), value: d.total }))}
              />
            </ChartCard>
          </div>
          <div className="mt-4">
            <AiUsageCard />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Total Users" value={String(stats.totalUsers)} hint={`${stats.adminUsers} administrator${stats.adminUsers === 1 ? '' : 's'}`} />
            <StatCard label="New Users (Past 7 Days)" value={String(stats.newUsers7d)} />
            <StatCard label="New Users (Past 30 Days)" value={String(stats.newUsers30d)} />
            <StatCard label="Workout Completion" value={`${Math.round(stats.workoutCompletionRate * 100)}%`} hint="of all daily logs" />
            <StatCard label="Avg XP" value={String(stats.avgTotalXp)} />
            <StatCard label="Avg Streak" value={`${stats.avgStreak} days`} />
          </div>
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
