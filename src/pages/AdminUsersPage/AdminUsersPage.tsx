import UserTable from '../../features/admin/components/UserTable';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminUsersPage() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Admin" title="Users" description="Administrators, coaches and regular accounts. Suspend, reactivate and manage roles." />
      <div className="mt-8">
        <UserTable />
      </div>
    </PageContainer>
  );
}
