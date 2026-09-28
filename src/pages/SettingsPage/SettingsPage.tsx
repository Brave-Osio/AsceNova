import AccountInfoPanel from '../../features/settings/components/AccountInfoPanel';
import ChangePasswordForm from '../../features/settings/components/ChangePasswordForm';
import ProfileSetupForm from '../../features/profile/components/ProfileSetupForm';

function SectionHeading({ children }: { children: string }) {
  return <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-primary-light">{children}</h2>;
}

export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-semibold text-brand-text">Settings</h1>
      <p className="mt-2 text-brand-text-secondary">Manage your account, profile, and security.</p>

      <div className="mt-8">
        <AccountInfoPanel />
      </div>

      <div className="card mt-6 rounded-2xl p-5">
        <SectionHeading>Edit Profile</SectionHeading>
        <ProfileSetupForm submitLabel="Save Changes" redirectOnSave={false} />
      </div>

      <div className="card mt-6 rounded-2xl p-5">
        <SectionHeading>Change Password</SectionHeading>
        <ChangePasswordForm />
      </div>
    </section>
  );
}
