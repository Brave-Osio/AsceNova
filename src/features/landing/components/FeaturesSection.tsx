import { motion } from 'framer-motion';
import { Flame, Zap, Award, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const FEATURES: { icon: LucideIcon; title: string; description: string; accent: string }[] = [
  {
    icon: Flame,
    title: 'Streaks',
    description: 'Build daily momentum. Every consecutive day logged keeps your streak alive and multiplies your XP gains.',
    accent: 'text-orange-400 light:text-orange-700 bg-orange-500/15',
  },
  {
    icon: Zap,
    title: 'XP & Ranks',
    description: 'Earn XP for showing up, not just for hitting the scale. Climb from Iron to Radiant — 9 tiers of glory.',
    accent: 'text-brand-primary-light bg-brand-primary/15',
  },
  {
    icon: Award,
    title: 'Achievements',
    description: 'Unlock badges for milestones — first workout, 7-day streaks, rank promotions, and rare feats of discipline.',
    accent: 'text-amber-400 light:text-amber-700 bg-amber-500/15',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    description: 'Compete on consistency, not weight loss. The top of the board belongs to the most disciplined.',
    accent: 'text-cyan-400 light:text-cyan-700 bg-cyan-500/15',
  },
];

export default function FeaturesSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="chip px-4 py-1.5 text-xs mb-5">
            Why AsceNova
          </span>
          <h2 className="text-2xl font-extrabold text-brand-text sm:text-3xl">
            Built <span className="text-brand-primary-light">different</span> from typical fitness apps
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-text-secondary leading-relaxed">
            Most apps measure weight. We measure the habit that actually gets you there.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="card card-hover rounded-2xl p-5"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.accent}`}>
                <feature.icon size={20} />
              </div>
              <h3 className="text-base font-bold text-brand-text">{feature.title}</h3>
              <p className="mt-2 text-sm text-brand-text-secondary leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
