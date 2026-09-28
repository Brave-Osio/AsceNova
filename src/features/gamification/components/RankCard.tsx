import { Trophy, Shield } from 'lucide-react';
import { useUserProgress } from '../hooks/useUserProgress';
import { RANK_COLOR_CLASS, RANK_COLOR_VAR, RANK_ICON } from '../../../constants/rankVisuals';

export default function RankCard() {
  const { rank, rankProgress, nextRankThreshold, isLoading } = useUserProgress();

  if (isLoading) return null;

  const RankIcon = RANK_ICON[rank] ?? Shield;

  return (
    <div className="card rounded-2xl p-5 h-full">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Current Rank</div>
      <div className="mt-3 flex items-center gap-3">
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card-alt"
          style={{ color: RANK_COLOR_VAR[rank] }}
        >
          <RankIcon size={22} strokeWidth={2} />
        </span>
        <div>
          <div className="text-xl font-extrabold text-brand-text">{rank}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`h-2 w-2 rounded-full pulse-dot ${RANK_COLOR_CLASS[rank] ?? 'bg-gray-500'}`} />
            <span className="text-xs text-brand-text-muted">Active</span>
          </div>
        </div>
      </div>

      {nextRankThreshold ? (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-brand-text-muted mb-1.5">
            <span>Progress to {nextRankThreshold.name}</span>
            <span>{Math.round(rankProgress * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-card-alt">
            <div
              className={`h-full rounded-full transition-all duration-700 ${RANK_COLOR_CLASS[rank] ?? 'bg-gray-500'}`}
              style={{ width: `${Math.min(rankProgress * 100, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-xs text-brand-text-muted">
            {nextRankThreshold.minXp} XP needed for {nextRankThreshold.name}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-brand-accent-ink font-semibold">
          <Trophy size={14} />
          Highest rank reached!
        </div>
      )}
    </div>
  );
}
