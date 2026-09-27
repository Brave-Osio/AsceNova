import { useGoals } from '../../features/goals/hooks/useGoals';
import GoalCard from '../../features/goals/components/GoalCard';
import GoalForm from '../../features/goals/components/GoalForm';

export default function GoalsPage() {
  const { goals, isLoading } = useGoals();

  return (
    <section className="relative mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="orb w-96 h-96 bg-violet-600/8 -top-20 -right-32" />

      <div>
        <p className="text-sm text-gray-500 mb-1">Progress</p>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Goals</h1>
        <p className="mt-2 text-gray-400">Set a target and track it separately from your everyday habits.</p>
      </div>

      <div className="mt-8">
        <GoalForm />
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : goals.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <span className="text-4xl">🎯</span>
            <p className="mt-3 text-sm text-gray-400">No goals yet — create one above.</p>
          </div>
        ) : (
          goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </div>
    </section>
  );
}
