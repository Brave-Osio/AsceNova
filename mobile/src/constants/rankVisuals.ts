import { Shield, Medal, Gem, Star, Sparkles, Crown, type LucideIcon } from 'lucide-react-native';
import type { RankName } from '../types/gamification.types';

/** Mirrors the web's rankVisuals.ts; colors are the --color-rank-* tokens from src/index.css. */
export const RANK_COLOR: Record<RankName, string> = {
  Iron: '#6b7280',
  Bronze: '#d97706',
  Silver: '#94a3b8',
  Gold: '#f59e0b',
  Platinum: '#2dd4bf',
  Diamond: '#38bdf8',
  Ascendant: '#4ade80',
  Immortal: '#c084fc',
  Radiant: '#fb7185',
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
