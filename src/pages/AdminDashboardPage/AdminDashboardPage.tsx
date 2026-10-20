import { useAdminStats } from '../../features/admin/hooks/useAdminStats';
import { useState } from 'react';
import DonutChart from '../../components/charts/DonutChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import Button from '../../components/ui/Button';
import AiUsageCard from '../../features/admin/components/AiUsageCard';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { bucketSeries, RANGE_OPTIONS, type AnalyticsRange } from '../../features/admin/analyticsRange';

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

export default function AdminDashboardPage() {
  const { stats, isLoading, isError, refetch } = useAdminStats();
  const [range, setRange] = useState<AnalyticsRange>('daily');
  const windowLabel = RANGE_OPTIONS.find((o) => o.value === range)?.window ?? '';
  const unit = range === 'daily' ? 'day' : range === 'weekly' ? 'week' : 'month';
  const signups = bucketSeries(stats?.signupsByDay.map((d) => ({ date: d.date, value: d.count })) ?? [], range);
  const growth = bucketSeries(stats?.signupsByDay.map((d) => ({ date: d.date, value: d.total })) ?? [], range, 'last');
  const activeUsers = bucketSeries(stats?.engagementByDay.map((d) => ({ date: d.date, value: d.activeUsers })) ?? [], range);
  const workouts = bucketSeries(stats?.engagementByDay.map((d) => ({ date: d.date, value: d.workoutsCompleted })) ?? [], range);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Admin"
        title="Analytics"
        actions={
          <div role="group" aria-label="Analytics range" className="inline-flex rounded-full border border-brand-border bg-brand-card p-1">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={range === option.value}
                onClick={() => setRange(option.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 ${
                  range === option.value ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:text-brand-text'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

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

            <ChartCard title={`New Users per ${unit}`} description={`Signups, ${windowLabel} (UTC).`}>
              {signups.every((p) => p.value === 0) ? (
                <p className="py-10 text-center text-sm text-brand-text-muted">No signups in the {windowLabel}.</p>
              ) : (
                <SimpleBarChart unitLabel="new users" data={signups} />
              )}
            </ChartCard>

            <ChartCard
              title={range === 'daily' ? 'Daily Active Users' : `Active Check-ins per ${unit}`}
              description={
                range === 'daily'
                  ? `Distinct users with a daily check-in each day, ${windowLabel} (UTC).`
                  : `Daily distinct active users added up per ${unit}, ${windowLabel} (UTC). A user active on several days counts once per day.`
              }
            >
              <SimpleBarChart unitLabel={range === 'daily' ? 'active users' : 'active user-days'} data={activeUsers} />
            </ChartCard>

            <ChartCard title={`Workouts Completed per ${unit}`} description={`Daily check-ins with the workout marked done, ${windowLabel} (UTC).`}>
              <SimpleBarChart unitLabel="workouts" data={workouts} />
            </ChartCard>

            <ChartCard title="User Growth" description={`Total accounts at the end of each ${unit}, ${windowLabel}.`}>
              <SimpleLineChart unitLabel=" users" data={growth} />
            </ChartCard>
          </div>
          <div className="mt-4">
            <AiUsageCard />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Total Users" value={String(stats.totalUsers)} hint={`${stats.adminUsers} administrator${stats.adminUsers === 1 ? '' : 's'}`} />
            <StatCard label="New Users (Past 7 Days)" value={String(stats.newUsers7d)} />
            <StatCard label="New Users (Past 30 Days)" value={String(stats.newUsers30d)} />
            <StatCard label="Active Users (7 Days)" value={String(stats.activeUsers7d)} hint="with a daily check-in" />
            <StatCard label="Active Users (30 Days)" value={String(stats.activeUsers30d)} hint="with a daily check-in" />
            <StatCard label="Workout Plans Generated" value={String(stats.workoutPlansGenerated)} hint="all time, including replaced plans" />
            <StatCard label="Workouts Completed" value={String(stats.totalWorkoutsCompleted)} hint="all time" />
            <StatCard label="Challenge Participants" value={String(stats.challengeParticipants)} hint="accepted participations" />
            <StatCard label="Challenges Completed" value={String(stats.challengeCompletions)} hint="participations finished" />
            <StatCard label="Workout Completion" value={`${Math.round(stats.workoutCompletionRate * 100)}%`} hint="of all daily logs" />
            <StatCard label="Avg XP" value={String(stats.avgTotalXp)} />
            <StatCard label="Avg Streak" value={`${stats.avgStreak} days`} />
          </div>
        </>
      )}

    </PageContainer>
  );
}
