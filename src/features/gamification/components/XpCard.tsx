import { useUserProgress } from '../hooks/useUserProgress';

export default function XpCard() {
  const { progress, isLoading } = useUserProgress();
  const xp = progress.totalXp;

  if (isLoading) return null;

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Total XP</div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-black text-gradient-violet leading-none">{xp}</span>
        <span className="mb-1 text-sm text-gray-400 font-semibold">XP</span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span>⚡</span>
        <span>Keep logging to earn more</span>
      </div>
    </div>
  );
}
