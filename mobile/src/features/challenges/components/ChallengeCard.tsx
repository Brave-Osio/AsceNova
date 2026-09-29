import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import { useChallengeActions } from '../hooks/useChallengeActions';
import type { ChallengeInvite } from '../../../types/challenge.types';
import { spacing, radius, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

function daysLeft(periodEnd: string): number {
  return Math.max(0, Math.ceil((new Date(periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

/** Mirrors the web app's ChallengeCard.tsx. */
export default function ChallengeCard({ invite }: { invite: ChallengeInvite }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const { respond, pendingInviteId } = useChallengeActions();

  const mine = invite.participants.find((p) => p.userId === user?.id);
  const isPending = pendingInviteId === invite.id;
  const expired = invite.status === 'EXPIRED';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{invite.challenge.icon} {invite.challenge.title}</Text>
          <Text style={styles.description}>{invite.challenge.description}</Text>
        </View>
        <View style={[styles.badge, expired && styles.badgeExpired]}>
          <Text style={[styles.badgeText, expired && styles.badgeTextExpired]}>
            {expired ? 'Ended' : `${daysLeft(invite.periodEnd)}d left`}
          </Text>
        </View>
      </View>

      <View style={styles.participants}>
        {invite.participants.map((p) => {
          const pct = Math.min(100, Math.round((p.progressValue / invite.challenge.targetValue) * 100));
          return (
            <View key={p.id} style={styles.participantRow}>
              <View style={styles.participantHeader}>
                <Text style={styles.participantName}>{p.user.profile?.fullName ?? p.user.email}</Text>
                <Text style={styles.participantStat}>
                  {p.status === 'DECLINED' ? 'Declined' : p.status === 'INVITED' ? 'Invited' : `${p.progressValue}/${invite.challenge.targetValue}`}
                </Text>
              </View>
              {p.status === 'ACCEPTED' && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, p.completedAt && styles.progressFillDone, { width: `${pct}%` }]} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {mine?.status === 'INVITED' && !expired && (
        <View style={styles.actions}>
          <Button onPress={() => respond(invite.id, true)} loading={isPending}>Accept</Button>
          <Button variant="ghost" onPress={() => respond(invite.id, false)} loading={isPending}>Decline</Button>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
    headerText: { flex: 1 },
    title: { color: colors.textPrimary, fontWeight: '700', fontSize: 15 },
    description: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
    badge: { backgroundColor: colors.primaryMuted, borderRadius: radius.sm, paddingVertical: 2, paddingHorizontal: spacing.sm, alignSelf: 'flex-start' },
    badgeExpired: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
    badgeText: { color: colors.primaryLight, fontSize: 11, fontWeight: '600' },
    badgeTextExpired: { color: colors.textMuted },
    participants: { marginTop: spacing.sm, gap: spacing.sm },
    participantRow: {},
    participantHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    participantName: { color: colors.textSecondary, fontSize: 12 },
    participantStat: { color: colors.textMuted, fontSize: 12 },
    progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
    progressFillDone: { backgroundColor: colors.success },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  });
}
