import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplet, Sparkles, Droplets } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NutritionPlan } from '../../../types/plan.types';

interface NutritionPanelProps {
  nutrition: NutritionPlan;
}

interface MacroItem {
  label: string;
  value: string;
  sub: string;
  iconClass: string;
  barClass: string;
  icon: LucideIcon;
  pct?: number; // optional fill bar percentage (0–100)
}

export default function NutritionPanel({ nutrition }: NutritionPanelProps) {
  const totalMacroCals =
    nutrition.proteinGrams * 4 + nutrition.carbsGrams * 4 + nutrition.fatGrams * 9;

  const proteinPct = Math.round((nutrition.proteinGrams * 4 / totalMacroCals) * 100);
  const carbsPct = Math.round((nutrition.carbsGrams * 4 / totalMacroCals) * 100);
  const fatPct = Math.round((nutrition.fatGrams * 9 / totalMacroCals) * 100);

  const items: MacroItem[] = [
    { label: 'Calories', value: `${nutrition.calories}`, sub: 'kcal / day', iconClass: 'text-brand-primary-light bg-brand-primary/15', barClass: 'bg-brand-primary-light', icon: Flame },
    { label: 'Protein', value: `${nutrition.proteinGrams}g`, sub: `${proteinPct}% of macros`, iconClass: 'text-blue-300 bg-blue-500/15', barClass: 'bg-blue-400', icon: Beef, pct: proteinPct },
    { label: 'Carbs', value: `${nutrition.carbsGrams}g`, sub: `${carbsPct}% of macros`, iconClass: 'text-amber-300 bg-amber-500/15', barClass: 'bg-amber-400', icon: Wheat, pct: carbsPct },
    { label: 'Fat', value: `${nutrition.fatGrams}g`, sub: `${fatPct}% of macros`, iconClass: 'text-rose-300 bg-rose-500/15', barClass: 'bg-rose-400', icon: Droplet, pct: fatPct },
    { label: 'Sodium', value: `${nutrition.sodiumMg}mg`, sub: 'daily limit', iconClass: 'text-teal-300 bg-teal-500/15', barClass: 'bg-teal-400', icon: Sparkles },
    { label: 'Water', value: `${nutrition.waterLiters}L`, sub: 'daily target', iconClass: 'text-sky-300 bg-sky-500/15', barClass: 'bg-sky-400', icon: Droplets },
  ];

  return (
    <div className="space-y-3">
      {/* Macro ratio bar */}
      <div className="overflow-hidden rounded-full h-3 flex gap-0.5 bg-brand-card-alt">
        <div className="h-full rounded-full bg-blue-400 transition-all duration-700" style={{ width: `${proteinPct}%` }} title="Protein" />
        <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${carbsPct}%` }} title="Carbs" />
        <div className="h-full flex-1 rounded-full bg-rose-400" title="Fat" />
      </div>
      <div className="flex gap-4 text-xs text-brand-text-muted px-0.5">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Protein</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Carbs</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Fat</span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="card rounded-2xl p-4"
          >
            <div className="flex items-start justify-between">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.iconClass}`}>
                <item.icon size={14} />
              </span>
              <span className="text-xs font-semibold text-brand-text-secondary">
                {item.label}
              </span>
            </div>

            <div className="mt-2 text-2xl font-bold text-brand-text leading-none">{item.value}</div>
            <div className="mt-1 text-xs text-brand-text-muted">{item.sub}</div>

            {/* Optional progress bar for macros */}
            {item.pct !== undefined && (
              <div className="mt-3 h-1 w-full rounded-full bg-brand-card-alt overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${item.barClass}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ delay: i * 0.06 + 0.3, duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
