import type { LucideIcon } from 'lucide-react';
import { Shield, Medal, Gem, Star, Sparkles, Crown } from 'lucide-react';
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

/** CSS var per rank, for icon color (`style={{ color: RANK_COLOR_VAR[rank] }}`) since Tailwind can't derive a text-color utility from the bg-only tokens above. */
export const RANK_COLOR_VAR: Record<RankName, string> = {
  Iron: 'var(--color-rank-iron)',
  Bronze: 'var(--color-rank-bronze)',
  Silver: 'var(--color-rank-silver)',
  Gold: 'var(--color-rank-gold)',
  Platinum: 'var(--color-rank-platinum)',
  Diamond: 'var(--color-rank-diamond)',
  Ascendant: 'var(--color-rank-ascendant)',
  Immortal: 'var(--color-rank-immortal)',
  Radiant: 'var(--color-rank-radiant)',
};

export const RANK_ICON: Record<RankName, LucideIcon> = {
  Iron: Shield,
  Bronze: Medal,
  Silver: Medal,
  Gold: Medal,
  Platinum: Gem,
  Diamond: Gem,
  Ascendant: Star,
  Immortal: Sparkles,
  Radiant: Crown,
};
