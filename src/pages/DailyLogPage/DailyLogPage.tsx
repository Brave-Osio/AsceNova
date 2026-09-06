import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { ROUTES } from '../../constants/routes';
import DailyLogForm from '../../features/daily-log/components/DailyLogForm';

export default function DailyLogPage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return null;

  if (!profile) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-white/8 bg-white/4 p-12">
          <span className="text-5xl">📝</span>
          <h1 className="mt-4 text-2xl font-bold text-white">No profile yet</h1>
          <p className="mt-2 text-gray-400">Set up your profile before logging a day.</p>
          <Link
            to={ROUTES.setup}
            className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors"
          >
            Set Up Profile →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-xl px-4 py-12 sm:py-16">
      <div className="orb w-72 h-72 bg-violet-600/10 -top-16 right-0" />
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 mb-3">
          📝 Daily Check-In
        </span>
        <h1 className="text-3xl font-extrabold text-white">Daily Log</h1>
        <p className="mt-1.5 text-gray-400">Log today's progress to keep your streak alive.</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-8"
      >
        <DailyLogForm />
      </motion.div>
    </section>
  );
}
