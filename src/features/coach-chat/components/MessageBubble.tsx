import { motion } from 'framer-motion';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Gemini replies come back as Markdown (bold, bullet lists, paragraph
 * breaks) — these overrides restyle react-markdown's default elements to
 * fit the chat bubble instead of relying on browser/Tailwind defaults.
 */
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-brand-text">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-brand-primary-light underline">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="rounded bg-brand-card-alt px-1 py-0.5 text-xs">{children}</code>,
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Coach avatar */}
      {!isUser && (
        <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary-light">
          <Bot size={14} />
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'chat-user-bubble text-white rounded-br-md'
            : 'chat-coach-bubble text-brand-text-secondary rounded-bl-md'
        }`}
      >
        {isUser ? (
          message.text
        ) : (
          <ReactMarkdown components={markdownComponents}>{message.text}</ReactMarkdown>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-card-alt text-brand-text-secondary">
          <User size={14} />
        </div>
      )}
    </motion.div>
  );
}
