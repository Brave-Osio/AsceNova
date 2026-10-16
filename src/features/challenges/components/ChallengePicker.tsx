import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ChallengePreviewCard from './ChallengePreviewCard';
import { MOTION_DURATION, MOTION_EASE } from '../../../lib/motion';
import type { ChallengeTemplate } from '../../../types/challenge.types';

interface ChallengePickerProps {
  label: string;
  catalog: ChallengeTemplate[];
  value: string;
  onChange: (id: string) => void;
}

const POPOVER_WIDTH = 288; // 18rem
const POPOVER_EST_HEIGHT = 230;
const EDGE = 8;

interface PopoverState {
  challengeId: string;
  top: number;
  left: number;
  width: number;
  above: boolean;
}

/**
 * Challenge selection pills with an informative preview. Hovering (mouse) or
 * keyboard-focusing a pill opens a popover with that challenge's real details;
 * the popover is pointer-events-none so it can never block a control. Touch has
 * no hover, so the selected challenge's details are also always shown in a panel
 * under the pills: tapping a pill selects it and reveals the same information.
 */
export default function ChallengePicker({ label, catalog, value, onChange }: ChallengePickerProps) {
  const popoverId = useId();
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const selected = catalog.find((c) => c.id === value) ?? catalog[0];
  const previewed = popover ? catalog.find((c) => c.id === popover.challengeId) : undefined;

  // Placed below the pill unless there is more room above; clamped inside the viewport horizontally.
  function open(el: HTMLElement, challengeId: string) {
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < POPOVER_EST_HEIGHT + 16 && rect.top > spaceBelow;
    const width = Math.min(POPOVER_WIDTH, window.innerWidth - EDGE * 2);
    const left = Math.min(Math.max(EDGE, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - EDGE);
    setPopover({ challengeId, left, width, above, top: above ? rect.top - 8 : rect.bottom + 8 });
  }
  const close = () => setPopover(null);

  return (
    <div>
      <span id={`${popoverId}-label`} className="mb-1.5 block text-sm font-medium text-brand-text-secondary">
        {label}
      </span>
      <div role="group" aria-labelledby={`${popoverId}-label`} className="flex flex-wrap gap-2">
        {catalog.map((challenge) => {
          const isSelected = challenge.id === selected.id;
          return (
            <button
              key={challenge.id}
              type="button"
              aria-pressed={isSelected}
              aria-describedby={popover?.challengeId === challenge.id ? `${popoverId}-popover` : undefined}
              onClick={() => onChange(challenge.id)}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') open(e.currentTarget, challenge.id);
              }}
              onPointerLeave={close}
              onFocus={(e) => {
                if (e.currentTarget.matches(':focus-visible')) open(e.currentTarget, challenge.id);
              }}
              onBlur={close}
              onKeyDown={(e) => {
                if (e.key === 'Escape') close();
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-brand-border bg-brand-card text-brand-text-secondary hover:-translate-y-px hover:border-brand-primary/40 hover:text-brand-text'
              }`}
            >
              {challenge.icon} {challenge.title}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-3 rounded-xl border border-brand-border bg-brand-card-alt/60 p-4" aria-live="polite">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">Selected challenge</p>
          <ChallengePreviewCard challenge={selected} />
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {popover && previewed && (
            <motion.div
              key={popover.challengeId}
              id={`${popoverId}-popover`}
              role="tooltip"
              initial={{ opacity: 0, y: popover.above ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE }}
              style={{
                position: 'fixed',
                left: popover.left,
                top: popover.top,
                width: popover.width,
                translate: popover.above ? '0 -100%' : undefined,
              }}
              className="pointer-events-none z-[70] rounded-xl border border-brand-border bg-brand-card p-4 shadow-xl"
            >
              <ChallengePreviewCard challenge={previewed} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
