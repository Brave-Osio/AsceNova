import { motion } from 'framer-motion';
import { Flame, Shield } from 'lucide-react';
import { RANK_ICON } from '../../../constants/rankVisuals';
import type { LeaderboardRowData } from '../hooks/useLeaderboard';

interface LeaderboardTableProps {
  rows: LeaderboardRowData[];
}

const PODIUM_CLASS: Record<number, string> = {
  1: 'bg-amber-500/15 text-amber-300 light:text-amber-700',
  2: 'bg-slate-400/15 text-slate-300 light:text-slate-700',
  3: 'bg-orange-600/15 text-orange-300 light:text-orange-700',
};

export default function LeaderboardTable({ rows }: LeaderboardTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border">
      {/* Header */}
      <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-4 border-b border-brand-border bg-brand-card px-5 py-3 text-xs font-bold uppercase tracking-widest text-brand-text-muted">
        <span>#</span>
        <span>Name</span>
        <span>Rank</span>
        <span className="text-right">XP</span>
        <span className="text-right">Streak</span>
      </div>

      {rows.map((row, i) => {
        const RankIcon = RANK_ICON[row.rank] ?? Shield;
        return (
          <motion.div
            key={`${row.position}-${row.name}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className={`
              grid grid-cols-[2rem_1fr_auto_auto_auto] items-center gap-4 px-5 py-4
              border-b border-brand-border last:border-0 workout-row
              ${row.isCurrentUser ? 'bg-brand-primary/8 border-l-2 border-l-brand-primary' : ''}
            `}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
              {PODIUM_CLASS[row.position] ? (
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${PODIUM_CLASS[row.position]}`}>
                  {row.position}
                </span>
              ) : (
                <span className="text-xs text-brand-text-muted">{row.position}</span>
              )}
            </span>
            <span className={`text-sm ${row.isCurrentUser ? 'font-bold text-brand-text' : 'text-brand-text-secondary font-medium'}`}>
              {row.name}
              {row.isCurrentUser && (
                <span className="ml-2 chip chip-primary px-1.5 py-0.5 text-[10px]">YOU</span>
              )}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-brand-text-secondary">
              <RankIcon size={14} />
              <span className="hidden sm:inline text-xs text-brand-text-muted">{row.rank}</span>
            </span>
            <span className="text-right text-sm font-bold text-brand-primary-light">
              {row.xp.toLocaleString()}
            </span>
            <span className="flex items-center justify-end gap-1 text-right text-sm text-orange-400 light:text-orange-700 font-semibold">
              <Flame size={13} /> {row.streak}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
