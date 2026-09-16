import { useLogs } from '../../daily-log/hooks/useLogs';
import { daysBetween, getTodayDateString } from '../../../utils/dateUtils';

function Row({ label, value, valueClass = 'text-white' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function WeeklySummaryCard() {
  const { data: logs = [], isLoading } = useLogs();

  if (isLoading) return null;

  const today = getTodayDateString();
  const last7 = logs.filter((l) => {
    const diff = daysBetween(l.date, today);
    return diff >= 0 && diff < 7;
  });

  const daysLogged = last7.length;
  const workoutsCompleted = last7.filter((l) => l.habits.workoutCompleted).length;
  const waterGoalHits = last7.filter((l) => l.habits.hitWaterGoal).length;
  const proteinGoalHits = last7.filter((l) => l.habits.hitProteinGoal).length;
  const sortedByDate = [...last7].sort((a, b) => a.date.localeCompare(b.date));
  const weightChange =
    sortedByDate.length >= 2 ? sortedByDate[sortedByDate.length - 1].weightKg - sortedByDate[0].weightKg : null;

  return (
    <div className="glass h-full rounded-2xl p-5 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">This Week</div>
      {daysLogged === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500 text-center">No logs yet this week.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2 text-sm">
          <Row label="Days logged" value={`${daysLogged}/7`} />
          <Row label="Workouts completed" value={`${workoutsCompleted}`} />
          <Row label="Water goal hit" value={`${waterGoalHits}/${daysLogged}`} />
          <Row label="Protein goal hit" value={`${proteinGoalHits}/${daysLogged}`} />
          {weightChange !== null && (
            <Row
              label="Weight change"
              value={`${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`}
              valueClass={weightChange < 0 ? 'text-green-400' : weightChange > 0 ? 'text-rose-400' : 'text-gray-300'}
            />
          )}
        </div>
      )}
    </div>
  );
}
