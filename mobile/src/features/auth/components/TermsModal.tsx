import { useMemo } from 'react';
import { Modal, View, Text, ScrollView, StyleSheet } from 'react-native';
import Button from '../../../components/ui/Button';
import { TERMS_SECTIONS, TERMS_TITLE } from '../../../constants/terms';
import { fonts, spacing, radius, typography, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsModal({ visible, onClose }: TermsModalProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{TERMS_TITLE}</Text>
          <ScrollView style={styles.body}>
            {TERMS_SECTIONS.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={styles.heading}>{section.heading}</Text>
                <Text style={styles.text}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
          <Button onPress={onClose}>Close</Button>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: {
      maxHeight: '85%',
      backgroundColor: colors.bg,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
    },
    title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.md },
    body: { marginBottom: spacing.md },
    section: { marginBottom: spacing.md },
    heading: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold, marginBottom: 4 },
    text: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  });
}
