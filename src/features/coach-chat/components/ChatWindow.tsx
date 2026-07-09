import { useState, useRef, useEffect } from 'react';
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
      <div className="relative flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-5 min-h-[320px] max-h-[520px] overflow-y-auto">
        {/* Fade top */}
        <div className="pointer-events-none sticky top-0 -mt-4 mb-1 h-6 bg-gradient-to-b from-[#0a0d14] to-transparent" />

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl chat-coach-bubble px-4 py-3 text-sm text-gray-400">
              <span>🤖</span>
              <span className="flex gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce"
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
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide px-0.5">
            💡 Try asking…
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="suggestion-pill rounded-full px-3.5 py-1.5 text-xs text-gray-300 font-medium"
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
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40 transition-all"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isThinking || !input.trim()}
          className="flex-shrink-0 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          Send ↑
        </button>
      </div>
    </div>
  );
}
