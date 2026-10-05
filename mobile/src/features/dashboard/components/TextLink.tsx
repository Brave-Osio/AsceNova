import { useMemo } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { router, type Href } from 'expo-router';
import { fonts, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

/** The web's small bold primary-light links ("View full plan →"). */
export default function TextLink({ href, children, arrow = true }: { href: Href; children: string; arrow?: boolean }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={() => router.push(href)} style={styles.row} hitSlop={8}>
      <Text style={styles.text}>{children}</Text>
      {arrow && <ArrowRight size={12} color={colors.primaryLight} />}
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
    text: { fontFamily: fonts.bold, fontSize: 12, color: colors.primaryLight },
  });
}
