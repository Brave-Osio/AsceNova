import type { RankName } from '../types/gamification.types';

export const RANK_COLOR_CLASS: Record<RankName, string> = {
  Iron: 'bg-[var(--color-rank-iron)]',
  Bronze: 'bg-[var(--color-rank-bronze)]',
  Silver: 'bg-[var(--color-rank-silver)]',
  Gold: 'bg-[var(--color-rank-gold)]',
  Platinum: 'bg-[var(--color-rank-platinum)]',
  Diamond: 'bg-[var(--color-rank-diamond)]',
  Ascendant: 'bg-[var(--color-rank-ascendant)]',
  Immortal: 'bg-[var(--color-rank-immortal)]',
  Radiant: 'bg-[var(--color-rank-radiant)]',
};

export const RANK_ICON: Record<RankName, string> = {
  Iron: '🔩',
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💠',
  Diamond: '💎',
  Ascendant: '⭐',
  Immortal: '🔮',
  Radiant: '👑',
};
