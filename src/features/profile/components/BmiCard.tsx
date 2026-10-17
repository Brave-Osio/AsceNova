import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { ROUTES } from '../../../constants/routes';
import type { BmiCategory } from '../../../types/profile.types';

const CATEGORY: Record<BmiCategory, { label: string; tone: string; explanation: string }> = {
  UNDERWEIGHT: {
    label: 'Underweight',
    tone: 'bg-sky-500/15 text-sky-300 light:text-sky-700',
    explanation: 'Your BMI is below 18.5, which is in the underweight range for adults.',
  },
  NORMAL: {
    label: 'Normal weight',
    tone: 'bg-emerald-500/15 text-emerald-300 light:text-emerald-700',
    explanation: 'Your BMI is between 18.5 and 24.9, which is in the normal weight range for adults.',
  },
  OVERWEIGHT: {
    label: 'Overweight',
    tone: 'bg-amber-500/15 text-amber-300 light:text-amber-700',
    explanation: 'Your BMI is between 25 and 29.9, which is in the overweight range for adults.',
  },
  OBESE: {
    label: 'Obesity',
    tone: 'bg-red-500/15 text-red-300 light:text-red-700',
    explanation: 'Your BMI is 30 or above, which is in the obesity range for adults.',
  },
};

/**
 * Body Mass Index from the profile's current height and weight. The API computes it on every read
 * (kg / m²), so it always matches the saved profile — nothing is stored or cached separately.
 */
export default function BmiCard() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return <div className="card h-40 animate-pulse rounded-2xl" aria-busy="true" aria-label="Loading BMI" />;
  }

  const bmi = profile?.bmi ?? null;
  const category = bmi ? CATEGORY[bmi.category] : null;

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-text-muted">
        <Activity size={14} /> Body Mass Index
      </div>

      {bmi && category && profile ? (
        <>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <span className="text-4xl font-black leading-none text-brand-text" aria-label={`BMI ${bmi.value}`}>
              {bmi.value.toFixed(1)}
            </span>
            <span className={`chip px-2.5 py-1 text-xs font-semibold ${category.tone}`}>{category.label}</span>
          </div>
          <p className="mt-3 text-sm text-brand-text-secondary">{category.explanation}</p>
          <p className="mt-2 text-xs text-brand-text-muted">
            Based on your profile: {profile.heightCm} cm and {profile.currentWeightKg} kg. It updates when you save changes to either.
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-brand-text-secondary">
          Add a valid height and weight in your profile to see your BMI.{' '}
          <Link to={ROUTES.settings} className="font-semibold text-brand-primary-light underline">
            Complete your profile
          </Link>
        </p>
      )}

      <p className="mt-3 border-t border-brand-border pt-3 text-xs text-brand-text-muted">
        BMI is a general screening measure. It doesn't measure body fat or give a complete picture of your health, so talk to a
        healthcare professional about your individual situation.
      </p>
    </div>
  );
}
