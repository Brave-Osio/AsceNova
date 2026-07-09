import { useUserProgress } from '../../../context/UserProgressContext';
import { RANK_COLOR_CLASS, RANK_ICON } from '../../../constants/rankVisuals';

export default function RankCard() {
  const { rank, rankProgress, nextRankThreshold } = useUserProgress();

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Current Rank</div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-3xl leading-none">{RANK_ICON[rank] ?? '🔩'}</span>
        <div>
          <div className="text-xl font-extrabold text-white">{rank}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`h-2 w-2 rounded-full pulse-dot ${RANK_COLOR_CLASS[rank] ?? 'bg-gray-500'}`} />
            <span className="text-xs text-gray-500">Active</span>
          </div>
        </div>
      </div>

      {nextRankThreshold ? (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress to {nextRankThreshold.name}</span>
            <span>{Math.round(rankProgress * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-700 ${RANK_COLOR_CLASS[rank] ?? 'bg-gray-500'}`}
              style={{
                width: `${Math.min(rankProgress * 100, 100)}%`,
                boxShadow: `0 0 8px currentColor`,
              }}
            />
          </div>
          <div className="mt-1.5 text-xs text-gray-500">
            {nextRankThreshold.minXp} XP needed for {nextRankThreshold.name}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-xs text-amber-400 font-semibold">🏆 Highest rank reached!</div>
      )}
    </div>
  );
}
