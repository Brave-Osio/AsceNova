import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NotebookPen } from 'lucide-react';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { ROUTES } from '../../constants/routes';
import PageHeader from '../../components/ui/PageHeader';
import DailyLogForm from '../../features/daily-log/components/DailyLogForm';
import ScheduledWorkoutCard from '../../features/workouts/components/ScheduledWorkoutCard';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import { toDateString } from '../../utils/dateUtils';
import PageContainer from '../../components/layout/PageContainer';

export default function DailyLogPage() {
  const { data: profile, isLoading } = useProfile();
  const { today, selectedDate, setSelectedDate } = useSelectedDate();
  const earliest = toDateString(new Date(new Date(`${today}T00:00:00`).getTime() - 7 * 24 * 60 * 60 * 1000));

  if (isLoading) return null;

  if (!profile) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card rounded-3xl p-12">
          <NotebookPen size={40} className="mx-auto text-brand-text-muted" />
          <h1 className="mt-4 text-2xl font-bold text-brand-text">No profile yet</h1>
          <p className="mt-2 text-brand-text-secondary">Set up your profile before logging a day.</p>
          <Link
            to={ROUTES.setup}
            className="mt-6 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-bold text-white hover:bg-brand-primary-light transition-colors"
          >
            Set Up Profile
          </Link>
        </div>
      </section>
    );
  }

  return (
    <PageContainer>
      <PageHeader eyebrow="Daily Check-In" title="Daily Log" description="See your scheduled workout, mark it done, and log today's progress to keep your streak alive." />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mt-8 space-y-4"
      >
        <label className="block max-w-xs">
          <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">Workout day</span>
          <input
            type="date"
            value={selectedDate}
            min={earliest}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value && e.target.value !== today ? e.target.value : null)}
            className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
          />
        </label>
        <ScheduledWorkoutCard date={selectedDate} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-8"
      >
        <DailyLogForm date={selectedDate} isToday={selectedDate === today} />
      </motion.div>
    </PageContainer>
  );
}
