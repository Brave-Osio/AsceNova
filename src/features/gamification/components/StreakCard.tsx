import { useUserProgress } from '../../../context/UserProgressContext';

export default function StreakCard() {
  const { progress } = useUserProgress();
  const streak = progress.currentStreak;

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Streak</div>
      <div className="mt-3 flex items-end gap-2">
        <span className="fire text-3xl leading-none">🔥</span>
        <span className="text-4xl font-black text-white leading-none">{streak}</span>
        <span className="mb-1 text-sm text-gray-400 font-semibold">days</span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {streak === 0
          ? 'Log today to start your streak!'
          : streak >= 7
          ? '🎉 Week streak — legendary!'
          : 'Keep it going!'}
      </div>
    </div>
  );
}
