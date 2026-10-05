import { useMemo, useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { Send, Bot, User, Lightbulb } from 'lucide-react-native';
import { useCoachChat } from '../../src/features/coach-chat/hooks/useCoachChat';
import { SUGGESTED_QUESTIONS } from '../../src/features/coach-chat/types';
import type { ChatMessage } from '../../src/features/coach-chat/types';
import MarkdownText from '../../src/components/MarkdownText';
import PageHeader from '../../src/components/ui/PageHeader';
import { fonts, spacing, radius, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

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

export default function CoachScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { messages, isThinking, sendMessage } = useCoachChat();
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
      <PageHeader title="AI Fitness Coach" subtitle="Online · Answers instantly · Knows your goals" />
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
