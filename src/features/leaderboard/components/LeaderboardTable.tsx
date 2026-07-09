import { motion } from 'framer-motion';
import { RANK_ICON } from '../../../constants/rankVisuals';
import type { LeaderboardRowData } from '../hooks/useLeaderboard';

interface LeaderboardTableProps {
  rows: LeaderboardRowData[];
}

const PODIUM_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardTable({ rows }: LeaderboardTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8">
      {/* Header */}
      <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-4 border-b border-white/8 bg-white/4 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
        <span>#</span>
        <span>Name</span>
        <span>Rank</span>
        <span className="text-right">XP</span>
        <span className="text-right">Streak</span>
      </div>

      {rows.map((row, i) => (
        <motion.div
          key={`${row.position}-${row.name}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: i * 0.04 }}
          className={`
            grid grid-cols-[2rem_1fr_auto_auto_auto] items-center gap-4 px-5 py-4
            border-b border-white/5 last:border-0 workout-row
            ${row.isCurrentUser ? 'bg-violet-500/8 border-l-2 border-l-violet-500' : ''}
          `}
        >
          <span className="text-base font-bold">
            {PODIUM_MEDAL[row.position] ?? (
              <span className="text-xs text-gray-500">{row.position}</span>
            )}
          </span>
          <span className={`text-sm ${row.isCurrentUser ? 'font-bold text-white' : 'text-gray-200 font-medium'}`}>
            {row.name}
            {row.isCurrentUser && (
              <span className="ml-2 rounded-full bg-violet-500/20 border border-violet-500/30 px-1.5 py-0.5 text-[10px] font-bold text-violet-300">YOU</span>
            )}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-300">
            <span>{RANK_ICON[row.rank]}</span>
            <span className="hidden sm:inline text-xs text-gray-500">{row.rank}</span>
          </span>
          <span className="text-right text-sm font-bold text-gradient-violet">
            {row.xp.toLocaleString()}
          </span>
          <span className="text-right text-sm text-orange-400 font-semibold">
            🔥 {row.streak}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
