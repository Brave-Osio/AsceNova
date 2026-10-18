import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ClientDashboardView from '../../features/coaching/components/ClientDashboardView';
import { useClientDashboard } from '../../features/coaching/hooks/useClientDashboard';
import { ROUTES } from '../../constants/routes';

export default function CoachClientPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { dashboard, isLoading, isError } = useClientDashboard(clientId ?? '');

  return (
    <PageContainer>
      <Link to={ROUTES.coach} className="flex items-center gap-1 text-xs text-brand-text-muted hover:text-brand-text-secondary">
        <ArrowLeft size={12} /> Back to clients
      </Link>

      {isLoading ? (
        <p className="mt-10 text-center text-brand-text-muted" role="status">
          Loading…
        </p>
      ) : isError || !dashboard ? (
        <p className="mt-10 text-center text-red-400 light:text-red-700" role="alert">
          This client couldn&apos;t be found, or isn&apos;t assigned to you.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-brand-text-muted/80">Client dashboard</p>
            <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">{dashboard.client.username}</h1>
            <p className="mt-1 text-xs text-brand-text-muted">
              Member since {new Date(dashboard.client.memberSince).toLocaleDateString()} · read-only view, recorded in the audit log
            </p>
          </div>
          <ClientDashboardView dashboard={dashboard} />
        </>
      )}
    </PageContainer>
  );
}
