import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bot, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getChatHistory } from '../../../services/coachService';
import { queryKeys } from '../../../lib/queryKeys';
import { ROUTES } from '../../../constants/routes';

/**
 * Coach messages are Markdown (bold, bullet lists — see MessageBubble.tsx,
 * which renders them properly via react-markdown). A block-level markdown
 * render doesn't `line-clamp` cleanly here since this is a short truncated
 * teaser, not the full chat, so this strips the syntax down to flowing
 * plain text instead of showing literal `**`/`*` characters.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Reuses the same query key useCoachChat uses, so if /coach was already
 * visited this session the cache is shared and this loads instantly —
 * no new Gemini call, just surfacing the last real exchange.
 */
export default function CoachTeaserCard() {
  const { user } = useAuth();
  const { data: messages, isLoading } = useQuery({
    queryKey: queryKeys.coach.history(user?.id ?? ''),
    queryFn: getChatHistory,
    enabled: !!user?.id,
  });

  if (isLoading) return null;

  const lastCoachMessage = [...(messages ?? [])].reverse().find((m) => m.sender === 'coach');

  return (
    <div className="card h-full rounded-2xl p-5 flex flex-col">
      <div className="flex items-center gap-2">
        <Bot size={16} className="text-brand-primary-light" />
        <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">AI Coach</span>
      </div>
      <div className="mt-3 flex-1">
        {lastCoachMessage ? (
          <p className="line-clamp-4 text-sm leading-relaxed text-brand-text-secondary">
            {stripMarkdown(lastCoachMessage.text)}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-brand-text-muted">
            Ask your coach anything about training, recovery, or your progress.
          </p>
        )}
      </div>
      <Link
        to={ROUTES.coach}
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-primary-light hover:text-white"
      >
        Continue chatting <ArrowRight size={12} />
      </Link>
    </div>
  );
}
