import { Zap } from 'lucide-react';
import { useUserProgress } from '../hooks/useUserProgress';

export default function XpCard() {
  const { progress, isLoading } = useUserProgress();
  const xp = progress.totalXp;

  if (isLoading) return null;

  return (
    <div className="card rounded-2xl p-5 h-full">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Total XP</div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-black text-brand-text leading-none">{xp}</span>
        <span className="mb-1 text-sm text-brand-text-secondary font-semibold">XP</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-text-muted">
        <Zap size={14} className="text-brand-primary-light" />
        <span>Keep logging to earn more</span>
      </div>
    </div>
  );
}
