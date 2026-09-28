import { TrendingUp } from 'lucide-react';
import { useLogs } from '../../daily-log/hooks/useLogs';
import SimpleLineChart from '../../../components/charts/SimpleLineChart';

export default function WeightProgressCard() {
  const { data: logs = [] } = useLogs();

  if (logs.length === 0) {
    return (
      <div className="card rounded-2xl p-5 sm:col-span-2">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Weight Progress</div>
        <div className="mt-4 flex items-center gap-3 text-sm text-brand-text-muted">
          <TrendingUp size={22} />
          <span>Your weight trend will appear here once you start logging.</span>
        </div>
      </div>
    );
  }

  const chartData = logs.map((log) => ({
    label: log.date.slice(5),
    value: log.weightKg,
  }));

  const latestWeight = logs[logs.length - 1].weightKg;
  const firstWeight = logs[0].weightKg;
  const delta = latestWeight - firstWeight;
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <div className="card rounded-2xl p-5 sm:col-span-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Weight Progress</div>
        <div className="flex items-center gap-3">
          {logs.length > 1 && (
            <span className={`text-xs font-semibold ${delta < 0 ? 'text-green-400 light:text-green-700' : delta > 0 ? 'text-rose-400 light:text-rose-700' : 'text-brand-text-muted'}`}>
              {deltaSign}{delta.toFixed(1)} kg
            </span>
          )}
          <span className="text-sm font-bold text-brand-text">{latestWeight} kg</span>
        </div>
      </div>
      <div className="mt-3">
        <SimpleLineChart data={chartData} unitLabel="kg" />
      </div>
    </div>
  );
}
