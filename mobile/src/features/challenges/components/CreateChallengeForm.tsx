import { useState } from 'react';
import { StyleSheet } from 'react-native';
import ChallengePicker from './ChallengePicker';
import TagInput from '../../../components/ui/TagInput';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { SectionLabel } from '../../../components/ui/PageHeader';
import { useChallenges } from '../hooks/useChallenges';
import { useChallengeActions } from '../hooks/useChallengeActions';
import { spacing } from '../../../theme';

/** Mirrors the web app's CreateChallengeForm.tsx. */
export default function CreateChallengeForm() {
  const { catalog } = useChallenges();
  const { create, isCreating } = useChallengeActions();
  const [challengeId, setChallengeId] = useState('');
  const [usernames, setUsernames] = useState<string[]>([]);

  if (catalog.length === 0) return null;

  async function handleSubmit() {
    if (!challengeId && catalog.length === 0) return;
    const ok = await create(challengeId || catalog[0].id, usernames);
    if (ok) setUsernames([]);
  }

  return (
    <Card style={styles.card}>
      <SectionLabel>Start a Challenge</SectionLabel>
      <ChallengePicker label="Challenge" catalog={catalog} value={challengeId || catalog[0].id} onChange={setChallengeId} />
      <TagInput label="Invite friends by username (optional)" value={usernames} onChange={setUsernames} placeholder="Type a username, press Enter" />
      <Button fullWidth={false} onPress={handleSubmit} loading={isCreating}>
        Start Challenge
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
});
