import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { fonts, spacing, radius, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

/** Mirrors the web app's TagInput.tsx — free-form chip entry, comma/submit commits. */
export default function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState('');

  function commit() {
    const trimmed = draft.trim().replace(/,$/, '');
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft('');
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {value.length > 0 && (
        <View style={styles.tags}>
          {value.map((tag, i) => (
            <Pressable key={tag} style={styles.tag} onPress={() => removeAt(i)}>
              <Text style={styles.tagText}>{tag}</Text>
              <X size={11} color={colors.primaryLight} strokeWidth={2.5} />
            </Pressable>
          ))}
        </View>
      )}
      <TextInput
        value={draft}
        onChangeText={(text) => {
          if (text.endsWith(',')) {
            setDraft(text);
            commit();
          } else {
            setDraft(text);
          }
        }}
        onSubmitEditing={commit}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { marginBottom: spacing.md },
    label: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium, marginBottom: spacing.xs + 2 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primaryMuted,
      borderRadius: radius.full,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm + 2,
    },
    tagText: { color: colors.primaryLight, fontSize: 12, fontFamily: fonts.semibold },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: fonts.regular,
    },
  });
}
