import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-28 text-center sm:py-36">
      {/* Orbs */}
      <div className="orb w-[500px] h-[500px] bg-violet-600/20 -top-32 -left-48" style={{ animationDelay: '0s' }} />
      <div className="orb w-[400px] h-[400px] bg-cyan-500/10 top-20 -right-40" style={{ animationDelay: '3s' }} />
      <div className="orb w-[300px] h-[300px] bg-fuchsia-600/10 bottom-0 left-1/2 -translate-x-1/2" style={{ animationDelay: '5s' }} />

      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300"
        >
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-violet-400 inline-block" />
          🎮 Gamified fitness, built for consistency
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="text-gradient-hero">Level Up Your</span>
          <br />
          <span className="text-white">Fitness Journey</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-6 text-lg text-gray-400 sm:text-xl max-w-xl mx-auto leading-relaxed"
        >
          Transform consistency into progress. Earn XP, build streaks, climb ranks —
          your fitness game starts here.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to={ROUTES.setup}
            className="relative group rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:scale-105 active:scale-100"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Your Journey <span>→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            to={ROUTES.leaderboard}
            className="rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-bold text-gray-200 backdrop-blur transition-all duration-200 hover:bg-white/10 hover:border-white/25 hover:scale-105 active:scale-100"
          >
            View Leaderboard 🏆
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-8"
        >
          {[
            { value: '9', label: 'Rank Tiers' },
            { value: '∞', label: 'XP to Earn' },
            { value: '100%', label: 'Free to Use' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black text-gradient-violet">{stat.value}</div>
              <div className="mt-0.5 text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
