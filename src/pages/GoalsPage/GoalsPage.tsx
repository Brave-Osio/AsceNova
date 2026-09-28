import { Target } from 'lucide-react';
import { useGoals } from '../../features/goals/hooks/useGoals';
import GoalCard from '../../features/goals/components/GoalCard';
import GoalForm from '../../features/goals/components/GoalForm';

export default function GoalsPage() {
  const { goals, isLoading } = useGoals();

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div>
        <p className="text-sm text-brand-text-muted mb-1">Progress</p>
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">Goals</h1>
        <p className="mt-2 text-brand-text-secondary">Set a target and track it separately from your everyday habits.</p>
      </div>

      <div className="mt-8">
        <GoalForm />
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-brand-text-muted">Loading…</p>
        ) : goals.length === 0 ? (
          <div className="card rounded-2xl p-8 text-center">
            <Target size={32} className="mx-auto text-brand-text-muted" />
            <p className="mt-3 text-sm text-brand-text-secondary">No goals yet — create one above.</p>
          </div>
        ) : (
          goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </div>
    </section>
  );
}
