import { useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { fonts, radius, spacing, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

function useControlStyles() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

/** Mirrors the web's HideButton: footer row for a card — Hide when visible, Unhide when shown via "Show hidden". */
export function HideButton({ isHidden, onHide, onUnhide }: { isHidden: boolean; onHide: () => void; onUnhide: () => void }) {
  const { colors, styles } = useControlStyles();
  const Icon = isHidden ? Eye : EyeOff;
  return (
    <View style={styles.footer}>
      <Pressable
        onPress={isHidden ? onUnhide : onHide}
        accessibilityRole="button"
        accessibilityLabel={isHidden ? 'Unhide' : 'Hide'}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        hitSlop={6}
      >
        <Icon size={13} color={colors.textMuted} />
        <Text style={styles.buttonText}>{isHidden ? 'Unhide' : 'Hide'}</Text>
      </Pressable>
    </View>
  );
}

/** Mirrors the web's ShowHiddenToggle: "Show hidden (n)" / "Hide hidden" switch for a list; renders nothing when none are hidden. */
export function ShowHiddenToggle({ count, showing, onToggle }: { count: number; showing: boolean; onToggle: () => void }) {
  const { colors, styles } = useControlStyles();
  if (count === 0) return null;
  const Icon = showing ? EyeOff : Eye;
  return (
    <View style={styles.toggleRow}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ selected: showing }}
        style={({ pressed }) => [styles.button, styles.toggle, pressed && styles.pressed]}
      >
        <Icon size={13} color={colors.textMuted} />
        <Text style={styles.buttonText}>{showing ? 'Hide hidden' : `Show hidden (${count})`}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    footer: {
      marginTop: spacing.md,
      paddingTop: spacing.sm + 4,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    toggleRow: { flexDirection: 'row', justifyContent: 'flex-end' },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: radius.full,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    toggle: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
    pressed: { backgroundColor: colors.cardAlt },
    buttonText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium },
  });
}
