import { useAuth } from '../../../context/AuthContext';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-border py-2 text-sm last:border-0">
      <span className="text-brand-text-muted">{label}</span>
      <span className="font-semibold text-brand-text">{value}</span>
    </div>
  );
}

export default function AccountInfoPanel() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="card rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Account</div>
      <div className="mt-2">
        <Row label="Email" value={user.email} />
        <Row label="Role" value={user.role ?? 'USER'} />
        {user.status && <Row label="Status" value={user.status} />}
        {user.createdAt && <Row label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />}
      </div>
    </div>
  );
}
