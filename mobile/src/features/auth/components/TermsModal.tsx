import { useMemo } from 'react';
import { Modal, View, Text, ScrollView, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import Button from '../../../components/ui/Button';
import { TERMS_LAST_UPDATED, TERMS_SECTIONS, TERMS_SUBTITLE, TERMS_TITLE, type TermsBlock } from '../../../constants/terms';
import { fonts, spacing, radius, typography, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

type Styles = ReturnType<typeof createStyles>;

function BulletList({ items, styles }: { items: string[]; styles: Styles }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.listRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** Mirrors the web's TermsContent block renderer: paragraph, titled list, or an amber "gap" callout. */
function Block({ block, colors, styles }: { block: TermsBlock; colors: ColorPalette; styles: Styles }) {
  if (block.kind === 'p') return <Text style={styles.text}>{block.text}</Text>;

  if (block.kind === 'gap') {
    return (
      <View style={styles.gap}>
        <View style={styles.gapTitleRow}>
          <AlertTriangle size={14} color="#fbbf24" />
          <Text style={styles.gapTitle}>{block.title}</Text>
        </View>
        <BulletList items={block.items} styles={styles} />
      </View>
    );
  }

  return (
    <View>
      {block.title ? <Text style={styles.listTitle}>{block.title}</Text> : null}
      <BulletList items={block.items} styles={styles} />
    </View>
  );
}

/** The full Terms body, from the same structured copy as the web's /terms page. */
export default function TermsModal({ visible, onClose }: TermsModalProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{TERMS_TITLE}</Text>
          <Text style={styles.subtitle}>
            {TERMS_SUBTITLE}. Last updated {TERMS_LAST_UPDATED}.
          </Text>
          <ScrollView style={styles.body} showsVerticalScrollIndicator>
            {TERMS_SECTIONS.map((section) => (
              <View key={section.id} style={styles.section}>
                <Text style={styles.heading}>{section.heading}</Text>
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} colors={colors} styles={styles} />
                ))}
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
      maxHeight: '90%',
      backgroundColor: colors.bg,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
    },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, marginTop: 4, marginBottom: spacing.md },
    body: { marginBottom: spacing.md },
    section: { marginBottom: spacing.lg, gap: spacing.sm + 4 },
    heading: { color: colors.textPrimary, fontSize: 15, fontFamily: fonts.bold },
    text: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 20 },
    listTitle: { color: colors.textPrimary, fontSize: 13, fontFamily: fonts.semibold, marginBottom: 4 },
    list: { gap: 6, marginTop: 4 },
    listRow: { flexDirection: 'row', gap: spacing.sm },
    bullet: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
    listText: { flex: 1, color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 20 },
    gap: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: 'rgba(245,158,11,0.3)',
      backgroundColor: 'rgba(245,158,11,0.1)',
      padding: spacing.md,
    },
    gapTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    gapTitle: { flex: 1, color: '#fbbf24', fontSize: 13, fontFamily: fonts.semibold },
  });
}
