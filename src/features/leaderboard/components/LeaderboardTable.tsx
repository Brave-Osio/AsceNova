import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield, Trophy } from 'lucide-react';
import { RANK_COLOR_VAR, RANK_ICON } from '../../../constants/rankVisuals';
import RankWings from './RankWings';
import TablePagination from '../../../components/ui/TablePagination';
import { DEFAULT_PAGE_SIZE } from '../../../constants/pagination';
import type { LeaderboardRowData } from '../hooks/useLeaderboard';


interface LeaderboardTableProps {
  rows: LeaderboardRowData[];
  isLoading?: boolean;
}

const GRID = 'grid grid-cols-[3.5rem_minmax(0,1fr)_auto_auto_auto] sm:grid-cols-[4.5rem_minmax(0,1fr)_auto_auto_auto] gap-2 sm:gap-4';

/**
 * Whole-row treatment for the podium, most prominent first. Backgrounds are
 * low-alpha tints so the normal text colors keep their contrast in both themes.
 */
const PODIUM_ROW: Record<number, string> = {
  1: 'bg-gradient-to-r from-amber-400/30 via-amber-400/10 to-transparent border-l-4 border-l-amber-400 py-6',
  2: 'bg-gradient-to-r from-slate-400/25 via-slate-400/10 to-transparent border-l-4 border-l-slate-400 py-5',
  3: 'bg-gradient-to-r from-orange-500/25 via-orange-500/10 to-transparent border-l-4 border-l-orange-500 py-4',
};

const PODIUM_BADGE: Record<number, string> = {
  1: 'bg-gradient-to-b from-amber-200 to-amber-500 text-amber-950 shadow-md shadow-amber-500/30 h-8 w-8 text-sm',
  2: 'bg-gradient-to-b from-slate-100 to-slate-400 text-slate-900 h-7 w-7 text-sm',
  3: 'bg-gradient-to-b from-orange-200 to-orange-500 text-orange-950 h-7 w-7 text-sm',
};

function SkeletonRows() {
  return (
    <div aria-busy="true" aria-label="Loading leaderboard">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-14 animate-pulse border-b border-brand-border bg-brand-card/60 last:border-0" />
      ))}
    </div>
  );
}

export default function LeaderboardTable({ rows, isLoading = false }: LeaderboardTableProps) {
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  // Clamp during render so a shrinking list never leaves us on a page that no longer exists.
  const page = Math.min(requestedPage, totalPages);
  const startIndex = (page - 1) * pageSize;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-brand-border">
        {/* Header */}
        <div
          className={`${GRID} border-b border-brand-border bg-brand-card px-3 py-3 text-xs font-bold uppercase tracking-widest text-brand-text-muted sm:px-5`}
        >
          <span className="text-center">#</span>
          <span>Name</span>
          <span>Rank</span>
          <span className="text-right">XP</span>
          <span className="text-right">Streak</span>
        </div>

        {isLoading ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Trophy size={32} className="text-brand-text-muted" />
            <p className="text-sm text-brand-text-secondary">No one is on the leaderboard yet. Log a day to claim the first spot.</p>
          </div>
        ) : (
          // Keyed by page so each page re-runs the row entrance animation.
          <div key={page}>
            {pageRows.map((row, i) => {
              const isPodium = row.position <= 3;
              const RankIcon = RANK_ICON[row.rank] ?? Shield;
              const tierColor = RANK_COLOR_VAR[row.rank] ?? 'var(--color-rank-iron)';
              return (
                <motion.div
                  key={`${row.position}-${row.name}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  style={isPodium ? undefined : { borderLeft: `3px solid color-mix(in srgb, ${tierColor} 55%, transparent)` }}
                  className={`${GRID} workout-row relative items-center border-b border-brand-border px-3 last:border-0 sm:px-5 ${
                    isPodium ? PODIUM_ROW[row.position] : 'py-4'
                  } ${row.isCurrentUser ? 'ring-1 ring-inset ring-brand-primary/60' : ''}`}
                >
                  <span className="relative flex h-8 items-center justify-center">
                    <RankWings position={row.position} />
                    <span
                      aria-label={`Position ${row.position}`}
                      className={`relative flex items-center justify-center rounded-full font-bold ${
                        isPodium
                          ? PODIUM_BADGE[row.position]
                          : 'h-6 min-w-6 bg-brand-card-alt px-1.5 text-xs text-brand-text-muted'
                      }`}
                    >
                      {row.position}
                    </span>
                  </span>
                  <span
                    className={`min-w-0 truncate text-sm ${
                      row.isCurrentUser || isPodium ? 'font-bold text-brand-text' : 'font-medium text-brand-text-secondary'
                    } ${row.position === 1 ? 'sm:text-base' : ''}`}
                  >
                    {row.name}
                    {row.isCurrentUser && <span className="chip chip-primary ml-2 px-1.5 py-0.5 text-[10px]">YOU</span>}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold"
                    style={{
                      color: tierColor,
                      backgroundColor: `color-mix(in srgb, ${tierColor} 16%, transparent)`,
                    }}
                    title={row.rank}
                  >
                    <RankIcon size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">{row.rank}</span>
                    <span className="sr-only sm:hidden">{row.rank}</span>
                  </span>
                  <span className="text-right text-sm font-bold text-brand-primary-light">{row.xp.toLocaleString()}</span>
                  <span className="flex items-center justify-end gap-1 text-right text-sm font-semibold text-orange-400 light:text-orange-700">
                    <Flame size={13} aria-hidden="true" /> {row.streak}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && rows.length > 0 && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={rows.length}
          noun="players"
          onPageChange={setRequestedPage}
          onPageSizeChange={(next) => {
            setPageSize(next);
            setRequestedPage(1);
          }}
        />
      )}
    </div>
  );
}
