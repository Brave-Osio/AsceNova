import { useState, useRef, useEffect } from 'react';
import { Lightbulb, Send, Bot, AlertCircle, RotateCw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { SUGGESTED_QUESTIONS } from '../types';
import type { UseCoachChat } from '../hooks/useCoachChat';

interface ChatWindowProps {
  chat: UseCoachChat;
}

/** Fills its parent (the side panel): scrolling message list, suggestions, input. */
export default function ChatWindow({ chat }: ChatWindowProps) {
  const { messages, isThinking, sendError, canRetry, sendMessage, retry } = chat;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isThinking, sendError]);

  // Mounted only while the panel is open, so this focuses the input on open.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    void sendMessage(input);
    setInput('');
  }

  const hasOnlyWelcomeMessage = messages.length === 1 && messages[0].id === 'welcome';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation with your AI coach"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isThinking && (
          <div className="flex justify-start" role="status" aria-label="Coach is typing">
            <div className="flex items-center gap-2 rounded-2xl chat-coach-bubble px-4 py-3 text-sm text-brand-text-secondary">
              <Bot size={14} />
              <span className="flex gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-brand-text-muted animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        {sendError && canRetry && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 light:text-red-700"
          >
            <span className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {sendError}
            </span>
            <button
              type="button"
              onClick={() => void retry()}
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1 text-xs font-bold transition-colors hover:bg-red-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
            >
              <RotateCw size={12} /> Retry
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 border-t border-brand-border p-4">
        {hasOnlyWelcomeMessage && (
          <div className="mb-3 space-y-2">
            <p className="flex items-center gap-1.5 px-0.5 text-xs font-medium uppercase tracking-wide text-brand-text-muted">
              <Lightbulb size={12} /> Try asking
            </p>
            <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
              {SUGGESTED_QUESTIONS.slice(0, 6).map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void sendMessage(question)}
                  disabled={isThinking}
                  className="suggestion-pill rounded-full px-3 py-1.5 text-xs font-medium text-brand-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
            aria-label="Message your coach"
            placeholder="Ask your coach anything"
            className="min-w-0 flex-1 rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text transition-all placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            aria-label="Send message"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
