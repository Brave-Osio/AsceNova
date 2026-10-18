import { useMemo, useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { Send, Bot, User, Lightbulb, AlertCircle, RotateCw } from 'lucide-react-native';
import { SUGGESTED_QUESTIONS } from '../types';
import type { ChatMessage } from '../types';
import MarkdownText from '../../../components/MarkdownText';
import { fonts, spacing, radius, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

type Styles = ReturnType<typeof createStyles>;

function Bubble({ message, colors, styles }: { message: ChatMessage; colors: ColorPalette; styles: Styles }) {
  const isUser = message.sender === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={[styles.avatar, styles.avatarCoach]}>
          <Bot size={14} color={colors.primaryLight} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCoach]}>
        {isUser ? (
          <Text style={styles.bubbleTextUser}>{message.text}</Text>
        ) : (
          <MarkdownText text={message.text} style={styles.bubbleTextCoach} />
        )}
      </View>
      {isUser && (
        <View style={[styles.avatar, styles.avatarUser]}>
          <User size={14} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );
}

interface CoachChatProps {
  messages: ChatMessage[];
  isThinking: boolean;
  /** Message from the last failed request; cleared when a new request starts. */
  sendError: string | null;
  /** True when the newest message is the user's and no request is running, so a retry makes sense. */
  canRetry: boolean;
  sendMessage: (text: string) => Promise<void>;
  retry: () => Promise<void>;
}

/** The conversation UI. State lives in CoachPanel (mounted once in AppShell) so it survives opening and closing the panel. */
export default function CoachChat({ messages, isThinking, sendError, canRetry, sendMessage, retry }: CoachChatProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  async function handleSend(text?: string) {
    const toSend = text ?? input;
    if (!toSend.trim()) return;
    setInput('');
    await sendMessage(toSend);
    listRef.current?.scrollToEnd({ animated: true });
  }

  const showSuggestions = messages.length === 1;
  const canSend = !isThinking && input.trim().length > 0;

  const header = (
    <View style={styles.headerWrap}>
      <View style={styles.topics}>
        {['Workouts', 'Nutrition', 'Supplements', 'Recovery', 'XP & Ranks'].map((topic) => (
          <View key={topic} style={styles.topicChip}>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.flex}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Bubble message={item} colors={colors} styles={styles} />}
        ListHeaderComponent={header}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isThinking ? (
            <View style={styles.bubbleRow}>
              <View style={[styles.bubble, styles.bubbleCoach, styles.thinkingBubble]}>
                <Bot size={14} color={colors.textSecondary} />
                <View style={styles.dots}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>
              </View>
            </View>
          ) : sendError && canRetry ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <View style={styles.errorRow}>
                <AlertCircle size={16} color={colors.danger} />
                <Text style={styles.errorText}>{sendError}</Text>
              </View>
              <Pressable onPress={() => void retry()} accessibilityRole="button" style={styles.retryButton}>
                <RotateCw size={12} color={colors.danger} />
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null
        }
      />

      {showSuggestions && (
        <View style={styles.suggestionsWrap}>
          <View style={styles.tryRow}>
            <Lightbulb size={12} color={colors.textMuted} />
            <Text style={styles.tryText}>Try asking…</Text>
          </View>
          <View style={styles.suggestions}>
            {SUGGESTED_QUESTIONS.map((q) => (
              <Pressable
                key={q}
                style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
                onPress={() => handleSend(q)}
              >
                <Text style={styles.pillText}>{q}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask your coach anything…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <Pressable
          style={({ pressed }) => [styles.sendButton, !canSend && styles.sendDisabled, pressed && canSend && styles.sendPressed]}
          onPress={() => handleSend()}
          disabled={!canSend}
        >
          <Text style={styles.sendText}>Send</Text>
          <Send size={14} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    errorBox: {
      gap: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.35)',
      backgroundColor: 'rgba(248,113,113,0.1)',
      padding: spacing.md,
    },
    errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    errorText: { flex: 1, color: colors.danger, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19 },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.45)',
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    retryText: { color: colors.danger, fontSize: 12, fontFamily: fonts.bold },
    headerWrap: { marginBottom: spacing.sm },
    topics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: -spacing.xs },
    topicChip: { backgroundColor: colors.cardAlt, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 12 },
    topicText: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.semibold },
    messages: { paddingHorizontal: spacing.md + 4, paddingBottom: spacing.md, gap: spacing.sm + 4 },
    bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
    bubbleRowUser: { justifyContent: 'flex-end' },
    avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    avatarCoach: { backgroundColor: colors.primaryMuted },
    avatarUser: { backgroundColor: colors.cardAlt },
    bubble: { maxWidth: '78%', borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: spacing.md },
    bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm - 4 },
    bubbleCoach: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: radius.sm - 4 },
    bubbleTextUser: { color: '#fff', fontSize: 14, lineHeight: 22, fontFamily: fonts.regular },
    bubbleTextCoach: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, fontFamily: fonts.regular },
    thinkingBubble: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    dots: { flexDirection: 'row', gap: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textMuted },
    suggestionsWrap: { paddingHorizontal: spacing.md + 4, paddingBottom: spacing.sm, gap: spacing.sm },
    tryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    tryText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium, textTransform: 'uppercase', letterSpacing: 0.6 },
    suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    pill: { backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 14 },
    pillPressed: { backgroundColor: colors.surfaceAlt, borderColor: 'rgba(124,92,252,0.4)' },
    pillText: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.medium },
    inputRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md + 4, paddingTop: spacing.sm, paddingBottom: spacing.md },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: fonts.regular,
      color: colors.textPrimary,
    },
    sendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    sendDisabled: { opacity: 0.4 },
    sendPressed: { transform: [{ scale: 0.95 }] },
    sendText: { color: '#fff', fontSize: 14, fontFamily: fonts.bold },
  });
}
