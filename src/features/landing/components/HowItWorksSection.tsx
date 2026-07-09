import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    icon: '👤',
    title: 'Set up your profile',
    description: 'Tell us your goal, fitness level, and equipment access in under 60 seconds.',
    color: 'text-violet-400',
  },
  {
    number: '02',
    icon: '📋',
    title: 'Get your AI plan',
    description: 'Receive a full workout split and personalized nutrition targets — calories, protein, carbs, fat, sodium.',
    color: 'text-cyan-400',
  },
  {
    number: '03',
    icon: '📝',
    title: 'Log daily habits',
    description: 'Check off workouts, water, protein, sleep, and steps every day to earn XP.',
    color: 'text-amber-400',
  },
  {
    number: '04',
    icon: '🚀',
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
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-gray-400 mb-5">
            The Process
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            How it <span className="text-gradient-cyan">works</span>
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
              className="group relative flex gap-5 rounded-2xl border border-white/8 bg-white/4 p-6 card-hover"
            >
              {/* Step number */}
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <span className="text-xl leading-none">{step.icon}</span>
                  <span className={`text-[10px] font-bold mt-0.5 ${step.color}`}>{step.number}</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </div>
              {/* Connector line for sm+ */}
              {index < 3 && (
                <div className="absolute -bottom-2 left-6 hidden h-4 w-px bg-gradient-to-b from-white/10 to-transparent sm:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
