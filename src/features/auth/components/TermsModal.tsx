import { useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import { TERMS_LAST_UPDATED, TERMS_TITLE } from '../../../constants/terms';
import { ROUTES } from '../../../constants/routes';
import TermsContent from './TermsContent';

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
        className="card relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl p-6 shadow-xl"
      >
        <h2 id="terms-modal-title" className="text-lg font-bold text-brand-text">
          {TERMS_TITLE}
        </h2>
        <p className="mt-1 text-xs text-brand-text-muted">
          Last updated {TERMS_LAST_UPDATED}.{' '}
          <Link to={ROUTES.terms} target="_blank" rel="noreferrer" className="font-semibold text-brand-primary-light underline">
            Open as a full page
          </Link>
        </p>
        <div className="mt-4 overflow-y-auto pr-1">
          <TermsContent headingLevel="h3" />
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
