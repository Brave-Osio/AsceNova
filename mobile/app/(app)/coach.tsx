import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useCoachChat } from '../../src/features/coach-chat/hooks/useCoachChat';
import { SUGGESTED_QUESTIONS } from '../../src/features/coach-chat/types';
import type { ChatMessage } from '../../src/features/coach-chat/types';
import MarkdownText from '../../src/components/MarkdownText';
import { colors, spacing, radius, typography } from '../../src/theme';

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCoach]}>
        {isUser ? (
          <Text style={styles.bubbleTextUser}>{message.text}</Text>
        ) : (
          <MarkdownText text={message.text} style={styles.bubbleTextCoach} />
        )}
      </View>
    </View>
  );
}

export default function CoachScreen() {
  const { messages, isThinking, sendMessage } = useCoachChat();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  async function handleSend(text?: string) {
    const toSend = text ?? input;
    if (!toSend.trim()) return;
    setInput('');
    await sendMessage(toSend);
    listRef.current?.scrollToEnd({ animated: true });
  }

  const showSuggestions = messages.length === 1;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Text style={styles.title}>AI Coach</Text>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Bubble message={item} />}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {showSuggestions && (
        <View style={styles.suggestions}>
          {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
            <Pressable key={q} style={styles.chip} onPress={() => handleSend(q)}>
              <Text style={styles.chipText}>{q}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {isThinking && (
        <View style={styles.thinkingRow}>
          <ActivityIndicator size="small" color={colors.violetLight} />
          <Text style={styles.thinkingText}>Coach is thinking…</Text>
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
        <Pressable style={styles.sendButton} onPress={() => handleSend()}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h2, color: colors.textPrimary, padding: spacing.lg, paddingBottom: spacing.sm },
  messages: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xs },
  bubbleUser: { backgroundColor: colors.violet },
  bubbleCoach: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  bubbleTextUser: { color: '#fff', fontSize: 14 },
  bubbleTextCoach: { color: colors.textPrimary, fontSize: 14 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: spacing.sm },
  chipText: { color: colors.textSecondary, fontSize: 12 },
  thinkingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.xs },
  thinkingText: { color: colors.textMuted, fontSize: 12 },
  inputRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  sendButton: { backgroundColor: colors.violet, borderRadius: radius.sm, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
