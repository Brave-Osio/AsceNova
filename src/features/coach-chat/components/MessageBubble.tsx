import { motion } from 'framer-motion';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

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
        <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-sm">
          🤖
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'chat-user-bubble text-white rounded-br-md'
            : 'chat-coach-bubble text-gray-200 rounded-bl-md'
        }`}
      >
        {message.text}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm">
          👤
        </div>
      )}
    </motion.div>
  );
}
