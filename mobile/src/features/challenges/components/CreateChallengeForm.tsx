import { useMemo, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import OptionSelector from '../../../components/ui/OptionSelector';
import TagInput from '../../../components/ui/TagInput';
import Button from '../../../components/ui/Button';
import { useChallenges } from '../hooks/useChallenges';
import { useChallengeActions } from '../hooks/useChallengeActions';
import { spacing, radius, typography, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

/** Mirrors the web app's CreateChallengeForm.tsx. */
export default function CreateChallengeForm() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { catalog } = useChallenges();
  const { create, isCreating } = useChallengeActions();
  const [challengeId, setChallengeId] = useState('');
  const [usernames, setUsernames] = useState<string[]>([]);

  if (catalog.length === 0) return null;

  const options = catalog.map((c) => ({ value: c.id, label: `${c.icon} ${c.title}` }));

  async function handleSubmit() {
    if (!challengeId && catalog.length === 0) return;
    const ok = await create(challengeId || catalog[0].id, usernames);
    if (ok) setUsernames([]);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Start a Challenge</Text>
      <OptionSelector label="Challenge" value={challengeId || catalog[0].id} options={options} onChange={setChallengeId} />
      <TagInput label="Invite friends by username (optional)" value={usernames} onChange={setUsernames} placeholder="Type a username" />
      <Button onPress={handleSubmit} loading={isCreating}>Start Challenge</Button>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
    heading: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  });
}
