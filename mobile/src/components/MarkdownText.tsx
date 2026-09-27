import { Text, type TextStyle } from 'react-native';

const BOLD_PATTERN = /(\*\*[^*]+\*\*)/g;

/**
 * Coach replies come back as Markdown (Gemini's default output style) —
 * this renders `**bold**` spans as actual bold text instead of showing
 * the literal asterisks, without pulling in a full markdown-rendering
 * library. Mirrors the web app's react-markdown fix (MessageBubble.tsx)
 * at a scope matched to what's actually been reported (bold only) — the
 * web version also handles bullet lists/links/code, which nothing here
 * has surfaced a need for yet.
 */
export default function MarkdownText({ text, style }: { text: string; style?: TextStyle }) {
  const segments = text.split(BOLD_PATTERN).filter((s) => s.length > 0);

  return (
    <Text style={style}>
      {segments.map((segment, i) => {
        const boldMatch = segment.match(/^\*\*(.+)\*\*$/s);
        return boldMatch ? (
          <Text key={i} style={{ fontWeight: '700' }}>
            {boldMatch[1]}
          </Text>
        ) : (
          segment
        );
      })}
    </Text>
  );
}
