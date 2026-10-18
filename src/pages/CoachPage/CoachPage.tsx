import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import ClientTable from '../../features/coaching/components/ClientTable';
import { useAuth } from '../../context/AuthContext';

export default function CoachPage() {
  const { isAdmin } = useAuth();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Coach"
        title="Clients"
        description={
          isAdmin
            ? 'As an administrator you can open any account. Coaches only see the clients assigned to them.'
            : 'Check in on the progress of the clients assigned to you.'
        }
      />
      <div className="mt-6">
        <ClientTable />
      </div>
    </PageContainer>
  );
}
