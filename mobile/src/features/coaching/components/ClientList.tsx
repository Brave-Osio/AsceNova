import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Flame } from 'lucide-react-native';
import { useCoachClients } from '../hooks/useCoachClients';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

const STREAK_COLOR = '#fb923c';

export default function ClientList() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { result, isLoading, isError, refetch, search, setSearch, page, setPage, pageSize } = useCoachClients();
  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return (
    <Card>
      <TextField label="Search" value={search} onChangeText={setSearch} placeholder="Username…" autoCorrect={false} />
      <Text style={styles.note}>
        You see progress and habit activity only — not weight, body measurements, notes, contact details or chats. Opening a client is
        recorded in the audit log.
      </Text>

      {isLoading ? (
        <ActivityIndicator style={styles.state} color={colors.primary} />
      ) : isError ? (
        <View style={styles.state}>
          <Text style={styles.error} accessibilityRole="alert">
            Couldn&apos;t load your clients. Try again in a moment.
          </Text>
          <Button variant="secondary" size="sm" fullWidth={false} onPress={() => void refetch()}>
            Retry
          </Button>
        </View>
      ) : !result || result.clients.length === 0 ? (
        <Text style={[styles.state, styles.empty]}>{search ? 'No clients match this search.' : 'No clients are assigned to you yet.'}</Text>
      ) : (
        <View style={styles.list}>
          {result.clients.map((c, i) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/coach-client?clientId=${encodeURIComponent(c.id)}`)}
              accessibilityRole="button"
              accessibilityLabel={`Open dashboard for ${c.username}`}
              style={({ pressed }) => [styles.row, i > 0 && styles.rowDivider, pressed && styles.rowPressed]}
            >
              <View style={styles.rowText}>
                <Text style={styles.username} numberOfLines={1}>
                  {c.username}
                </Text>
                <View style={styles.meta}>
                  <Text style={styles.metaText}>
                    {c.rank} · {c.totalXp.toLocaleString()} XP
                  </Text>
                  <View style={styles.streak}>
                    <Flame size={12} color={STREAK_COLOR} />
                    <Text style={styles.metaText}>{c.currentStreak}</Text>
                  </View>
                  <Text style={styles.metaText}>Last check-in {c.lastLogDate ?? 'never'}</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      )}

      {result && result.total > pageSize && (
        <View style={styles.pager}>
          <Text style={styles.metaText}>
            Page {page} of {totalPages} · {result.total} total
          </Text>
          <View style={styles.pagerButtons}>
            <Button variant="secondary" size="sm" fullWidth={false} disabled={page <= 1} onPress={() => setPage(page - 1)}>
              Prev
            </Button>
            <Button variant="secondary" size="sm" fullWidth={false} disabled={page >= totalPages} onPress={() => setPage(page + 1)}>
              Next
            </Button>
          </View>
        </View>
      )}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    note: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, marginTop: spacing.sm, lineHeight: 18 },
    state: { marginTop: spacing.lg, alignItems: 'center', gap: spacing.sm },
    empty: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, textAlign: 'center' },
    error: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14, textAlign: 'center' },
    list: { marginTop: spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm + 4, borderRadius: radius.md },
    rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    rowPressed: { backgroundColor: colors.cardAlt },
    rowText: { flex: 1, gap: 4 },
    username: { color: colors.textPrimary, fontSize: 15, fontFamily: fonts.semibold },
    meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.md, rowGap: 2 },
    metaText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium },
    streak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pager: { marginTop: spacing.md, gap: spacing.sm },
    pagerButtons: { flexDirection: 'row', gap: spacing.sm },
  });
}
