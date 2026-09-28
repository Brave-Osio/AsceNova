import { Flame } from 'lucide-react';
import { useUserProgress } from '../hooks/useUserProgress';

export default function StreakCard() {
  const { progress, isLoading } = useUserProgress();
  const streak = progress.currentStreak;

  if (isLoading) return null;

  return (
    <div className="card rounded-2xl p-5 h-full">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Streak</div>
      <div className="mt-3 flex items-end gap-2">
        <Flame size={26} className="text-brand-accent" strokeWidth={2.25} />
        <span className="text-4xl font-black text-brand-text leading-none">{streak}</span>
        <span className="mb-1 text-sm text-brand-text-secondary font-semibold">days</span>
      </div>
      <div className="mt-2 text-xs text-brand-text-muted">
        {streak === 0
          ? 'Log today to start your streak!'
          : streak >= 7
          ? 'Week streak — legendary!'
          : 'Keep it going!'}
      </div>
    </div>
  );
}
