import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { colors, spacing, radius } from '../../theme';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

/** Mirrors the web app's TagInput.tsx — free-form chip entry, comma/submit commits. */
export default function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
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
              <Text style={styles.tagText}>{tag} ✕</Text>
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

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs },
  tag: { backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: spacing.sm },
  tagText: { color: colors.violetLight, fontSize: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
  },
});
