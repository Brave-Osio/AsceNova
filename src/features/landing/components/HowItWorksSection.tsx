import { motion } from 'framer-motion';
import { User, ClipboardList, NotebookPen, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const STEPS: { number: string; icon: LucideIcon; title: string; description: string; color: string }[] = [
  {
    number: '01',
    icon: User,
    title: 'Set up your profile',
    description: 'Tell us your goal, fitness level, and equipment access in under 60 seconds.',
    color: 'text-brand-primary-light',
  },
  {
    number: '02',
    icon: ClipboardList,
    title: 'Get your AI plan',
    description: 'Receive a full workout split with exercises, sets, and reps, plus personalized calorie and macro targets.',
    color: 'text-cyan-400',
  },
  {
    number: '03',
    icon: NotebookPen,
    title: 'Log daily habits',
    description: 'Check off workouts, water, protein, sleep, and steps every day to earn XP.',
    color: 'text-amber-400',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Rank up & compete',
    description: 'Earn XP, build streaks, unlock achievements, and climb the leaderboard.',
    color: 'text-rose-400',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="chip px-4 py-1.5 text-xs mb-5">
            The Process
          </span>
          <h2 className="text-2xl font-extrabold text-brand-text sm:text-3xl">
            How it <span className="text-brand-primary-light">works</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative flex gap-5 card card-hover rounded-2xl p-6"
            >
              {/* Step number */}
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-brand-card-alt">
                  <step.icon size={18} className={step.color} />
                  <span className={`text-[10px] font-bold mt-0.5 ${step.color}`}>{step.number}</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-text">{step.title}</h3>
                <p className="mt-1.5 text-sm text-brand-text-secondary leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
