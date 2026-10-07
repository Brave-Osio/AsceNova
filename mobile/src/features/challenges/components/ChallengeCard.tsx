import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { useChallengeActions } from '../hooks/useChallengeActions';
import type { ChallengeInvite } from '../../../types/challenge.types';
import { fonts, spacing, radius, type ColorPalette } from '../../../theme';
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
    <Card>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.icon}>{invite.challenge.icon}</Text>
            <Text style={styles.title}>{invite.challenge.title}</Text>
          </View>
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
            <View key={p.id}>
              <View style={styles.participantHeader}>
                <Text style={styles.participantName}>{p.user.profile?.fullName ?? p.user.email}</Text>
                <Text style={styles.participantStat}>
                  {p.status === 'DECLINED'
                    ? 'Declined'
                    : p.status === 'INVITED'
                      ? 'Invited'
                      : `${Math.min(p.progressValue, invite.challenge.targetValue)}/${invite.challenge.targetValue}`}
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
          <Button size="sm" fullWidth={false} onPress={() => respond(invite.id, true)} loading={isPending}>
            Accept
          </Button>
          <Button size="sm" fullWidth={false} variant="ghost" onPress={() => respond(invite.id, false)} loading={isPending}>
            Decline
          </Button>
        </View>
      )}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm + 4 },
    headerText: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    icon: { fontSize: 18 },
    title: { flexShrink: 1, color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 15 },
    description: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, marginTop: 4 },
    badge: { backgroundColor: colors.primaryMuted, borderRadius: radius.full, paddingVertical: 2, paddingHorizontal: 8 },
    badgeExpired: { backgroundColor: colors.cardAlt },
    badgeText: { color: colors.primaryLight, fontSize: 12, fontFamily: fonts.semibold },
    badgeTextExpired: { color: colors.textMuted },
    participants: { marginTop: spacing.md, gap: spacing.sm },
    participantHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    participantName: { flexShrink: 1, color: colors.textSecondary, fontSize: 12, fontFamily: fonts.regular },
    participantStat: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular },
    progressTrack: { height: 6, backgroundColor: colors.cardAlt, borderRadius: radius.full, marginTop: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
    progressFillDone: { backgroundColor: '#10b981' },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  });
}
