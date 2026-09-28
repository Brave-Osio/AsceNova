import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import ChatWindow from '../../features/coach-chat/components/ChatWindow';

export default function CoachChatPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary-light">
            <Bot size={26} />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-brand-bg pulse-dot" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">
              AI Fitness <span className="text-brand-primary-light">Coach</span>
            </h1>
            <p className="mt-0.5 text-sm text-brand-text-secondary">
              Online · Answers instantly · Knows your goals
            </p>
          </div>
        </div>

        {/* Topic chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {['Workouts', 'Nutrition', 'Supplements', 'Recovery', 'XP & Ranks'].map((topic) => (
            <span key={topic} className="chip px-3 py-1 text-xs">
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
