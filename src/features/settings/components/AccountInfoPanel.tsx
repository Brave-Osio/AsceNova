import { useAuth } from '../../../context/AuthContext';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

export default function AccountInfoPanel() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Account</div>
      <div className="mt-2">
        <Row label="Email" value={user.email} />
        <Row label="Role" value={user.role ?? 'USER'} />
        {user.status && <Row label="Status" value={user.status} />}
        {user.createdAt && <Row label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />}
      </div>
    </div>
  );
}
