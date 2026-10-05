import { useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { TERMS_SECTIONS, TERMS_TITLE } from '../../../constants/terms';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="card relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl p-6 shadow-xl"
      >
        <h2 id="terms-modal-title" className="text-lg font-bold text-brand-text">
          {TERMS_TITLE}
        </h2>
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 text-sm text-brand-text-secondary">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.heading}>
              <h3 className="font-semibold text-brand-text">{section.heading}</h3>
              <p className="mt-1">{section.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-5">
          <Button type="button" variant="primary" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
