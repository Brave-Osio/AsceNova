import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 text-center sm:py-28">
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
          className="chip chip-primary px-4 py-1.5 text-xs"
        >
          <Gamepad2 size={13} />
          Gamified fitness, built for consistency
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-4xl font-extrabold tracking-tight text-brand-text sm:text-5xl lg:text-6xl"
        >
          <span className="text-brand-primary-light">Level Up Your</span>
          <br />
          Fitness Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-6 text-lg text-brand-text-secondary sm:text-xl max-w-xl mx-auto leading-relaxed"
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
            className="flex items-center gap-2 rounded-full bg-brand-primary px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-light"
          >
            Start Your Journey <ArrowRight size={16} />
          </Link>
          <Link
            to={ROUTES.leaderboard}
            className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-card px-8 py-3.5 text-sm font-bold text-brand-text-secondary transition-colors hover:bg-brand-card-alt hover:text-brand-text"
          >
            <Trophy size={16} /> View Leaderboard
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
              <div className="text-2xl font-black text-brand-text">{stat.value}</div>
              <div className="mt-0.5 text-xs text-brand-text-muted uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
