import { useState, useRef, useEffect } from 'react';
import { Lightbulb, Send, Bot } from 'lucide-react';
import { useCoachChat } from '../hooks/useCoachChat';
import MessageBubble from './MessageBubble';
import { SUGGESTED_QUESTIONS } from '../types';

export default function ChatWindow() {
  const { messages, isThinking, sendMessage } = useCoachChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const hasOnlyWelcomeMessage = messages.length === 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Message window */}
      <div className="relative flex flex-col gap-3 card rounded-2xl p-4 sm:p-5 min-h-[320px] max-h-[520px] overflow-y-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isThinking && (
          <div className="flex justify-start">
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
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {hasOnlyWelcomeMessage && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs text-brand-text-muted font-medium uppercase tracking-wide px-0.5">
            <Lightbulb size={12} /> Try asking…
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="suggestion-pill rounded-full px-3.5 py-1.5 text-xs text-brand-text-secondary font-medium"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your coach anything…"
          className="flex-1 rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-sm text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/60 transition-all"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isThinking || !input.trim()}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primary-light disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          Send <Send size={14} />
        </button>
      </div>
    </div>
  );
}
