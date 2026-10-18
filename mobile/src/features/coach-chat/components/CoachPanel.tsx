import { useMemo } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bot, X } from 'lucide-react-native';
import CoachChat from './CoachChat';
import { useCoachChat } from '../hooks/useCoachChat';
import { useCoachPanel } from '../CoachPanelContext';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

/**
 * The AI coach as a floating panel instead of a tab (mirrors the web's CoachPanel). Mounted once in
 * AppShell, so the conversation and any in-flight request survive opening, closing and navigating.
 */
export default function CoachPanel() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { isOpen, close } = useCoachPanel();
  const chat = useCoachChat();

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={close} presentationStyle="fullScreen">
      <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]} behavior="padding">
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Bot size={16} color={colors.primaryLight} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>AI Fitness Coach</Text>
            <Text style={styles.subtitle}>Online · Answers instantly · Knows your goals</Text>
          </View>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close AI coach chat" style={styles.closeButton}>
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
        <CoachChat
          messages={chat.messages}
          isThinking={chat.isThinking}
          sendError={chat.sendError}
          canRetry={chat.canRetry}
          sendMessage={chat.sendMessage}
          retry={chat.retry}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryMuted,
    },
    titleBlock: { flex: 1 },
    title: { color: colors.textPrimary, fontSize: 15, fontFamily: fonts.bold },
    subtitle: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardAlt,
    },
  });
}
