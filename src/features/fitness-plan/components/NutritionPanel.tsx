import { motion } from 'framer-motion';
import type { NutritionPlan } from '../../../types/plan.types';

interface NutritionPanelProps {
  nutrition: NutritionPlan;
}

interface MacroItem {
  label: string;
  value: string;
  sub: string;
  color: string;
  glow: string;
  icon: string;
  pct?: number; // optional fill bar percentage (0–100)
}

export default function NutritionPanel({ nutrition }: NutritionPanelProps) {
  const totalMacroCals =
    nutrition.proteinGrams * 4 + nutrition.carbsGrams * 4 + nutrition.fatGrams * 9;

  const items: MacroItem[] = [
    {
      label: 'Calories',
      value: `${nutrition.calories}`,
      sub: 'kcal / day',
      color: 'from-violet-500 to-fuchsia-500',
      glow: 'shadow-violet-500/30',
      icon: '🔥',
    },
    {
      label: 'Protein',
      value: `${nutrition.proteinGrams}g`,
      sub: `${Math.round((nutrition.proteinGrams * 4 / totalMacroCals) * 100)}% of macros`,
      color: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/30',
      icon: '💪',
      pct: Math.round((nutrition.proteinGrams * 4 / totalMacroCals) * 100),
    },
    {
      label: 'Carbs',
      value: `${nutrition.carbsGrams}g`,
      sub: `${Math.round((nutrition.carbsGrams * 4 / totalMacroCals) * 100)}% of macros`,
      color: 'from-amber-400 to-orange-500',
      glow: 'shadow-amber-500/30',
      icon: '⚡',
      pct: Math.round((nutrition.carbsGrams * 4 / totalMacroCals) * 100),
    },
    {
      label: 'Fat',
      value: `${nutrition.fatGrams}g`,
      sub: `${Math.round((nutrition.fatGrams * 9 / totalMacroCals) * 100)}% of macros`,
      color: 'from-rose-400 to-pink-500',
      glow: 'shadow-rose-500/30',
      icon: '🧈',
      pct: Math.round((nutrition.fatGrams * 9 / totalMacroCals) * 100),
    },
    {
      label: 'Sodium',
      value: `${nutrition.sodiumMg}mg`,
      sub: 'daily limit',
      color: 'from-teal-400 to-emerald-500',
      glow: 'shadow-teal-500/30',
      icon: '🧂',
    },
    {
      label: 'Water',
      value: `${nutrition.waterLiters}L`,
      sub: 'daily target',
      color: 'from-sky-400 to-indigo-500',
      glow: 'shadow-sky-500/30',
      icon: '💧',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Macro ratio bar */}
      <div className="nutrition-ratio-bar overflow-hidden rounded-full h-3 flex gap-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
          style={{ width: `${Math.round((nutrition.proteinGrams * 4 / totalMacroCals) * 100)}%` }}
          title="Protein"
        />
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
          style={{ width: `${Math.round((nutrition.carbsGrams * 4 / totalMacroCals) * 100)}%` }}
          title="Carbs"
        />
        <div
          className="h-full flex-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500"
          title="Fat"
        />
      </div>
      <div className="flex gap-4 text-xs text-gray-400 px-0.5">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />Protein</span>
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
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg ${item.glow}`}
          >
            {/* Gradient accent top bar */}
            <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${item.color}`} />

            <div className="flex items-start justify-between">
              <span className="text-lg">{item.icon}</span>
              <span className={`text-xs font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                {item.label}
              </span>
            </div>

            <div className="mt-2 text-2xl font-bold text-white leading-none">{item.value}</div>
            <div className="mt-1 text-xs text-gray-500">{item.sub}</div>

            {/* Optional progress bar for macros */}
            {item.pct !== undefined && (
              <div className="mt-3 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
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
