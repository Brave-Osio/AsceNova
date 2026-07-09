import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🔥',
    title: 'Streaks',
    description: 'Build daily momentum. Every consecutive day logged keeps your streak alive and multiplies your XP gains.',
    color: 'from-orange-500/20 to-red-500/10',
    border: 'border-orange-500/20',
    glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]',
    accent: 'text-orange-400',
  },
  {
    icon: '⚡',
    title: 'XP & Ranks',
    description: 'Earn XP for showing up, not just for hitting the scale. Climb from Iron to Radiant — 9 tiers of glory.',
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/20',
    glow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
    accent: 'text-violet-400',
  },
  {
    icon: '🏅',
    title: 'Achievements',
    description: 'Unlock badges for milestones — first workout, 7-day streaks, rank promotions, and rare feats of discipline.',
    color: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    accent: 'text-amber-400',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    description: 'Compete on consistency, not weight loss. The top of the board belongs to the most disciplined.',
    color: 'from-cyan-500/20 to-teal-500/10',
    border: 'border-cyan-500/20',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    accent: 'text-cyan-400',
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
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-gray-400 mb-5">
            Why AsceNova
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Built <span className="text-gradient-violet">different</span> from typical fitness apps
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400 leading-relaxed">
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
              className={`
                group relative rounded-2xl border bg-gradient-to-b p-5
                card-hover transition-all duration-300
                ${feature.color} ${feature.border} ${feature.glow}
              `}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-2xl">
                {feature.icon}
              </div>
              <h3 className={`text-base font-bold ${feature.accent}`}>{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
