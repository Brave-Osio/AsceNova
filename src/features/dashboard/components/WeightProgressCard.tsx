import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useLogs } from '../../daily-log/hooks/useLogs';
import { useProfile } from '../../profile/hooks/useProfile';
import SimpleLineChart from '../../../components/charts/SimpleLineChart';
import { ROUTES } from '../../../constants/routes';

function Stat({ label, value, valueClass = 'text-brand-text' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-text-muted">{label}</div>
      <div className={`mt-0.5 text-2xl font-black leading-tight ${valueClass}`}>{value}</div>
    </div>
  );
}

/** Featured dashboard section: full width, taller chart, headline numbers beside it. */
export default function WeightProgressCard() {
  const { data: logs = [], isLoading } = useLogs();
  const { data: profile } = useProfile();

  if (isLoading) {
    return <div className="card h-80 animate-pulse rounded-3xl" aria-busy="true" aria-label="Loading weight progress" />;
  }

  if (logs.length === 0) {
    return (
      <div className="card rounded-3xl p-6 sm:p-8">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Weight Progress</div>
        <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
          <TrendingUp size={32} className="text-brand-text-muted" />
          <p className="max-w-sm text-sm text-brand-text-secondary">
            Your weight trend will appear here once you start logging.
          </p>
          <Link to={ROUTES.log} className="text-sm font-bold text-brand-primary-light hover:text-brand-text hover:underline">
            Log your weight →
          </Link>
        </div>
      </div>
    );
  }

  const chartData = logs.map((log) => ({ label: log.date.slice(5), value: log.weightKg }));
  const latestWeight = logs[logs.length - 1].weightKg;
  const firstWeight = logs[0].weightKg;
  const delta = latestWeight - firstWeight;
  const goalWeight = profile?.goalWeightKg ?? null;
  const toGoal = goalWeight != null ? latestWeight - goalWeight : null;

  const deltaClass =
    delta < 0 ? 'text-green-400 light:text-green-700' : delta > 0 ? 'text-rose-400 light:text-rose-700' : 'text-brand-text';

  return (
    <div className="card rounded-3xl p-6 sm:p-8">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Weight Progress</div>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[14rem_1fr]">
        <div className="grid grid-cols-2 content-start gap-x-4 gap-y-5 lg:grid-cols-1">
          <Stat label="Current" value={`${latestWeight} kg`} />
          <Stat label="Starting" value={`${firstWeight} kg`} />
          <Stat
            label="Change"
            value={logs.length > 1 ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg` : '—'}
            valueClass={logs.length > 1 ? deltaClass : 'text-brand-text'}
          />
          {goalWeight != null && toGoal != null && (
            <Stat label={`Goal · ${goalWeight} kg`} value={Math.abs(toGoal) < 0.05 ? 'Reached!' : `${Math.abs(toGoal).toFixed(1)} kg ${toGoal > 0 ? 'to lose' : 'to gain'}`} />
          )}
          <div className="col-span-2 text-xs text-brand-text-muted lg:col-span-1">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'} logged
          </div>
        </div>
        <div className="min-w-0">
          <SimpleLineChart data={chartData} unitLabel="kg" height={260} />
        </div>
      </div>
    </div>
  );
}
