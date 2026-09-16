import { Link } from 'react-router-dom';
import { usePlanGenerator } from '../../fitness-plan/hooks/usePlanGenerator';
import { useLogs } from '../../daily-log/hooks/useLogs';
import { getTodayDateString } from '../../../utils/dateUtils';
import { ROUTES } from '../../../constants/routes';

function GoalBadge({ hit, label }: { hit: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        hit ? 'bg-green-500/15 text-green-300' : 'bg-white/5 text-gray-500'
      }`}
    >
      {hit ? '✓' : '—'} {label}
    </span>
  );
}

export default function TodayTargetsCard() {
  const { plan, isLoading: isPlanLoading } = usePlanGenerator();
  const { data: logs, isLoading: isLogsLoading } = useLogs();

  if (isPlanLoading || isLogsLoading) return null;

  if (!plan) {
    return (
      <div className="glass h-full rounded-2xl p-5 flex flex-col">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Today's Targets</div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500 text-center">Generate a plan to see your daily targets.</p>
        </div>
      </div>
    );
  }

  const { calories, proteinGrams, carbsGrams, fatGrams, waterLiters } = plan.nutrition;
  const todayLog = logs?.find((l) => l.date === getTodayDateString());

  return (
    <div className="glass h-full rounded-2xl p-5 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Today's Targets</div>
      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2.5 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-600">Calories</div>
          <div className="font-bold text-white">{calories} kcal</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-600">Protein</div>
          <div className="font-bold text-white">{proteinGrams}g</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-600">Carbs</div>
          <div className="font-bold text-white">{carbsGrams}g</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-600">Fat</div>
          <div className="font-bold text-white">{fatGrams}g</div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="text-gray-500">💧 Water target</span>
        <span className="font-semibold text-cyan-300">{waterLiters}L</span>
      </div>
      <div className="mt-3 border-t border-white/5 pt-3">
        {todayLog ? (
          <div className="flex flex-wrap gap-1.5">
            <GoalBadge hit={todayLog.habits.hitWaterGoal} label="Water goal" />
            <GoalBadge hit={todayLog.habits.hitProteinGoal} label="Protein goal" />
          </div>
        ) : (
          <Link to={ROUTES.log} className="text-xs font-medium text-violet-300 hover:text-violet-200">
            Log today's progress →
          </Link>
        )}
      </div>
    </div>
  );
}
