import ProfileSetupForm from '../../features/profile/components/ProfileSetupForm';

export default function ProfileSetupPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-semibold text-white">Profile Setup</h1>
      <p className="mt-2 text-gray-400">
        Tell us a bit about yourself so we can build your plan.
      </p>
      <div className="mt-8">
        <ProfileSetupForm />
      </div>
    </section>
  );
}
