import AchievementEditor from '../../features/admin/components/AchievementEditor';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminAchievementsPage() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Admin" title="Achievements" description="Edit achievement titles, descriptions and XP rewards." />
      <div className="mt-8">
        <AchievementEditor />
      </div>
    </PageContainer>
  );
}
