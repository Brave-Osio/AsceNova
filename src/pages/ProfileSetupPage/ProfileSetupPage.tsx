import ProfileSetupForm from '../../features/profile/components/ProfileSetupForm';

export default function ProfileSetupPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-semibold text-brand-text">Profile Setup</h1>
      <p className="mt-2 text-brand-text-secondary">
        Tell us a bit about yourself so we can build your plan.
      </p>
      <div className="mt-8">
        <ProfileSetupForm />
      </div>
    </section>
  );
}
