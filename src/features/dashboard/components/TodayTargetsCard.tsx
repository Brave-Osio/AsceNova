import { Link } from 'react-router-dom';
import { Check, Minus, Droplet } from 'lucide-react';
import { usePlanGenerator } from '../../fitness-plan/hooks/usePlanGenerator';
import { useLogs } from '../../daily-log/hooks/useLogs';
import { getTodayDateString } from '../../../utils/dateUtils';
import { ROUTES } from '../../../constants/routes';

function GoalBadge({ hit, label }: { hit: boolean; label: string }) {
  return (
    <span
      className={`chip px-2 py-0.5 text-[10px] ${
        hit ? 'bg-green-500/15 text-green-300' : 'bg-brand-card-alt text-brand-text-muted'
      }`}
    >
      {hit ? <Check size={10} strokeWidth={3} /> : <Minus size={10} strokeWidth={3} />} {label}
    </span>
  );
}

export default function TodayTargetsCard() {
  const { plan, isLoading: isPlanLoading } = usePlanGenerator();
  const { data: logs, isLoading: isLogsLoading } = useLogs();

  if (isPlanLoading || isLogsLoading) return null;

  if (!plan) {
    return (
      <div className="card h-full rounded-2xl p-5 flex flex-col">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Today's Targets</div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-brand-text-muted text-center">Generate a plan to see your daily targets.</p>
        </div>
      </div>
    );
  }

  const { calories, proteinGrams, carbsGrams, fatGrams, waterLiters } = plan.nutrition;
  const todayLog = logs?.find((l) => l.date === getTodayDateString());

  return (
    <div className="card h-full rounded-2xl p-5 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Today's Targets</div>
      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2.5 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-brand-text-muted">Calories</div>
          <div className="font-bold text-brand-text">{calories} kcal</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-brand-text-muted">Protein</div>
          <div className="font-bold text-brand-text">{proteinGrams}g</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-brand-text-muted">Carbs</div>
          <div className="font-bold text-brand-text">{carbsGrams}g</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-brand-text-muted">Fat</div>
          <div className="font-bold text-brand-text">{fatGrams}g</div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-brand-text-muted">
          <Droplet size={12} /> Water target
        </span>
        <span className="font-semibold text-brand-primary-light">{waterLiters}L</span>
      </div>
      <div className="mt-3 border-t border-brand-border pt-3">
        {todayLog ? (
          <div className="flex flex-wrap gap-1.5">
            <GoalBadge hit={todayLog.habits.hitWaterGoal} label="Water goal" />
            <GoalBadge hit={todayLog.habits.hitProteinGoal} label="Protein goal" />
          </div>
        ) : (
          <Link to={ROUTES.log} className="text-xs font-medium text-brand-primary-light hover:text-white">
            Log today's progress →
          </Link>
        )}
      </div>
    </div>
  );
}
