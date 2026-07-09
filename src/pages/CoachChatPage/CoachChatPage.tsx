import { motion } from 'framer-motion';
import ChatWindow from '../../features/coach-chat/components/ChatWindow';

export default function CoachChatPage() {
  return (
    <section className="relative mx-auto max-w-2xl px-4 py-12 sm:py-16">
      {/* Ambient glow */}
      <div className="orb w-96 h-96 bg-violet-600/10 -top-32 left-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/15">
            <span className="text-2xl">🤖</span>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-[var(--color-brand-bg)] pulse-dot" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              AI Fitness <span className="text-gradient-violet">Coach</span>
            </h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Online · Answers instantly · Knows your goals
            </p>
          </div>
        </div>

        {/* Topic chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {['Workouts', 'Nutrition', 'Supplements', 'Recovery', 'XP & Ranks'].map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-gray-400"
            >
              {topic}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-6"
      >
        <ChatWindow />
      </motion.div>
    </section>
  );
}
